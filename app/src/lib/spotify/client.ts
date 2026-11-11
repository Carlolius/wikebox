import { db } from '$lib/db';
import { account } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

// Get a valid Spotify access token for a room admin, refreshing if needed
export async function getSpotifyToken(adminId: string): Promise<string | null> {
  const acc = await db.query.account.findFirst({
    where: eq(account.userId, adminId) // better-auth stores provider as 'spotify'
  });
  if (!acc?.accessToken) return null;

  const now = new Date();
  const expiresAt = acc.accessTokenExpiresAt;

  if (expiresAt && expiresAt > now) {
    return acc.accessToken;
  }

  // Token expired, refresh it
  if (!acc.refreshToken) return null;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: acc.refreshToken,
      client_id: env.SPOTIFY_CLIENT_ID ?? '',
      client_secret: env.SPOTIFY_CLIENT_SECRET ?? ''
    })
  });

  if (!response.ok) return null;

  const data = await response.json() as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };

  const newExpiry = new Date(Date.now() + data.expires_in * 1000);

  await db.update(account)
    .set({
      accessToken: data.access_token,
      accessTokenExpiresAt: newExpiry,
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {})
    })
    .where(eq(account.userId, adminId));

  return data.access_token;
}

export interface SpotifyTrack {
  uri: string;
  name: string;
  artists: string;
  albumArt: string | null;
  durationMs: number;
}

export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

export async function searchTracks(query: string, token: string): Promise<SpotifyTrack[]> {
  const url = new URL('https://api.spotify.com/v1/search');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'track');
  url.searchParams.set('limit', '10');

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];

  const data = await res.json() as { tracks: { items: SpotifyRawTrack[] } };
  return data.tracks.items.map(normalizeTrack);
}

export async function getCurrentlyPlaying(token: string) {
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 204 || !res.ok) return null;
  return res.json() as Promise<SpotifyCurrentlyPlaying>;
}

export async function getDevices(token: string): Promise<SpotifyDevice[]> {
  const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json() as { devices: SpotifyRawDevice[] };
  return data.devices.map(d => ({
    id: d.id,
    name: d.name,
    type: d.type,
    isActive: d.is_active
  }));
}

export async function addToQueue(uri: string, token: string, deviceId?: string): Promise<boolean> {
  const url = new URL('https://api.spotify.com/v1/me/player/queue');
  url.searchParams.set('uri', uri);
  if (deviceId) url.searchParams.set('device_id', deviceId);

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.ok;
}

export async function skipToNext(token: string, deviceId?: string): Promise<boolean> {
  const url = new URL('https://api.spotify.com/v1/me/player/next');
  if (deviceId) url.searchParams.set('device_id', deviceId);
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.ok;
}

export async function transferPlayback(deviceId: string, token: string): Promise<boolean> {
  const res = await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ device_ids: [deviceId], play: true })
  });
  return res.ok;
}

export async function getPlaylists(token: string) {
  const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json() as { items: SpotifyRawPlaylist[] };
  return data.items.map(p => ({ id: p.id, name: p.name, image: p.images?.[0]?.url ?? null }));
}

export async function getPlaylistTracks(playlistId: string, token: string): Promise<SpotifyTrack[]> {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return [];
  const data = await res.json() as { items: { track: SpotifyRawTrack }[] };
  return data.items.filter(i => i.track).map(i => normalizeTrack(i.track));
}

export async function createPlaylistFromHistory(
  name: string,
  uris: string[],
  token: string,
  userId: string
): Promise<string | null> {
  const createRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, public: false, description: 'Saved by Wikebox' })
  });
  if (!createRes.ok) return null;
  const playlist = await createRes.json() as { id: string };

  for (let i = 0; i < uris.length; i += 100) {
    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: uris.slice(i, i + 100) })
    });
  }

  return playlist.id;
}

// Internal types
interface SpotifyRawTrack {
  uri: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  duration_ms: number;
}
interface SpotifyRawDevice { id: string; name: string; type: string; is_active: boolean }
interface SpotifyRawPlaylist { id: string; name: string; images?: { url: string }[] }
interface SpotifyCurrentlyPlaying {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyRawTrack & {
    duration_ms: number;
    album: { images: { url: string }[] };
  };
}

function normalizeTrack(t: SpotifyRawTrack): SpotifyTrack {
  return {
    uri: t.uri,
    name: t.name,
    artists: t.artists.map(a => a.name).join(', '),
    albumArt: t.album.images?.[0]?.url ?? null,
    durationMs: t.duration_ms
  };
}
