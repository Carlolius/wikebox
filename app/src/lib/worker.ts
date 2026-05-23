import { db } from './db';
import { rooms, songs, nowPlaying, songHistory, skipVotes, votes } from './db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getSpotifyToken, getCurrentlyPlaying, addToQueue, skipToNext } from './spotify/client';
import { broadcast, activeConnections } from './sse';
import { nanoid } from 'nanoid';

let started = false;
const lastQueuedUri: Record<string, string | null> = {};

export function startWorker() {
  if (started) return;
  started = true;
  setInterval(tick, 8000);
  console.log('[worker] started');
}

async function tick() {
  const allRooms = await db.select().from(rooms);
  for (const room of allRooms) {
    try {
      await processRoom(room);
    } catch (e) {
      console.error(`[worker] room ${room.id} error:`, e);
    }
  }
}

async function processRoom(room: typeof rooms.$inferSelect) {
  const token = await getSpotifyToken(room.adminId);
  if (!token) return;

  const current = await getCurrentlyPlaying(token);
  if (!current) {
    await db.delete(nowPlaying).where(eq(nowPlaying.roomId, room.id));
    return;
  }

  const prev = await db.query.nowPlaying.findFirst({ where: eq(nowPlaying.roomId, room.id) });

  // Song changed: archive old top-of-queue to history
  if (prev && prev.spotifyUri !== current.item.uri) {
    const top = await getTopSong(room.id);
    if (top && top.spotifyUri === prev.spotifyUri) {
      const voteResult = db
        .select({ total: sql<number>`coalesce(sum(${votes.value}), 0)` })
        .from(votes)
        .where(eq(votes.songId, top.id))
        .get();

      await db.insert(songHistory).values({
        id: nanoid(),
        roomId: room.id,
        spotifyUri: top.spotifyUri,
        title: top.title,
        artists: top.artists,
        albumArt: top.albumArt,
        durationMs: top.durationMs,
        totalVotes: voteResult?.total ?? 0,
        addedBy: top.addedBy,
        addedByName: top.addedByName
      });
      await db.delete(songs).where(eq(songs.id, top.id));
      await db.delete(skipVotes).where(eq(skipVotes.roomId, room.id));
      lastQueuedUri[room.id] = null;

      broadcast(room.id, 'queue-update', { type: 'song-changed' });
    }
  }

  // Update now_playing
  const np = {
    roomId: room.id,
    spotifyUri: current.item.uri,
    title: current.item.name,
    artists: (current.item.artists as { name: string }[]).map(a => a.name).join(', '),
    albumArt: (current.item.album as { images: { url: string }[] })?.images?.[0]?.url ?? null,
    durationMs: current.item.duration_ms,
    progressMs: current.progress_ms,
    isPlaying: current.is_playing
  };

  if (!prev) {
    await db.insert(nowPlaying).values(np);
  } else {
    await db.update(nowPlaying).set(np).where(eq(nowPlaying.roomId, room.id));
  }

  broadcast(room.id, 'now-playing', np);

  // Check skip vote threshold
  if (!room.djMode) {
    await checkSkipThreshold(room, token);
  }

  // Auto-queue next song ~30s before end
  if (!room.djMode) {
    const remaining = current.item.duration_ms - current.progress_ms;
    if (remaining < 30000) {
      const next = await getTopSong(room.id);
      if (next && lastQueuedUri[room.id] !== next.spotifyUri) {
        const ok = await addToQueue(next.spotifyUri, token, room.activeDeviceId ?? undefined);
        if (ok) {
          lastQueuedUri[room.id] = next.spotifyUri;
          broadcast(room.id, 'queue-update', { type: 'next-queued', uri: next.spotifyUri });
        }
      }
    }
  }
}

async function checkSkipThreshold(room: typeof rooms.$inferSelect, token: string) {
  const active = activeConnections(room.id);
  if (active < 1) return;

  const skipCount = db
    .select({ count: sql<number>`count(*)` })
    .from(skipVotes)
    .where(eq(skipVotes.roomId, room.id))
    .get();

  const count = skipCount?.count ?? 0;
  const required = Math.max(1, Math.ceil(active * room.skipThreshold / 100));

  if (count >= required) {
    await skipToNext(token, room.activeDeviceId ?? undefined);
    await db.delete(skipVotes).where(eq(skipVotes.roomId, room.id));
    lastQueuedUri[room.id] = null;
    broadcast(room.id, 'queue-update', { type: 'skip' });
  }
}

async function getTopSong(roomId: string) {
  const results = await db
    .select({
      song: songs,
      voteScore: sql<number>`coalesce(sum(${votes.value}), 0)`.as('vote_score')
    })
    .from(songs)
    .leftJoin(votes, eq(votes.songId, songs.id))
    .where(eq(songs.roomId, roomId))
    .groupBy(songs.id)
    .orderBy(desc(sql`vote_score`), songs.createdAt)
    .limit(1);

  return results[0]?.song ?? null;
}
