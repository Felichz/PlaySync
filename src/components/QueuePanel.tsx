import { useState } from 'react';
import type { DriveMedia, VideoItem } from '../../shared/protocol';
import { useI18n } from '../i18n';
import { fetchTitle, fmtBytes, parseDriveFileId, parseVideoId } from '../lib/util';
import { IconDrive, IconFilm, IconLink, IconLock, IconPlay, IconPlus, IconX } from './icons';

type Props = {
  queue: VideoItem[];
  currentVideoId: string | null;
  onAdd(videoId: string, title?: string): void;
  onAddMedia(media: DriveMedia): void;
  onRemove(i: number): void;
  onJump(i: number): void;
  canControl: boolean;
  onRequestControl(): void;
};

export default function QueuePanel({
  queue,
  currentVideoId,
  onAdd,
  onAddMedia,
  onRemove,
  onJump,
  canControl,
  onRequestControl,
}: Props) {
  const { t } = useI18n();
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
            setErr(t.queue.tooLarge(j.limitMb));
          } else {
            setErr(t.queue.driveErrors[j.error ?? ''] ?? t.queue.driveGeneric);
          }
          return;
        }
        onAddMedia({ fileId, name: j.name, size: j.size });
        setInput('');
        return;
      }

      const vid = parseVideoId(raw);
      if (!vid) {
        setErr(t.queue.badLink);
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
      {!canControl && (
        <div className="locked-note">
          <IconLock size={15} />
          <span>{t.queue.locked}</span>
          <button className="btn soft small" onClick={onRequestControl}>
            {t.queue.ask}
          </button>
        </div>
      )}
      {canControl && (
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
              placeholder={t.queue.placeholder}
              inputMode="url"
              aria-label={t.queue.inputLabel}
            />
            <button className="btn primary" disabled={busy || !input.trim()}>
              {busy ? <span className="spinner" aria-label={t.queue.adding} /> : <IconPlus size={16} />}
              <span>{t.queue.add}</span>
            </button>
          </div>
          {err && (
            <p className="form-error" role="alert">
              {err}
            </p>
          )}
        </form>
      )}

      <div className="panel-head">
        <h2>{t.queue.upNext}</h2>
        {queue.length > 0 && <span className="panel-count">{queue.length}</span>}
      </div>

      <ul className="queue-list">
        {queue.length === 0 && (
          <li className="empty">
            <span className="empty-art" aria-hidden="true">
              <IconFilm size={22} />
            </span>
            <strong>{t.queue.emptyTitle}</strong>
            <span>{t.queue.emptyBody}</span>
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
                  : t.queue.addedBy(item.addedBy ?? '?')}
              </span>
            </div>
            {canControl && (
              <div className="queue-actions">
                <button className="icon-btn" onClick={() => onJump(i)} aria-label={t.queue.playNow} title={t.queue.playNow}>
                  <IconPlay size={14} />
                </button>
                <button className="icon-btn" onClick={() => onRemove(i)} aria-label={t.queue.remove} title={t.queue.removeShort}>
                  <IconX />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
