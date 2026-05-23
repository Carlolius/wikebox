import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { votes, songs } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { broadcast } from '$lib/sse';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const voterId = cookies.get('wike_visitor');
  if (!voterId) throw error(400, 'No visitor cookie');

  const { songId, value } = await request.json() as { songId: string; value: 1 | -1 };
  if (value !== 1 && value !== -1) throw error(400, 'value must be 1 or -1');

  const song = await db.query.songs.findFirst({ where: eq(songs.id, songId) });
  if (!song) throw error(404, 'Song not found');

  const existing = await db.query.votes.findFirst({
    where: and(eq(votes.songId, songId), eq(votes.voterId, voterId))
  });

  if (existing) {
    if (existing.value === value) {
      // Withdraw vote
      await db.delete(votes).where(eq(votes.id, existing.id));
      broadcast(song.roomId, 'queue-update', { type: 'vote-changed', songId });
      return json({ action: 'removed' });
    } else {
      // Change vote
      await db.update(votes).set({ value }).where(eq(votes.id, existing.id));
      broadcast(song.roomId, 'queue-update', { type: 'vote-changed', songId });
      return json({ action: 'updated' });
    }
  }

  await db.insert(votes).values({ id: nanoid(), songId, voterId, value });
  broadcast(song.roomId, 'queue-update', { type: 'vote-changed', songId });
  return json({ action: 'added' }, { status: 201 });
};
