import { useState } from 'react';
import type { VideoItem } from '../../shared/protocol';
import { fetchTitle, parseVideoId } from '../lib/util';

type Props = {
  queue: VideoItem[];
  currentVideoId: string | null;
  onAdd(videoId: string, title?: string): void;
  onRemove(i: number): void;
  onJump(i: number): void;
};

export default function QueuePanel({ queue, currentVideoId, onAdd, onRemove, onJump }: Props) {
  const [input, setInput] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const add = async () => {
    const vid = parseVideoId(input);
    if (!vid) {
      setErr('No parece un enlace de YouTube válido.');
      return;
    }
    setErr(null);
    setBusy(true);
    const title = await fetchTitle(vid);
    onAdd(vid, title);
    setInput('');
    setBusy(false);
  };

  return (
    <div className="queue">
      <form
        className="add-form"
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pega un enlace de YouTube…"
          inputMode="url"
          aria-label="Enlace de YouTube"
        />
        <button className="btn primary" disabled={busy || !input.trim()}>
          {busy ? '…' : 'Añadir'}
        </button>
      </form>
      {err && <p className="form-error">{err}</p>}

      <ul className="queue-list">
        {queue.length === 0 && <p className="hint">La cola está vacía. Lo que añadas aquí sonará después del video actual.</p>}
        {queue.map((item, i) => (
          <li key={`${item.videoId}-${i}`} className={`queue-item ${item.videoId === currentVideoId ? 'current' : ''}`}>
            <img src={`https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} alt="" loading="lazy" />
            <div className="queue-info">
              <span className="queue-title">{item.title ?? item.videoId}</span>
              <span className="queue-by">añadido por {item.addedBy ?? '?'}</span>
            </div>
            <button className="icon-btn" onClick={() => onJump(i)} aria-label="Reproducir ahora">
              ▶
            </button>
            <button className="icon-btn" onClick={() => onRemove(i)} aria-label="Quitar de la cola">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
