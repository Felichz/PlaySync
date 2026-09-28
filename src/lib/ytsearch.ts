// YouTube search through the server (keyless scrape, Data API fallback).
import type { SearchResult } from '../../shared/protocol';
import { getLS, setLS } from './util';

const cache = new Map<string, { at: number; items: SearchResult[] }>();
const TTL = 10 * 60_000;

/** `lang` picks the language of the results' metadata (view counts, dates). */
export async function searchYouTube(q: string, lang: 'en' | 'es', signal?: AbortSignal): Promise<SearchResult[]> {
  const key = `${lang}:${q.trim().toLowerCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.items;
  const r = await fetch(`/api/youtube/search?q=${encodeURIComponent(q.trim())}&hl=${lang}`, { signal });
  if (!r.ok) throw new Error('YT_SEARCH_FAILED');
  const j = (await r.json()) as { items?: SearchResult[] };
  const items = j.items ?? [];
  cache.set(key, { at: Date.now(), items });
  return items;
}

const RECENT_KEY = 'playsync.recent.search';

export function getRecentSearches(): string[] {
  try {
    const arr = JSON.parse(getLS(RECENT_KEY) || '[]') as unknown;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string').slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(q: string): void {
  const clean = q.trim();
  if (!clean) return;
  const next = [clean, ...getRecentSearches().filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
  setLS(RECENT_KEY, JSON.stringify(next));
}
