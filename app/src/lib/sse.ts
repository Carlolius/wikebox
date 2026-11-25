type SendFn = (data: string) => void;

interface Subscriber {
  send: SendFn;
  // wike_visitor cookie of a guest's tab; null for the TV screen or cookieless clients
  visitorId: string | null;
}

const rooms = new Map<string, Set<Subscriber>>();

export function subscribe(roomCode: string, send: SendFn, visitorId: string | null = null): () => void {
  if (!rooms.has(roomCode)) rooms.set(roomCode, new Set());
  const sub: Subscriber = { send, visitorId };
  rooms.get(roomCode)!.add(sub);
  return () => {
    rooms.get(roomCode)?.delete(sub);
    if (rooms.get(roomCode)?.size === 0) rooms.delete(roomCode);
  };
}

function format(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function broadcast(roomCode: string, event: string, data: unknown): void {
  const payload = format(event, data);
  rooms.get(roomCode)?.forEach(sub => sub.send(payload));
}

/** Send an event only to the open tabs of one guest. */
export function sendToVisitor(roomCode: string, visitorId: string, event: string, data: unknown): void {
  const payload = format(event, data);
  rooms.get(roomCode)?.forEach(sub => {
    if (sub.visitorId === visitorId) sub.send(payload);
  });
}

/** Guests connected right now (several tabs of the same guest count once). */
export function connectedVisitors(roomCode: string): Set<string> {
  const ids = new Set<string>();
  rooms.get(roomCode)?.forEach(sub => {
    if (sub.visitorId) ids.add(sub.visitorId);
  });
  return ids;
}

export function activeConnections(roomCode: string): number {
  return connectedVisitors(roomCode).size;
}
