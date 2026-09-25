// Shared protocol between server and client.

export type VideoItem = {
  videoId?: string; // YouTube source
  media?: DriveMedia; // Drive source (mutually exclusive with videoId)
  title?: string;
  addedBy?: string;
};

export type Participant = {
  id: string;
  name: string;
};

/** Media attachment (GIF/sticker) attached to a chat message. */
export type ChatMedia = {
  kind: 'gif' | 'sticker';
  url: string;
  width?: number;
  height?: number;
};

/** A file (e.g. Google Drive video) playing in the room instead of YouTube. */
export type DriveMedia = {
  fileId: string;
  name?: string;
  size?: number; // bytes
};

export type ChatMessage = {
  id: string;
  from: string; // participant id ('' for system messages)
  name: string;
  text: string;
  at: number; // server clock, ms
  system?: boolean;
  media?: ChatMedia;
};

/** Authoritative room state. `position` is the base at `lastUpdatedAt`. */
export type RoomState = {
  room: string;
  videoId: string | null; // YouTube source
  videoTitle: string | null;
  media: DriveMedia | null; // Drive source (takes precedence when set)
  isPlaying: boolean;
  position: number; // seconds
  lastUpdatedAt: number; // server clock, ms
  queue: VideoItem[];
  serverTime: number; // ms del reloj del servidor al generar el mensaje
};

export type ServerToClient =
  | {
      type: 'welcome';
      you: string;
      state: RoomState;
      chat: ChatMessage[];
      participants: Participant[];
    }
  | { type: 'state'; state: RoomState }
  | { type: 'chat'; message: ChatMessage }
  | { type: 'participants'; participants: Participant[] }
  | { type: 'pong'; t0: number; t1: number }
  | { type: 'error'; code: string; message: string };

export type ClientToServer =
  | { type: 'join'; room: string; name: string }
  | { type: 'rename'; name: string }
  | { type: 'load'; videoId: string; title?: string }
  | { type: 'load-media'; media: DriveMedia }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'seek'; position: number }
  | { type: 'ended' }
  | { type: 'queue-add'; videoId: string; title?: string }
  | { type: 'queue-add-media'; media: DriveMedia }
  | { type: 'queue-remove'; index: number }
  | { type: 'queue-jump'; index: number }
  | { type: 'chat'; text: string; media?: ChatMedia }
  | { type: 'ping'; t0: number }
  | { type: 'sync-request' };
