// Giphy access through the server proxy (keeps the API key server-side).

export type GiphyItem = {
  id: string;
  preview: string;
  url: string;
  w?: number;
  h?: number;
};

const cache = new Map<string, { at: number; items: GiphyItem[] }>();
const TTL = 5 * 60_000;

/** Search GIFs/stickers; empty query returns trending. Throws coded errors. */
export async function giphyFetch(q: string, kind: 'gif' | 'sticker'): Promise<GiphyItem[]> {
  const key = `${kind}:${q.trim().toLowerCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.items;

  const path = q ? 'search' : 'trending';
  const r = await fetch(`/api/giphy/${path}?type=${kind}&q=${encodeURIComponent(q)}`);
  if (r.status === 503) throw new Error('GIPHY_KEY_MISSING');
  if (!r.ok) throw new Error('GIPHY_FAILED');
  const j = (await r.json()) as { items?: GiphyItem[] };
  const items = j.items ?? [];
  cache.set(key, { at: Date.now(), items });
  return items;
}
