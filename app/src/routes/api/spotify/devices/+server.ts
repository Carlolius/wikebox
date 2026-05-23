import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { rooms } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/auth';
import { getSpotifyToken, getDevices, transferPlayback } from '$lib/spotify/client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, request }) => {
  const roomId = url.searchParams.get('room');
  if (!roomId) throw error(400, 'room required');

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Not authenticated');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  if (!room || room.adminId !== session.user.id) throw error(403, 'Not room admin');

  const token = await getSpotifyToken(room.adminId);
  if (!token) throw error(503, 'Spotify not connected');

  const devices = await getDevices(token);
  return json(devices);
};

export const POST: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Not authenticated');

  const { roomId, deviceId } = await request.json() as { roomId: string; deviceId: string };
  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  if (!room || room.adminId !== session.user.id) throw error(403, 'Not room admin');

  const token = await getSpotifyToken(room.adminId);
  if (!token) throw error(503, 'Spotify not connected');

  await transferPlayback(deviceId, token);
  await db.update(rooms).set({ activeDeviceId: deviceId }).where(eq(rooms.id, roomId));
  return json({ ok: true });
};
