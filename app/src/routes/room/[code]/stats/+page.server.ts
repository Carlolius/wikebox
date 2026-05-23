import { db } from '$lib/db';
import { rooms, songs, songHistory, votes } from '$lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, params.code) });
  if (!room) throw error(404, 'Room not found');

  // Top 10 most voted songs ever played
  const topSongs = await db
    .select({
      title: songHistory.title,
      artists: songHistory.artists,
      albumArt: songHistory.albumArt,
      totalVotes: songHistory.totalVotes,
      playedAt: songHistory.playedAt,
      addedByName: songHistory.addedByName
    })
    .from(songHistory)
    .where(eq(songHistory.roomId, params.code))
    .orderBy(desc(songHistory.totalVotes))
    .limit(10);

  // Total songs played
  const totalPlayedResult = db
    .select({ count: sql<number>`count(*)` })
    .from(songHistory)
    .where(eq(songHistory.roomId, params.code))
    .get();
  const totalPlayed = totalPlayedResult?.count ?? 0;

  // Top contributors (by songs added to history)
  const contributors = await db
    .select({
      addedBy: songHistory.addedBy,
      name: songHistory.addedByName,
      songCount: sql<number>`count(*)`.as('song_count'),
      totalVotes: sql<number>`coalesce(sum(${songHistory.totalVotes}), 0)`.as('total_votes')
    })
    .from(songHistory)
    .where(eq(songHistory.roomId, params.code))
    .groupBy(songHistory.addedBy)
    .orderBy(desc(sql`song_count`))
    .limit(5);

  // Current queue length
  const queueLenResult = db
    .select({ count: sql<number>`count(*)` })
    .from(songs)
    .where(eq(songs.roomId, params.code))
    .get();
  const queueLength = queueLenResult?.count ?? 0;

  // Most voted song in current queue
  const topQueued = await db
    .select({
      title: songs.title,
      artists: songs.artists,
      albumArt: songs.albumArt,
      voteScore: sql<number>`coalesce(sum(${votes.value}), 0)`.as('vote_score')
    })
    .from(songs)
    .leftJoin(votes, eq(votes.songId, songs.id))
    .where(eq(songs.roomId, params.code))
    .groupBy(songs.id)
    .orderBy(desc(sql`vote_score`))
    .limit(1);

  return {
    room: { id: room.id, name: room.name },
    topSongs,
    totalPlayed,
    contributors,
    queueLength,
    topQueued: topQueued[0] ?? null
  };
};
