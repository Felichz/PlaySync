import { useState } from 'react';
import type { DriveMedia, VideoItem } from '../../shared/protocol';
import { fetchTitle, fmtBytes, parseDriveFileId, parseVideoId } from '../lib/util';
import { IconFilm, IconPlay, IconPlus, IconX } from './icons';

type Props = {
  queue: VideoItem[];
  currentVideoId: string | null;
  onAdd(videoId: string, title?: string): void;
  onAddMedia(media: DriveMedia): void;
  onRemove(i: number): void;
  onJump(i: number): void;
};

const DRIVE_ERRORS: Record<string, string> = {
  MEDIA_NOT_FOUND: 'No se pudo acceder al archivo. ¿Está compartido como "Cualquiera con el enlace"?',
  DRIVE_QUOTA: 'Google limitó las descargas de este archivo por hoy (demasiado tráfico). Prueba mañana.',
  FILE_TOO_LARGE: 'El archivo supera el límite de tamaño del servidor.',
  MEDIA_UNREACHABLE: 'No se pudo contactar a Google Drive. Intenta de nuevo.',
};

export default function QueuePanel({ queue, currentVideoId, onAdd, onAddMedia, onRemove, onJump }: Props) {
  const [input, setInput] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const add = async () => {
    const raw = input.trim();
    if (!raw) return;
    setErr(null);
    setBusy(true);
    try {
      const fileId = parseDriveFileId(raw);
      if (fileId) {
        const r = await fetch(`/api/media/${fileId}/info`);
        const j = (await r.json().catch(() => ({}))) as {
          error?: string;
          limitMb?: number;
          name?: string;
          size?: number;
        };
        if (!r.ok) {
          if (r.status === 413 && j.limitMb) {
            setErr(`El archivo pesa más de ${j.limitMb} MB, el límite del servidor.`);
          } else {
            setErr(DRIVE_ERRORS[j.error ?? ''] ?? 'No se pudo resolver el archivo de Drive.');
          }
          return;
        }
        onAddMedia({ fileId, name: j.name, size: j.size });
        setInput('');
        return;
      }

      const vid = parseVideoId(raw);
      if (!vid) {
        setErr('Pega un enlace de YouTube o de Google Drive (público).');
        return;
      }
      const title = await fetchTitle(vid);
      onAdd(vid, title);
      setInput('');
    } finally {
      setBusy(false);
    }
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
          placeholder="Enlace de YouTube o Google Drive…"
          inputMode="url"
          aria-label="Enlace de YouTube o Google Drive"
        />
        <button className="btn primary" disabled={busy || !input.trim()}>
          {busy ? '…' : <IconPlus size={16} />}
          {busy ? '' : 'Añadir'}
        </button>
      </form>
      {err && <p className="form-error">{err}</p>}

      <ul className="queue-list">
        {queue.length === 0 && (
          <p className="hint">
            La cola está vacía. Añade enlaces de YouTube o archivos públicos de Google Drive
            (límite 500 MB).
          </p>
        )}
        {queue.map((item, i) => (
          <li
            key={`${item.videoId ?? item.media?.fileId}-${i}`}
            className={`queue-item ${item.videoId && item.videoId === currentVideoId ? 'current' : ''}`}
          >
            {item.media ? (
              <span className="queue-thumb file" aria-hidden="true">
                <IconFilm size={18} />
              </span>
            ) : (
              <img src={`https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} alt="" loading="lazy" />
            )}
            <div className="queue-info">
              <span className="queue-title">{item.media?.name ?? item.title ?? item.videoId}</span>
              <span className="queue-by">
                {item.media
                  ? `archivo de ${item.addedBy ?? '?'}${item.media.size ? ` · ${fmtBytes(item.media.size)}` : ''}`
                  : `programó ${item.addedBy ?? '?'}`}
              </span>
            </div>
            <button className="icon-btn" onClick={() => onJump(i)} aria-label="Emitir ahora">
              <IconPlay size={15} />
            </button>
            <button className="icon-btn" onClick={() => onRemove(i)} aria-label="Quitar de la cola">
              <IconX />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
