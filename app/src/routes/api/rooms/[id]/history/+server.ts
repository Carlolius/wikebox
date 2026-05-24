import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { songHistory } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const history = await db
    .select()
    .from(songHistory)
    .where(eq(songHistory.roomId, params.id))
    .orderBy(desc(songHistory.playedAt))
    .limit(8);

  return json(history);
};
