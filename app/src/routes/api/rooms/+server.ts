import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { rooms } from '$lib/db/schema';
import { auth } from '$lib/auth';
import { customAlphabet } from 'nanoid';
import type { RequestHandler } from './$types';

const roomId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

export const POST: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Not authenticated');

  const { name, playbackMode } = await request.json() as { name: string; playbackMode?: 'sdk' | 'connect' };
  if (!name?.trim()) throw error(400, 'Room name required');

  const id = roomId();
  await db.insert(rooms).values({
    id,
    name: name.trim(),
    adminId: session.user.id,
    playbackMode: playbackMode ?? 'sdk'
  });

  return json({ id });
};
