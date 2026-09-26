// Shared protocol between server and client.

export type VideoItem = {
  videoId?: string; // YouTube source
  media?: DriveMedia; // Drive source (mutually exclusive with videoId)
  title?: string;
  addedBy?: string;
};

/** host: created the room, grants control · control: may drive playback · viewer: watches. */
export type Role = 'host' | 'control' | 'viewer';

export type Participant = {
  id: string;
  name: string;
  role: Role;
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
  ended: boolean; // current source finished and nothing was queued
  openControl: boolean; // everyone may control playback
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
  | { type: 'control-request'; id: string; name: string }
  | { type: 'error'; code: string; message: string };

export type ClientToServer =
  | { type: 'join'; room: string; name: string; clientId?: string }
  | { type: 'rename'; name: string }
  | { type: 'load'; videoId: string; title?: string; autoplay?: boolean }
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
  | { type: 'sync-request' }
  | { type: 'grant'; id: string; control: boolean }
  | { type: 'set-open-control'; open: boolean }
  | { type: 'request-control' };

/** A YouTube search hit, as served by /api/youtube/search. */
export type SearchResult = {
  videoId: string;
  title: string;
  channel?: string;
  duration?: string;
  views?: string;
  published?: string;
};
