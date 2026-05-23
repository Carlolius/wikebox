import { db } from '$lib/db';
import { rooms } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import QRCode from 'qrcode';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, request, url }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw redirect(302, '/');

  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, params.code) });
  if (!room) throw error(404, 'Room not found');
  if (room.adminId !== session.user.id) throw error(403, 'Not room admin');

  const shareUrl = `${url.origin}/room/${params.code}`;
  const qrDataUrl = await QRCode.toDataURL(shareUrl, {
    width: 200,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });

  return { room, qrDataUrl, shareUrl };
};
