// Utilidades compartidas del cliente.
import type { ChatMedia } from '../../shared/protocol';

const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function randomCode(len = 6): string {
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return [...buf].map((v) => CODE_ALPHABET[v % CODE_ALPHABET.length]).join('');
}

export function fmtTime(t: number): string {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const s = Math.floor(t % 60);
  const m = Math.floor((t / 60) % 60);
  const h = Math.floor(t / 3600);
  const mm = h ? String(m).padStart(2, '0') : String(m);
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function hueFor(name: string): number {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

/** Per-person text color, soft enough to read on the night ground. */
export function colorFor(name: string): string {
  return `hsl(${hueFor(name)} 78% 76%)`;
}

/** Per-person avatar fill (paired with dark initials). */
export function avatarColor(name: string): string {
  return `hsl(${hueFor(name)} 62% 70%)`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

/** Extracts the video id from YouTube URLs or a bare id. */
export function parseVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  let u: URL;
  try {
    u = new URL(s.startsWith('http') ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, '');
  const ok = (id: string | null) => (id && /^[\w-]{11}$/.test(id) ? id : null);
  if (host === 'youtu.be') return ok(u.pathname.slice(1).split('/')[0]);
  if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    if (u.pathname === '/watch') return ok(u.searchParams.get('v'));
    const m = u.pathname.match(/\/(?:shorts|embed|live|v)\/([\w-]{11})/);
    if (m) return m[1];
  }
  return null;
}

/** Title via the public oembed endpoint (best-effort, no API key, short timeout). */
export async function fetchTitle(videoId: string): Promise<string | undefined> {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
      { signal: AbortSignal.timeout(3500) },
    );
    if (!r.ok) return undefined;
    const j = (await r.json()) as { title?: string };
    return j.title?.slice(0, 200);
  } catch {
    return undefined;
  }
}

export function getLS(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

export function setLS(key: string, value: string): void {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* private mode */
  }
}

// ------------------------------------------------- recently sent GIFs/stickers

const RECENT_MEDIA_MAX = 30;

export function getRecentMedia(kind: 'gif' | 'sticker'): ChatMedia[] {
  try {
    const raw = localStorage.getItem(`playsync.recent.${kind}`);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (x): x is ChatMedia =>
        !!x && typeof x === 'object' && (x as ChatMedia).kind === kind && typeof (x as ChatMedia).url === 'string',
    );
  } catch {
    return [];
  }
}

export function addRecentMedia(kind: 'gif' | 'sticker', media: ChatMedia): void {
  try {
    const next = [media, ...getRecentMedia(kind).filter((x) => x.url !== media.url)].slice(0, RECENT_MEDIA_MAX);
    localStorage.setItem(`playsync.recent.${kind}`, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

/** True when a message is just a few emojis (rendered bigger, WhatsApp-style). */
export function isEmojiOnly(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 16) return false;
  return /^[\p{Extended_Pictographic}\p{Emoji_Component}\s]+$/u.test(trimmed);
}

/** Extracts the file id from Google Drive share links or a bare id. */
export function parseDriveFileId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[-\w]{10,}$/.test(s) && !s.includes('.')) return s;
  const m = s.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*)?id=)([-\w]{10,})/);
  return m ? m[1] : null;
}

export function fmtBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
