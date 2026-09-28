import { useEffect, useRef, useState } from 'react';
import type { RoomState } from '../../shared/protocol';
import { frameAt, frameIndexAt, getStoryboard, loadSheet, type Storyboard, type StoryboardFrame } from '../lib/storyboard';
import { effectivePosition, type SyncClient } from '../lib/sync';

type Props = {
  videoId: string | null;
  live: boolean;
  state: RoomState | null;
  sync: SyncClient | null;
};

/**
 * The screen's light spilling into the room. It follows the video through YouTube's storyboard
 * (a frame every few seconds); the static thumbnail stays underneath as the fallback.
 */
export default function Ambient({ videoId, live, state, sync }: Props) {
  return (
    <div className={`ambient ${live ? 'live' : ''}`} aria-hidden="true">
      <div className="ambient-base" />
      {videoId && <Screen key={videoId} videoId={videoId} state={state} sync={sync} />}
    </div>
  );
}

function Screen({ videoId, state, sync }: { videoId: string; state: RoomState | null; sync: SyncClient | null }) {
  const [board, setBoard] = useState<Storyboard | null>(null);
  const [layers, setLayers] = useState<StoryboardFrame[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  const wanted = useRef(-1);

  useEffect(() => {
    let alive = true;
    void getStoryboard(videoId).then((sb) => alive && setBoard(sb));
    return () => {
      alive = false;
    };
  }, [videoId]);

  useEffect(() => {
    if (!board) return;
    const update = () => {
      const s = stateRef.current;
      if (!s || s.videoId !== videoId) return;
      const index = frameIndexAt(board, effectivePosition(s, sync?.serverNow() ?? Date.now()));
      if (index === wanted.current) return;
      wanted.current = index;
      const frame = frameAt(board, index);
      // Warm the next sheet so crossing a sheet boundary doesn't stall.
      const next = board.sheets[board.sheets.indexOf(frame.url) + 1];
      if (next) loadSheet(next).catch(() => undefined);
      loadSheet(frame.url)
        .then(() => {
          if (wanted.current === index) setLayers((ls) => [...ls.slice(-1), frame]);
        })
        .catch(() => undefined);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
    // `state` re-runs this so seeks and pauses show up at once, not on the next tick.
  }, [board, videoId, sync, state]);

  return (
    <div className="ambient-screen">
      <img className="ambient-layer" src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`} alt="" />
      {layers.map((f) => (
        <div
          key={f.index}
          className="ambient-layer"
          style={{ backgroundImage: `url("${f.url}")`, backgroundSize: f.size, backgroundPosition: f.position }}
        />
      ))}
    </div>
  );
}
