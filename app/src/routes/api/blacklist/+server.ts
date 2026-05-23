import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { blacklist, rooms } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '$lib/auth';
import { nanoid } from 'nanoid';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, request }) => {
  const roomId = url.searchParams.get('room');
  if (!roomId) throw error(400, 'room required');

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Not authenticated');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  if (!room || room.adminId !== session.user.id) throw error(403, 'Not room admin');

  const items = await db.select().from(blacklist).where(eq(blacklist.roomId, roomId));
  return json(items);
};

export const POST: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Not authenticated');

  const { roomId, spotifyUri, artistName } = await request.json() as {
    roomId: string;
    spotifyUri?: string;
    artistName?: string;
  };

  if (!roomId) throw error(400, 'roomId required');
  if (!spotifyUri && !artistName) throw error(400, 'spotifyUri or artistName required');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  if (!room || room.adminId !== session.user.id) throw error(403, 'Not room admin');

  await db.insert(blacklist).values({
    id: nanoid(),
    roomId,
    spotifyUri: spotifyUri ?? null,
    artistName: artistName ?? null
  });

  return json({ ok: true }, { status: 201 });
};

export const DELETE: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Not authenticated');

  const { id, roomId } = await request.json() as { id: string; roomId: string };

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  if (!room || room.adminId !== session.user.id) throw error(403, 'Not room admin');

  await db.delete(blacklist).where(and(eq(blacklist.id, id), eq(blacklist.roomId, roomId)));
  return json({ ok: true });
};
