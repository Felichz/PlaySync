import type { DriveMedia } from '../../shared/protocol';
import type { Messages } from '../i18n/en';
import { parseDriveFileId } from './util';

const VIDEO_EXT_RE = /\.(mp4|m4v|webm|mov|ogv)$/i;

/** A direct link to a video file (http/https, path ending in a video extension), or null. */
export function parseDirectVideoUrl(input: string): string | null {
  const s = input.trim();
  if (!/^https?:\/\//i.test(s)) return null;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  return VIDEO_EXT_RE.test(u.pathname) ? u.href : null;
}

/**
 * Several direct video links pasted together (a movie in parts), in the order given, or null
 * if the text is anything else. Links may be separated by spaces, commas or line breaks, or by
 * nothing at all: a single-line input drops the line breaks of a pasted list.
 */
export function parseDirectVideoUrls(input: string): string[] | null {
  const parts = input
    .split(/(?=https?:\/\/)|[\s,]+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  const urls = parts.map(parseDirectVideoUrl);
  return urls.every((u): u is string => !!u) ? urls : null;
}

/** The file name a direct link points at, decoded ("peli_parte1.mp4"). */
export function fileNameFromUrl(url: string): string | undefined {
  try {
    const last = new URL(url).pathname.split('/').filter(Boolean).pop();
    return last ? decodeURIComponent(last) : undefined;
  } catch {
    return undefined;
  }
}

/** Where a file source comes from, for labels ("Google Drive", "pub-….r2.dev"). */
export function mediaSourceLabel(media: DriveMedia): string {
  if (!media.url) return 'Google Drive';
  try {
    return new URL(media.url).hostname;
  } catch {
    return media.url;
  }
}

/** What the `<video>` element loads: Drive goes through the server's proxy, links go direct. */
export function mediaSrc(media: DriveMedia): string {
  return media.url ?? `/api/media/${media.fileId ?? ''}`;
}

export type LinkResult = { media: DriveMedia[] } | { error: string } | null;

/**
 * Turns a pasted Drive link, or one or more direct video links, into playable files.
 * Null means the text is neither (maybe a YouTube link or a search).
 */
export async function resolveMediaLinks(raw: string, t: Messages, allowBareId = false): Promise<LinkResult> {
  const urls = parseDirectVideoUrls(raw);
  if (urls) return { media: urls.map((url) => ({ url, name: fileNameFromUrl(url) })) };

  // A bare Drive id only where nothing else is expected: in a search it could be a word.
  const fileId = allowBareId || /drive\.google\.com/.test(raw) ? parseDriveFileId(raw) : null;
  if (!fileId) return null;
  try {
    const r = await fetch(`/api/media/${fileId}/info`);
    const j = (await r.json().catch(() => ({}))) as {
      error?: string;
      limitMb?: number;
      name?: string;
      size?: number;
    };
    if (!r.ok) {
      if (r.status === 413 && j.limitMb) return { error: t.queue.tooLarge(j.limitMb) };
      return { error: t.queue.driveErrors[j.error ?? ''] ?? t.queue.driveGeneric };
    }
    return { media: [{ fileId, name: j.name, size: j.size }] };
  } catch {
    return { error: t.queue.driveErrors.MEDIA_UNREACHABLE };
  }
}
