import { db } from './db';
import { rooms, songs, nowPlaying, songHistory, skipVotes, votes } from './db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { getSpotifyToken, getCurrentlyPlaying, addToQueue, skipToNext } from './spotify/client';
import { broadcast, activeConnections } from './sse';
import { nanoid } from 'nanoid';

let started = false;

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

  // Song changed: archive the song that was queued to Spotify (if it matches prev)
  if (prev && prev.spotifyUri !== current.item.uri) {
    const queuedSong = await db.query.songs.findFirst({
      where: and(eq(songs.roomId, room.id), eq(songs.status, 'queued'))
    });

    if (queuedSong && queuedSong.spotifyUri === prev.spotifyUri) {
      const voteResult = db
        .select({ total: sql<number>`coalesce(sum(${votes.value}), 0)` })
        .from(votes)
        .where(eq(votes.songId, queuedSong.id))
        .get();

      await db.insert(songHistory).values({
        id: nanoid(),
        roomId: room.id,
        spotifyUri: queuedSong.spotifyUri,
        title: queuedSong.title,
        artists: queuedSong.artists,
        albumArt: queuedSong.albumArt,
        durationMs: queuedSong.durationMs,
        totalVotes: voteResult?.total ?? 0,
        addedBy: queuedSong.addedBy,
        addedByName: queuedSong.addedByName
      });
      await db.delete(songs).where(eq(songs.id, queuedSong.id));
      await db.delete(skipVotes).where(eq(skipVotes.roomId, room.id));

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

  if (!room.djMode) {
    await checkSkipThreshold(room, token);
  }

  // Auto-queue next pending song ~45s before current song ends
  if (!room.djMode) {
    const remaining = current.item.duration_ms - current.progress_ms;
    if (remaining < 45000) {
      // Check if a song is already queued to Spotify
      const alreadyQueued = await db.query.songs.findFirst({
        where: and(eq(songs.roomId, room.id), eq(songs.status, 'queued'))
      });

      if (!alreadyQueued) {
        const next = await getTopPendingSong(room.id);
        if (next) {
          const ok = await addToQueue(next.spotifyUri, token, room.activeDeviceId ?? undefined);
          if (ok) {
            await db.update(songs).set({ status: 'queued' }).where(eq(songs.id, next.id));
            broadcast(room.id, 'queue-update', { type: 'next-queued', uri: next.spotifyUri });
          }
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
    broadcast(room.id, 'queue-update', { type: 'skip' });
  }
}

async function getTopPendingSong(roomId: string) {
  const results = await db
    .select({
      song: songs,
      voteScore: sql<number>`coalesce(sum(${votes.value}), 0)`.as('vote_score')
    })
    .from(songs)
    .leftJoin(votes, eq(votes.songId, songs.id))
    .where(and(eq(songs.roomId, roomId), eq(songs.status, 'pending')))
    .groupBy(songs.id)
    .orderBy(desc(sql`vote_score`), songs.createdAt)
    .limit(1);

  return results[0]?.song ?? null;
}
