import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import type {
  ChatMedia,
  ChatMessage,
  ClientToServer,
  Participant,
  RoomState,
  ServerToClient,
  VideoItem,
} from '../shared/protocol';

const PORT = Number(process.env.PORT ?? 3001);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

// Load .env when present (dev convenience; on Render use dashboard env vars).
try {
  const envFile = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  for (const line of envFile.split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = (m[2] ?? '').trim().replace(/^["']|["']$/g, '');
    }
  }
} catch {
  /* no .env file */
}

// ---------------------------------------------------------------- rooms

type Conn = {
  id: string;
  ws: WebSocket;
  name: string;
  room: Room | null;
  alive: boolean;
  chatTimes: number[];
};

type Room = {
  id: string;
  videoId: string | null;
  videoTitle: string | null;
  isPlaying: boolean;
  position: number; // segundos, base en lastUpdatedAt
  lastUpdatedAt: number; // reloj del servidor
  queue: VideoItem[];
  chat: ChatMessage[];
  participants: Map<string, Conn>;
  emptySince: number | null;
  lastAdvance: number;
};

const rooms = new Map<string, Room>();
const conns = new Set<Conn>();

const now = () => Date.now();

function effPos(r: Room, t = now()): number {
  return r.isPlaying ? r.position + (t - r.lastUpdatedAt) / 1000 : r.position;
}

function commit(
  r: Room,
  patch: { videoId?: string | null; videoTitle?: string | null; isPlaying?: boolean; position?: number },
): void {
  r.position = Math.max(0, effPos(r));
  r.lastUpdatedAt = now();
  if ('videoId' in patch) r.videoId = patch.videoId ?? null;
  if ('videoTitle' in patch) r.videoTitle = patch.videoTitle ?? null;
  if (patch.isPlaying !== undefined) r.isPlaying = patch.isPlaying;
  if (patch.position !== undefined) r.position = Math.max(0, patch.position);
}

function roomState(r: Room): RoomState {
  return {
    room: r.id,
    videoId: r.videoId,
    videoTitle: r.videoTitle,
    isPlaying: r.isPlaying,
    position: r.position,
    lastUpdatedAt: r.lastUpdatedAt,
    queue: r.queue,
    serverTime: now(),
  };
}

function participantsOf(r: Room): Participant[] {
  return [...r.participants.values()].map((c) => ({ id: c.id, name: c.name }));
}

function sendTo(conn: Conn, msg: ServerToClient): void {
  if (conn.ws.readyState === WebSocket.OPEN) conn.ws.send(JSON.stringify(msg));
}

function broadcast(r: Room, msg: ServerToClient, exceptId?: string): void {
  for (const c of r.participants.values()) {
    if (c.id !== exceptId) sendTo(c, msg);
  }
}

function emitState(r: Room): void {
  broadcast(r, { type: 'state', state: roomState(r) });
}

function pushChat(r: Room, msg: ChatMessage): void {
  r.chat.push(msg);
  if (r.chat.length > 100) r.chat.shift();
  broadcast(r, { type: 'chat', message: msg });
}

function pushSystem(r: Room, text: string): void {
  pushChat(r, { id: randomUUID(), from: '', name: '', text, at: now(), system: true });
}

function getRoom(id: string): Room {
  let r = rooms.get(id);
  if (!r) {
    r = {
      id,
      videoId: null,
      videoTitle: null,
      isPlaying: false,
      position: 0,
      lastUpdatedAt: now(),
      queue: [],
      chat: [],
      participants: new Map(),
      emptySince: null,
      lastAdvance: 0,
    };
    rooms.set(id, r);
  }
  return r;
}

// ------------------------------------------------------------- validation

const VIDEO_ID_RE = /^[\w-]{11}$/;

function normRoom(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const code = input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  return code.length >= 4 ? code : null;
}

function normVideoId(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const id = input.trim();
  return VIDEO_ID_RE.test(id) ? id : null;
}

function normTitle(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined;
  const t = input.trim().slice(0, 200);
  return t || undefined;
}

function cleanName(input: unknown): string {
  if (typeof input !== 'string') return 'Invitado';
  const n = input.trim().slice(0, 24);
  return n || 'Invitado';
}

// Only allow media hosted by the provider we front (blocks arbitrary image embedding).
const MEDIA_HOST_RE = /(^|\.)giphy\.com$/;

function normMedia(input: unknown): ChatMedia | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const raw = input as Record<string, unknown>;
  if (raw.kind !== 'gif' && raw.kind !== 'sticker') return undefined;
  if (typeof raw.url !== 'string' || raw.url.length > 600) return undefined;
  let u: URL;
  try {
    u = new URL(raw.url);
  } catch {
    return undefined;
  }
  if (u.protocol !== 'https:' || !MEDIA_HOST_RE.test(u.hostname)) return undefined;
  const dim = (v: unknown) =>
    typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(Math.min(v, 2000)) : undefined;
  return { kind: raw.kind, url: raw.url, width: dim(raw.width), height: dim(raw.height) };
}

