import { db } from '$lib/db';
import { rooms, songs, votes, nowPlaying } from '$lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, params.code) });
  if (!room) throw error(404, 'Room not found');

  let voterId = cookies.get('wike_visitor');
  if (!voterId) {
    voterId = nanoid(16);
    cookies.set('wike_visitor', voterId, { path: '/', maxAge: 60 * 60 * 24 * 365, httpOnly: true });
  }

  const queue = await db
    .select({
      id: songs.id,
      spotifyUri: songs.spotifyUri,
      title: songs.title,
      artists: songs.artists,
      albumArt: songs.albumArt,
      durationMs: songs.durationMs,
      addedByName: songs.addedByName,
      createdAt: songs.createdAt,
      voteScore: sql<number>`coalesce(sum(${votes.value}), 0)`.as('vote_score'),
      myVote: sql<number | null>`max(case when ${votes.voterId} = ${voterId} then ${votes.value} end)`.as('my_vote')
    })
    .from(songs)
    .leftJoin(votes, eq(votes.songId, songs.id))
    .where(eq(songs.roomId, params.code))
    .groupBy(songs.id)
    .orderBy(desc(sql`vote_score`), songs.createdAt);

  const np = await db.query.nowPlaying.findFirst({ where: eq(nowPlaying.roomId, params.code) });

  return {
    room: { id: room.id, name: room.name, playbackMode: room.playbackMode, djMode: room.djMode },
    queue,
    nowPlaying: np ?? null,
    voterId
  };
};
