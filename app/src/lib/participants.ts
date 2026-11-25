/** A guest as the room admin sees it in the participant list. */
export interface Participant {
  visitorId: string;
  name: string | null;
  online: boolean;
  isYou: boolean;
  songsAdded: number;
  votesCast: number;
  lastSeenAt: number | null; // unix ms
  bannedAt: number | null; // unix ms
}
