import { subscribe } from '$lib/sse';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
  const { code } = params;
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => controller.enqueue(new TextEncoder().encode(data));
      send('event: connected\ndata: {}\n\n');
      unsubscribe = subscribe(code, send);
    },
    cancel() {
      unsubscribe?.();
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