// ----------------------------------------------------------------- logic

function join(conn: Conn, roomCode: string, name: string): void {
  if (conn.room) leave(conn);
  const r = getRoom(roomCode);
  conn.room = r;
  conn.name = cleanName(name);
  r.participants.set(conn.id, conn);
  r.emptySince = null;
  sendTo(conn, {
    type: 'welcome',
    you: conn.id,
    state: roomState(r),
    chat: r.chat,
    participants: participantsOf(r),
  });
  broadcast(r, { type: 'participants', participants: participantsOf(r) }, conn.id);
  pushSystem(r, `${conn.name} se unió`);
}

function leave(conn: Conn): void {
  const r = conn.room;
  if (!r) return;
  conn.room = null;
  r.participants.delete(conn.id);
  if (r.participants.size === 0) {
    // Freeze the position so rejoins resume where playback stopped.
    commit(r, { isPlaying: false });
    r.emptySince = now();
  } else {
    pushSystem(r, `${conn.name} salió`);
    broadcast(r, { type: 'participants', participants: participantsOf(r) });
  }
}

function handle(conn: Conn, msg: ClientToServer): void {
  switch (msg.type) {
    case 'join': {
      const code = normRoom(msg.room);
      if (!code) {
        sendTo(conn, { type: 'error', code: 'bad-room', message: 'Código de sala inválido' });
        return;
      }
      join(conn, code, msg.name);
      return;
    }
    case 'rename': {
      conn.name = cleanName(msg.name);
      if (conn.room) broadcast(conn.room, { type: 'participants', participants: participantsOf(conn.room) });
      return;
    }
    case 'ping': {
      if (typeof msg.t0 === 'number') sendTo(conn, { type: 'pong', t0: msg.t0, t1: now() });
      return;
    }
    case 'sync-request': {
      if (conn.room) sendTo(conn, { type: 'state', state: roomState(conn.room) });
      return;
    }
    case 'chat': {
      const r = conn.room;
      if (!r || typeof msg.text !== 'string') return;
      const text = msg.text.trim().slice(0, 500);
      const media = normMedia(msg.media);
      if (!text && !media) return;
      // Simple rate limit: max 6 messages per 3 s.
      const t = now();
      conn.chatTimes = conn.chatTimes.filter((x) => t - x < 3000);
      if (conn.chatTimes.length >= 6) {
        sendTo(conn, { type: 'error', code: 'flood', message: 'Vas muy rápido, espera un momento' });
        return;
      }
      conn.chatTimes.push(t);
      pushChat(r, { id: randomUUID(), from: conn.id, name: conn.name, text, media, at: t });
      return;
    }
  }

  // El resto de intents requieren estar en una sala.
  const r = conn.room;
  if (!r) return;

  switch (msg.type) {
    case 'load': {
      const vid = normVideoId(msg.videoId);
      if (!vid) return;
      commit(r, { videoId: vid, videoTitle: normTitle(msg.title) ?? null, position: 0, isPlaying: false });
      pushSystem(r, `${conn.name} puso un video`);
      emitState(r);
      return;
    }
    case 'play': {
      if (!r.videoId || r.isPlaying) return;
      commit(r, { isPlaying: true });
      emitState(r);
      return;
    }
    case 'pause': {
      if (!r.videoId || !r.isPlaying) return;
      commit(r, { isPlaying: false });
      emitState(r);
      return;
    }
    case 'seek': {
      if (!r.videoId || typeof msg.position !== 'number' || !Number.isFinite(msg.position)) return;
      commit(r, { position: Math.max(0, msg.position) });
      emitState(r);
      return;
    }
    case 'ended': {
      if (!r.videoId || now() - r.lastAdvance < 3000) return;
      r.lastAdvance = now();
      const next = r.queue.shift();
      if (next) {
        commit(r, { videoId: next.videoId, videoTitle: next.title ?? null, position: 0, isPlaying: true });
        pushSystem(r, `Siguiente: ${next.title ?? next.videoId}`);
      } else {
        commit(r, { isPlaying: false });
      }
      emitState(r);
      return;
    }
    case 'queue-add': {
      const vid = normVideoId(msg.videoId);
      if (!vid) return;
      const item: VideoItem = { videoId: vid, title: normTitle(msg.title), addedBy: conn.name };
      if (!r.videoId) {
        // With nothing playing yet, the queue starts playing right away.
        commit(r, { videoId: vid, videoTitle: item.title ?? null, position: 0, isPlaying: false });
      } else {
        r.queue.push(item);
      }
      pushSystem(r, `${conn.name} añadió ${item.title ?? vid}`);
      emitState(r);
      return;
    }
    case 'queue-remove': {
      const i = Number(msg.index);
      if (Number.isInteger(i) && i >= 0 && i < r.queue.length) r.queue.splice(i, 1);
      emitState(r);
      return;
    }
    case 'queue-jump': {
      const i = Number(msg.index);
      if (!Number.isInteger(i) || i < 0 || i >= r.queue.length) return;
      const item = r.queue.splice(i, 1)[0];
      commit(r, { videoId: item.videoId, videoTitle: item.title ?? null, position: 0, isPlaying: true });
      pushSystem(r, `${conn.name} saltó a ${item.title ?? item.videoId}`);
      emitState(r);
      return;
    }
  }
}

