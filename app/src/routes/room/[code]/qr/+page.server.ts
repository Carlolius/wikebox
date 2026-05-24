import { db } from '$lib/db';
import { rooms } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import QRCode from 'qrcode';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
  const room = await db.query.rooms.findFirst({ where: eq(rooms.id, params.code) });
  if (!room) throw error(404, 'Room not found');

  const shareUrl = `${url.origin}/room/${params.code}`;
  const qrDataUrl = await QRCode.toDataURL(shareUrl, {
    width: 600,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });

  return { room: { id: room.id, name: room.name }, qrDataUrl, shareUrl };
};
