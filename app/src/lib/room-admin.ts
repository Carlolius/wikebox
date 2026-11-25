import { error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { rooms } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/auth';

/** Load a room and fail with 401/403/404 unless the current user is its admin. */
export async function requireRoomAdmin(request: Request, roomId: string) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Not authenticated');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
  if (!room) throw error(404, 'Room not found');
  if (room.adminId !== session.user.id) throw error(403, 'Not room admin');

  return room;
}