// -------------------------------------------------------------------- WS

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }

  if (url.pathname === '/api/giphy/search' || url.pathname === '/api/giphy/trending') {
    void serveGiphy(url, res);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end();
    return;
  }

  serveStatic(url.pathname, res);
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 16 * 1024 });

wss.on('connection', (ws) => {
  const conn: Conn = {
    id: randomUUID().slice(0, 8),
    ws,
    name: 'Invitado',
    room: null,
    alive: true,
    chatTimes: [],
  };
  conns.add(conn);

  ws.on('pong', () => {
    conn.alive = true;
  });

  ws.on('message', (data) => {
    let msg: ClientToServer;
    try {
      msg = JSON.parse(String(data));
    } catch {
      return;
    }
    if (!msg || typeof msg !== 'object' || typeof (msg as { type?: unknown }).type !== 'string') return;
    try {
      handle(conn, msg);
    } catch (err) {
      console.error('handler error', err);
    }
  });

  ws.on('close', () => {
    conns.delete(conn);
    try {
      leave(conn);
    } catch (err) {
      console.error('leave error', err);
    }
  });

  ws.on('error', () => {
    /* 'close' se encarga */
  });
});

// Keepalive: terminate dead connections.
setInterval(() => {
  for (const c of conns) {
    if (!c.alive) {
      c.ws.terminate();
      continue;
    }
    c.alive = false;
    c.ws.ping();
  }
}, 30_000);

// State heartbeat: corrects drift even when no intents are flowing.
setInterval(() => {
  for (const r of rooms.values()) {
    if (r.participants.size > 0) emitState(r);
  }
}, 5000);

