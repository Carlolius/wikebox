import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { roomVisitors, songs, votes, skipVotes } from '$lib/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { broadcast, sendToVisitor } from '$lib/sse';
import { requireRoomAdmin } from '$lib/room-admin';
import type { RequestHandler } from './$types';

async function readVisitorId(request: Request): Promise<string> {
  const body = await request.json().catch(() => null) as { visitorId?: unknown } | null;
  if (typeof body?.visitorId !== 'string' || !body.visitorId) throw error(400, 'visitorId required');
  return body.visitorId;
}

// Kick a guest: from now on they can watch the room but not add songs, vote or skip.
// Their pending songs, votes and skip vote in this room are removed.
export const POST: RequestHandler = async ({ request, params, cookies }) => {
  await requireRoomAdmin(request, params.id);
  const roomId = params.id;
  const visitorId = await readVisitorId(request);
  if (visitorId === cookies.get('wike_visitor')) throw error(400, 'You cannot ban yourself');

  const now = new Date();
  db.transaction((tx) => {
    tx.insert(roomVisitors)
      .values({ roomId, visitorId, firstSeenAt: now, lastSeenAt: now, bannedAt: now })
      .onConflictDoUpdate({ target: [roomVisitors.roomId, roomVisitors.visitorId], set: { bannedAt: now } })
      .run();

    const roomSongIds = tx.select({ id: songs.id }).from(songs).where(eq(songs.roomId, roomId)).all().map(s => s.id);
    if (roomSongIds.length) {
      tx.delete(votes).where(and(eq(votes.voterId, visitorId), inArray(votes.songId, roomSongIds))).run();
    }
    // Songs already sent to Spotify ('queued') can't be pulled back, so only pending ones go.
    tx.delete(songs).where(and(eq(songs.roomId, roomId), eq(songs.addedBy, visitorId), eq(songs.status, 'pending'))).run();
    tx.delete(skipVotes).where(and(eq(skipVotes.roomId, roomId), eq(skipVotes.voterId, visitorId))).run();
  });

  sendToVisitor(roomId, visitorId, 'banned', {});
  broadcast(roomId, 'queue-update', { type: 'visitor-banned' });
  return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ request, params }) => {
  await requireRoomAdmin(request, params.id);
  const visitorId = await readVisitorId(request);

  db.update(roomVisitors)
    .set({ bannedAt: null })
    .where(and(eq(roomVisitors.roomId, params.id), eq(roomVisitors.visitorId, visitorId)))
    .run();

  sendToVisitor(params.id, visitorId, 'unbanned', {});
  return json({ ok: true });
};
