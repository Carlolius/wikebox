import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { skipVotes, rooms, nowPlaying } from '$lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { activeConnections } from '$lib/sse';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const voterId = cookies.get('wike_visitor');
  if (!voterId) throw error(400, 'No visitor cookie');

  const { roomId } = await request.json() as { roomId: string };

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  if (!room) throw error(404, 'Room not found');

  const np = await db.query.nowPlaying.findFirst({ where: eq(nowPlaying.roomId, roomId) });
  if (!np) throw error(400, 'Nothing playing');

  const existing = await db.query.skipVotes.findFirst({
    where: and(eq(skipVotes.roomId, roomId), eq(skipVotes.voterId, voterId))
  });

  if (existing) {
    await db.delete(skipVotes).where(eq(skipVotes.id, existing.id));
    return json({ action: 'removed', ...await getSkipStatus(roomId, room.skipThreshold) });
  }

  await db.insert(skipVotes).values({ id: nanoid(), roomId, voterId });
  return json({ action: 'added', ...await getSkipStatus(roomId, room.skipThreshold) }, { status: 201 });
};

export const GET: RequestHandler = async ({ url }) => {
  const roomId = url.searchParams.get('room');
  if (!roomId) throw error(400, 'room required');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  if (!room) throw error(404, 'Room not found');

  return json(await getSkipStatus(roomId, room.skipThreshold));
};

async function getSkipStatus(roomId: string, threshold: number) {
  const countResult = db
    .select({ count: sql<number>`count(*)` })
    .from(skipVotes)
    .where(eq(skipVotes.roomId, roomId))
    .get();

  const count = countResult?.count ?? 0;
  const active = activeConnections(roomId);
  const required = Math.max(1, Math.ceil(active * threshold / 100));

  return { skipCount: count, activeUsers: active, required, threshold };
}
