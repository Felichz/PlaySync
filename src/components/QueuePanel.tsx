import { useState } from 'react';
import type { DriveMedia, VideoItem } from '../../shared/protocol';
import { fetchTitle, fmtBytes, parseDriveFileId, parseVideoId } from '../lib/util';
import { IconDrive, IconFilm, IconLink, IconPlay, IconPlus, IconX } from './icons';

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
        <div className={`add-field ${err ? 'has-error' : ''}`}>
          <IconLink size={16} />
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (err) setErr(null);
            }}
            placeholder="Enlace de YouTube o Drive"
            inputMode="url"
            aria-label="Enlace de YouTube o Google Drive"
          />
          <button className="btn primary" disabled={busy || !input.trim()}>
            {busy ? <span className="spinner" aria-label="Añadiendo" /> : <IconPlus size={16} />}
            <span>Añadir</span>
          </button>
        </div>
        {err && (
          <p className="form-error" role="alert">
            {err}
          </p>
        )}
      </form>

      <div className="panel-head">
        <h2>A continuación</h2>
        {queue.length > 0 && <span className="panel-count">{queue.length}</span>}
      </div>

      <ul className="queue-list">
        {queue.length === 0 && (
          <li className="empty">
            <span className="empty-art" aria-hidden="true">
              <IconFilm size={22} />
            </span>
            <strong>La cola está vacía</strong>
            <span>
              Añade videos de YouTube o archivos públicos de Google Drive (hasta 500 MB). Se reproducen solos, uno tras
              otro.
            </span>
          </li>
        )}
        {queue.map((item, i) => (
          <li
            key={`${item.videoId ?? item.media?.fileId}-${i}`}
            className={`queue-item ${item.videoId && item.videoId === currentVideoId ? 'current' : ''}`}
          >
            <span className="queue-index">{i + 1}</span>
            <span className="queue-thumb">
              {item.media ? (
                <span className="file" aria-hidden="true">
                  <IconDrive size={20} />
                </span>
              ) : (
                <img src={`https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} alt="" loading="lazy" />
              )}
            </span>
            <div className="queue-info">
              <span className="queue-title">{item.media?.name ?? item.title ?? item.videoId}</span>
              <span className="queue-by">
                {item.media
                  ? `Drive · ${item.addedBy ?? '?'}${item.media.size ? ` · ${fmtBytes(item.media.size)}` : ''}`
                  : `Añadido por ${item.addedBy ?? '?'}`}
              </span>
            </div>
            <div className="queue-actions">
              <button className="icon-btn" onClick={() => onJump(i)} aria-label="Reproducir ahora" title="Reproducir ahora">
                <IconPlay size={14} />
              </button>
              <button className="icon-btn" onClick={() => onRemove(i)} aria-label="Quitar de la cola" title="Quitar">
                <IconX />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
