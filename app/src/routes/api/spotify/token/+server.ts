import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { rooms } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/auth';
import { getSpotifyToken } from '$lib/spotify/client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, url }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Unauthorized');

  const roomId = url.searchParams.get('room');
  if (!roomId) throw error(400, 'room required');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  if (!room) throw error(404, 'Room not found');
  if (room.adminId !== session.user.id) throw error(403, 'Not room admin');

  const token = await getSpotifyToken(session.user.id);
  if (!token) throw error(500, 'No Spotify token available');

  return json({ token });
};