// Clean up empty rooms.
setInterval(() => {
  const t = now();
  for (const [id, r] of rooms) {
    if (r.participants.size === 0 && r.emptySince && t - r.emptySince > 2 * 60 * 60 * 1000) {
      rooms.delete(id);
    }
  }
}, 60_000);

// ------------------------------------------------------------------ giphy

type GiphyImage = { url?: string; width?: string; height?: string };
type GiphyEntry = { id?: string; images?: Record<string, GiphyImage | undefined> };
type GiphyItem = { id: string; preview: string; url: string; w?: number; h?: number };

const giphyCache = new Map<string, { at: number; items: GiphyItem[] }>();

function compactGiphy(g: GiphyEntry): GiphyItem | null {
  const im = g.images ?? {};
  const preview =
    im.fixed_width?.url ?? im.fixed_height_downsampled?.url ?? im.fixed_height?.url ?? im.original?.url;
  const full = im.downsized_medium?.url || im.downsized?.url || im.original?.url;
  if (!preview || !full || !g.id) return null;
  const w = parseInt(im.original?.width ?? '', 10);
  const h = parseInt(im.original?.height ?? '', 10);
  return { id: g.id, preview, url: full, w: w || undefined, h: h || undefined };
}

async function serveGiphy(url: URL, res: http.ServerResponse): Promise<void> {
  const key = process.env.GIPHY_API_KEY;
  if (!key) {
    res.writeHead(503, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'GIPHY_API_KEY_MISSING' }));
    return;
  }

  const kind = url.searchParams.get('type') === 'sticker' ? 'stickers' : 'gifs';
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, 60);
  const endpoint = q ? 'search' : 'trending';
  const cacheKey = `${kind}:${q}`;
  const ttl = endpoint === 'trending' ? 30 * 60_000 : 10 * 60_000;

  res.setHeader('content-type', 'application/json');
  try {
    const cached = giphyCache.get(cacheKey);
    if (cached && now() - cached.at < ttl) {
      res.writeHead(200);
      res.end(JSON.stringify({ items: cached.items }));
      return;
    }

    const qs = new URLSearchParams({
      api_key: key,
      limit: '24',
      rating: 'pg-13',
      bundle: 'messaging_non_clips',
    });
    if (q) qs.set('q', q);
    const r = await fetch(`https://api.giphy.com/v1/${kind}/${endpoint}?${qs}`);
    if (!r.ok) {
      res.writeHead(502);
      res.end(JSON.stringify({ error: 'GIPHY_UPSTREAM_ERROR', status: r.status }));
      return;
    }
    const j = (await r.json()) as { data?: GiphyEntry[] };
    const items = (j.data ?? []).map(compactGiphy).filter((x): x is GiphyItem => x !== null);
    giphyCache.set(cacheKey, { at: now(), items });
    res.writeHead(200);
    res.end(JSON.stringify({ items }));
  } catch (err) {
    console.error('giphy error', err);
    res.writeHead(502);
    res.end(JSON.stringify({ error: 'GIPHY_UNREACHABLE' }));
  }
}

// ------------------------------------------------------------- static files

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

function serveStatic(pathname: string, res: http.ServerResponse): void {
  const safePath = path.normalize(path.join(DIST, decodeURIComponent(pathname)));
  if (!safePath.startsWith(DIST)) {
    res.writeHead(403).end();
    return;
  }

  let file = safePath;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    // SPA fallback
    file = path.join(DIST, 'index.html');
  }
  if (!fs.existsSync(file)) {
    res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Frontend build missing. Run: npm run build');
    return;
  }

  const ext = path.extname(file).toLowerCase();
  const isAsset = file.replace(/\\/g, '/').includes('/assets/');
  res.writeHead(200, {
    'content-type': MIME[ext] ?? 'application/octet-stream',
    'cache-control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  fs.createReadStream(file).pipe(res);
}

server.listen(PORT, () => {
  console.log(`PlaySync escuchando en http://localhost:${PORT}`);
});
