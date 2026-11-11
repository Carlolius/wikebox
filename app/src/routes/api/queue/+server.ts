import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { songs, votes, rooms, blacklist } from '$lib/db/schema';
import { eq, sql, desc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { broadcast } from '$lib/sse';
import type { Cookies } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function getVoterId(request: Request, cookies: Cookies): string {
  let id = cookies.get('wike_visitor');
  if (!id) {
    id = nanoid(16);
    cookies.set('wike_visitor', id, { path: '/', maxAge: 60 * 60 * 24 * 365, httpOnly: true });
  }
  return id;
}

export const GET: RequestHandler = async ({ url, cookies }) => {
  const roomId = url.searchParams.get('room');
  if (!roomId) throw error(400, 'room required');

  const voterId = cookies.get('wike_visitor') ?? '';

  const queue = await db
    .select({
      id: songs.id,
      spotifyUri: songs.spotifyUri,
      title: songs.title,
      artists: songs.artists,
      albumArt: songs.albumArt,
      durationMs: songs.durationMs,
      addedBy: songs.addedBy,
      addedByName: songs.addedByName,
      status: songs.status,
      createdAt: songs.createdAt,
      voteScore: sql<number>`coalesce(sum(${votes.value}), 0)`.as('vote_score'),
      myVote: sql<number | null>`max(case when ${votes.voterId} = ${voterId} then ${votes.value} end)`.as('my_vote')
    })
    .from(songs)
    .leftJoin(votes, eq(votes.songId, songs.id))
    .where(eq(songs.roomId, roomId))
    .groupBy(songs.id)
    .orderBy(desc(sql`vote_score`), songs.createdAt);

  return json(queue);
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  const voterId = getVoterId(request, cookies);
  const body = await request.json() as {
    roomId: string;
    spotifyUri: string;
    title: string;
    artists: string;
    albumArt?: string;
    durationMs: number;
    addedByName?: string;
  };

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, body.roomId) });
  if (!room) throw error(404, 'Room not found');

  // Duplicate check
  const exists = await db.query.songs.findFirst({
    where: and(eq(songs.roomId, body.roomId), eq(songs.spotifyUri, body.spotifyUri))
  });
  if (exists) throw error(409, 'Song already in queue');

  // Blacklist check
  const blocked = await db.query.blacklist.findFirst({
    where: and(eq(blacklist.roomId, body.roomId), eq(blacklist.spotifyUri, body.spotifyUri))
  });
  if (blocked) throw error(403, 'Song is blocked in this room');

  const id = nanoid();
  await db.insert(songs).values({
    id,
    roomId: body.roomId,
    spotifyUri: body.spotifyUri,
    title: body.title,
    artists: body.artists,
    albumArt: body.albumArt ?? null,
    durationMs: body.durationMs,
    addedBy: voterId,
    addedByName: body.addedByName ?? 'Guest'
  });

  broadcast(body.roomId, 'queue-update', { type: 'song-added', songId: id });
  return json({ id }, { status: 201 });
};
