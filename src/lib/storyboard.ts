// YouTube storyboard frames (the seek-preview sprites) to light the room with what's on screen.

export type Storyboard = {
  w: number;
  h: number;
  cols: number;
  rows: number;
  count: number;
  intervalMs: number;
  sheets: string[];
};

export type StoryboardFrame = {
  index: number;
  url: string;
  size: string;
  position: string;
};

const boards = new Map<string, Promise<Storyboard | null>>();
const images = new Map<string, Promise<void>>();

export function getStoryboard(videoId: string): Promise<Storyboard | null> {
  let p = boards.get(videoId);
  if (!p) {
    p = fetch(`/api/youtube/storyboard/${videoId}`)
      .then((r) => (r.ok ? (r.json() as Promise<Storyboard>) : null))
      .catch(() => null);
    boards.set(videoId, p);
  }
  return p;
}

/** Resolves once the sheet is decoded, so a crossfade never reveals a blank layer. */
export function loadSheet(url: string): Promise<void> {
  let p = images.get(url);
  if (!p) {
    p = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('sheet'));
      img.src = url;
    });
    p.catch(() => images.delete(url));
    images.set(url, p);
  }
  return p;
}

/** Nearest sampled frame: switching at the midpoint keeps the light closest to what's on screen. */
export function frameIndexAt(sb: Storyboard, seconds: number): number {
  return Math.min(sb.count - 1, Math.max(0, Math.round((seconds * 1000) / sb.intervalMs)));
}

/** CSS sprite crop for one frame. The last sheet only has as many rows as it needs. */
export function frameAt(sb: Storyboard, index: number): StoryboardFrame {
  const perSheet = sb.cols * sb.rows;
  const sheet = Math.floor(index / perSheet);
  const i = index % perSheet;
  const framesInSheet = Math.min(perSheet, sb.count - sheet * perSheet);
  const rows = Math.ceil(framesInSheet / sb.cols);
  const col = i % sb.cols;
  const row = Math.floor(i / sb.cols);
  const x = sb.cols > 1 ? (col / (sb.cols - 1)) * 100 : 0;
  const y = rows > 1 ? (row / (rows - 1)) * 100 : 0;
  return {
    index,
    url: sb.sheets[sheet],
    size: `${sb.cols * 100}% ${rows * 100}%`,
    position: `${x}% ${y}%`,
  };
}
