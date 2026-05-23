import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { rooms, songHistory, account } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '$lib/auth';
import { getSpotifyToken, createPlaylistFromHistory } from '$lib/spotify/client';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Not authenticated');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, params.id) });
  if (!room) throw error(404, 'Room not found');
  if (room.adminId !== session.user.id) throw error(403, 'Not room admin');

  const { name } = await request.json() as { name: string };
  if (!name?.trim()) throw error(400, 'Playlist name required');

  const history = await db
    .select({ spotifyUri: songHistory.spotifyUri })
    .from(songHistory)
    .where(eq(songHistory.roomId, params.id))
    .orderBy(desc(songHistory.playedAt))
    .limit(200);

  if (history.length === 0) throw error(400, 'No song history to export');

  const token = await getSpotifyToken(room.adminId);
  if (!token) throw error(503, 'Spotify not connected');

  // Get Spotify user ID from account
  const acc = await db.query.account.findFirst({ where: eq(account.userId, room.adminId) });
  if (!acc) throw error(503, 'Account not found');

  const uris = history.map(h => h.spotifyUri);
  const playlistId = await createPlaylistFromHistory(name.trim(), uris, token, acc.accountId);

  if (!playlistId) throw error(502, 'Failed to create playlist');

  return json({ playlistId });
};
