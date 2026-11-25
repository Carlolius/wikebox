import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { roomVisitors, songs, songHistory, votes } from '$lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { connectedVisitors } from '$lib/sse';
import { requireRoomAdmin } from '$lib/room-admin';
import type { Participant } from '$lib/participants';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, params, cookies }) => {
  await requireRoomAdmin(request, params.id);
  const roomId = params.id;
  const online = connectedVisitors(roomId);

  const people = new Map<string, Participant>();
  const get = (visitorId: string): Participant => {
    let p = people.get(visitorId);
    if (!p) {
      p = { visitorId, name: null, online: false, isYou: false, songsAdded: 0, votesCast: 0, lastSeenAt: null, bannedAt: null };
      people.set(visitorId, p);
    }
    return p;
  };

  for (const v of db.select().from(roomVisitors).where(eq(roomVisitors.roomId, roomId)).all()) {
    const p = get(v.visitorId);
    p.name = v.name;
    p.lastSeenAt = v.lastSeenAt.getTime();
    p.bannedAt = v.bannedAt?.getTime() ?? null;
  }

  // Songs still in the queue and songs already played; also fills in names for
  // guests who joined before visitors were tracked.
  const added = [
    ...db.select({ by: songs.addedBy, name: songs.addedByName, n: sql<number>`count(*)` })
      .from(songs).where(eq(songs.roomId, roomId)).groupBy(songs.addedBy).all(),
    ...db.select({ by: songHistory.addedBy, name: songHistory.addedByName, n: sql<number>`count(*)` })
      .from(songHistory).where(eq(songHistory.roomId, roomId)).groupBy(songHistory.addedBy).all()
  ];
  for (const a of added) {
    if (!a.by) continue;
    const p = get(a.by);
    p.songsAdded += a.n;
    if (!p.name && a.name && a.name !== 'Guest') p.name = a.name;
  }

  const voteCounts = db
    .select({ by: votes.voterId, n: sql<number>`count(*)` })
    .from(votes)
    .innerJoin(songs, eq(songs.id, votes.songId))
    .where(eq(songs.roomId, roomId))
    .groupBy(votes.voterId)
    .all();
  for (const v of voteCounts) get(v.by).votesCast = v.n;

  for (const id of online) get(id).online = true;

  const me = cookies.get('wike_visitor');
  if (me && people.has(me)) people.get(me)!.isYou = true;

  const list = [...people.values()].sort((a, b) =>
    Number(!!a.bannedAt) - Number(!!b.bannedAt) ||
    Number(b.online) - Number(a.online) ||
    (b.lastSeenAt ?? 0) - (a.lastSeenAt ?? 0)
  );

  return json(list);
};
