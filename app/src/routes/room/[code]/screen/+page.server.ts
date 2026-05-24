import { db } from '$lib/db';
import { rooms, songHistory } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, params.code) });
  if (!room) throw error(404, 'Room not found');

  const history = await db
    .select()
    .from(songHistory)
    .where(eq(songHistory.roomId, params.code))
    .orderBy(desc(songHistory.playedAt))
    .limit(8);

  return {
    room: { id: room.id, name: room.name },
    initialHistory: history,
    appUrl: url.origin
  };
};
