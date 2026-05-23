import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { rooms } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSpotifyToken, searchTracks } from '$lib/spotify/client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q');
  const roomId = url.searchParams.get('room');
  if (!q || !roomId) throw error(400, 'q and room required');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  if (!room) throw error(404, 'Room not found');

  const token = await getSpotifyToken(room.adminId);
  if (!token) throw error(503, 'Spotify not connected');

  const tracks = await searchTracks(q, token);
  return json(tracks);
};
