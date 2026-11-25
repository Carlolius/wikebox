import { subscribe } from '$lib/sse';
import { touchVisitor } from '$lib/visitors';
import { db } from '$lib/db';
import { rooms } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, cookies, url }) => {
  const { code } = params;
  let unsubscribe: (() => void) | undefined;

  // The TV screen is not a guest: it doesn't show up in the participant list
  // and doesn't count towards the skip threshold.
  const isScreen = url.searchParams.has('screen');
  let visitorId = isScreen ? null : cookies.get('wike_visitor') ?? null;

  if (visitorId) {
    const room = await db.query.rooms.findFirst({ where: eq(rooms.id, code), columns: { id: true } });
    if (room) touchVisitor(code, visitorId);
    else visitorId = null;
  }

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => controller.enqueue(new TextEncoder().encode(data));
      send('event: connected\ndata: {}\n\n');
      unsubscribe = subscribe(code, send, visitorId);
    },
    cancel() {
      unsubscribe?.();
      if (visitorId) {
        try { touchVisitor(code, visitorId); } catch { /* room deleted meanwhile */ }
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
};
