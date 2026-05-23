import { auth } from '$lib/auth';
import { startWorker } from '$lib/worker';
import type { Handle } from '@sveltejs/kit';

startWorker();

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api/auth')) {
    return auth.handler(event.request);
  }
  return resolve(event);
};
