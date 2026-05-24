import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import { rooms } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, params.id) });
  if (!room) throw error(404, 'Room not found');

  return json({
    id: room.id,
    name: room.name,
    playbackMode: room.playbackMode,
    djMode: room.djMode,
    creditsEnabled: room.creditsEnabled,
    creditsPerHour: room.creditsPerHour,
    skipThreshold: room.skipThreshold,
    genreFilter: room.genreFilter
  });
};

export const PATCH: RequestHandler = async ({ request, params }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Not authenticated');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, params.id) });
  if (!room) throw error(404, 'Room not found');
  if (room.adminId !== session.user.id) throw error(403, 'Not room admin');

  const body = await request.json() as {
    djMode?: boolean;
    creditsEnabled?: boolean;
    creditsPerHour?: number;
    skipThreshold?: number;
    genreFilter?: string | null;
    welcomeMessage?: string | null;
    activeDeviceId?: string | null;
  };

  await db.update(rooms)
    .set({
      ...(body.djMode !== undefined ? { djMode: body.djMode } : {}),
      ...(body.creditsEnabled !== undefined ? { creditsEnabled: body.creditsEnabled } : {}),
      ...(body.creditsPerHour !== undefined ? { creditsPerHour: body.creditsPerHour } : {}),
      ...(body.skipThreshold !== undefined ? { skipThreshold: body.skipThreshold } : {}),
      ...(body.genreFilter !== undefined ? { genreFilter: body.genreFilter } : {}),
      ...(body.welcomeMessage !== undefined ? { welcomeMessage: body.welcomeMessage } : {}),
      ...(body.activeDeviceId !== undefined ? { activeDeviceId: body.activeDeviceId } : {})
    })
    .where(eq(rooms.id, params.id));

  return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ request, params }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw error(401, 'Not authenticated');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, params.id) });
  if (!room) throw error(404, 'Room not found');
  if (room.adminId !== session.user.id) throw error(403, 'Not room admin');

  await db.delete(rooms).where(eq(rooms.id, params.id));
  return json({ ok: true });
};
