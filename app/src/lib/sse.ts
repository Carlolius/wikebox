type SendFn = (data: string) => void;
const rooms = new Map<string, Set<SendFn>>();

export function subscribe(roomCode: string, send: SendFn): () => void {
  if (!rooms.has(roomCode)) rooms.set(roomCode, new Set());
  rooms.get(roomCode)!.add(send);
  return () => {
    rooms.get(roomCode)?.delete(send);
    if (rooms.get(roomCode)?.size === 0) rooms.delete(roomCode);
  };
}

export function broadcast(roomCode: string, event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  rooms.get(roomCode)?.forEach(send => send(payload));
}

export function activeConnections(roomCode: string): number {
  return rooms.get(roomCode)?.size ?? 0;
}
