import { db } from '$lib/db';
import { roomVisitors } from '$lib/db/schema';
import { and, eq, isNotNull } from 'drizzle-orm';

/** Record that a guest is in the room; updates the name when one is given. */
export function touchVisitor(roomId: string, visitorId: string, name?: string | null): void {
  const now = new Date();
  const cleanName = name?.trim() && name.trim() !== 'Guest' ? name.trim().slice(0, 60) : null;
  db.insert(roomVisitors)
    .values({ roomId, visitorId, name: cleanName, firstSeenAt: now, lastSeenAt: now })
    .onConflictDoUpdate({
      target: [roomVisitors.roomId, roomVisitors.visitorId],
      set: { lastSeenAt: now, ...(cleanName ? { name: cleanName } : {}) }
    })
    .run();
}

export function isBanned(roomId: string, visitorId: string | undefined | null): boolean {
  if (!visitorId) return false;
  const row = db
    .select({ visitorId: roomVisitors.visitorId })
    .from(roomVisitors)
    .where(and(
      eq(roomVisitors.roomId, roomId),
      eq(roomVisitors.visitorId, visitorId),
      isNotNull(roomVisitors.bannedAt)
    ))
    .get();
  return !!row;
}
