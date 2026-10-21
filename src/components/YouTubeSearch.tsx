import { useEffect, useRef, useState } from 'react';
import type { DriveMedia, SearchResult } from '../../shared/protocol';
import { useI18n } from '../i18n';
import { mediaSourceLabel, resolveMediaLinks } from '../lib/media';
import { fetchTitle, fmtBytes, parseVideoId } from '../lib/util';
import { addRecentSearch, getRecentSearches, searchYouTube } from '../lib/ytsearch';
import { IconDrive, IconFilm, IconPlay, IconPlus, IconReplay, IconSearch, IconX } from './icons';

type Props = {
  /** Title of the video that just finished, when the search replaces an ended player. */
  endedTitle?: string | null;
  /** Why the search is back (e.g. the last pick could not be embedded). */
  notice?: string | null;
  onPlay(videoId: string, title?: string): void;
  onQueue(videoId: string, title?: string): void;
  onPlayMedia(media: DriveMedia): void;
  onQueueMedia(media: DriveMedia): void;
  onReplay?(): void;
};

// The search survives the player swapping it out (a video starts, fails or ends).
let lastQuery = '';

/**
 * "What do we watch?": YouTube search that takes over the screen for people with control.
 * A pasted Drive link or direct video links (a movie in parts) show those files instead.
 */
export default function YouTubeSearch({ endedTitle, notice, onPlay, onQueue, onPlayMedia, onQueueMedia, onReplay }: Props) {
  const { t, lang } = useI18n();
  const fallbackTitle = useRef(t.search.youtubeVideo);
  fallbackTitle.current = t.search.youtubeVideo;
  const tRef = useRef(t);
  tRef.current = t;
  const [q, setQ] = useState(lastQuery);
  const [query, setQuery] = useState(lastQuery);
  const [items, setItems] = useState<SearchResult[] | null>(null);
  const [files, setFiles] = useState<DriveMedia[] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [filesQueued, setFilesQueued] = useState<Set<number>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recents, setRecents] = useState(getRecentSearches);
  const [queued, setQueued] = useState<Set<string>>(() => new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on desktop only: on phones it would pop the keyboard over the video.
  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Search as you type (debounced) and on submit.
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 550);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    lastQuery = query;
    setFiles(null);
    setFileError(null);
    setFilesQueued(new Set());
    if (query.length < 2) {
      setItems(null);
      setError(false);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError(false);
    (async () => {
      // A pasted Drive or direct link resolves to those files, not to a search.
      const linked = await resolveMediaLinks(query, tRef.current);
      if (linked) {
        if ('error' in linked) setFileError(linked.error);
        else setFiles(linked.media);
        return null;
      }
      // A pasted link resolves to exactly that video.
      const direct = parseVideoId(query);
      if (direct) {
        const title = await fetchTitle(direct);
        return [{ videoId: direct, title: title ?? fallbackTitle.current }];
      }
      return searchYouTube(query, lang, ctrl.signal);
    })()
      .then((r) => {
        if (ctrl.signal.aborted) return;
        setItems(r);
        if (r && !parseVideoId(query)) {
          addRecentSearch(query);
          setRecents(getRecentSearches());
        }
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [query, lang]);

  const queue = (it: SearchResult) => {
    onQueue(it.videoId, it.title);
    setQueued((s) => new Set(s).add(it.videoId));
  };

  return (
    <div className="yt-search">
      <div className="yts-head">
        {endedTitle ? (
          <div className="yts-ended">
            <span className="yts-kicker">{t.search.finished}</span>
            <span className="yts-ended-title" title={endedTitle}>
              {endedTitle}
            </span>
            {onReplay && (
              <button type="button" className="btn ghost small" onClick={onReplay}>
                <IconReplay size={14} />
                {t.search.watchAgain}
              </button>
            )}
          </div>
        ) : null}
        {notice && (
          <p className="yts-notice" role="alert">
            {notice}
          </p>
        )}
        <h2>{endedTitle ? t.search.headingAfter : t.search.heading}</h2>
        <form
          className="yts-field"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(q.trim());
            inputRef.current?.blur();
          }}
        >
          <IconSearch />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search.placeholder}
            aria-label={t.search.label}
            enterKeyHint="search"
            maxLength={1000}
          />
          {q && (
            <button type="button" className="icon-btn" onClick={() => setQ('')} aria-label={t.search.clear}>
              <IconX />
            </button>
          )}
        </form>
      </div>

      <div className="yts-body">
        {!items && !files && !fileError && !loading && !error && recents.length > 0 && (
          <div className="yts-recents">
            <span className="picker-section">{t.search.recent}</span>
            <div className="chips">
              {recents.map((r) => (
                <button key={r} type="button" className="chip" onClick={() => setQ(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="yts-grid" aria-busy="true" aria-label={t.search.searching}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="yts-card skeleton">
                <span className="yts-thumb" />
                <span className="sk-line" />
                <span className="sk-line short" />
              </div>
            ))}
          </div>
        )}

        {fileError && !loading && (
          <p className="picker-hint" role="alert">
            {fileError}
          </p>
        )}

        {files && !loading && (
          <>
            {files.length > 1 && (
              <div className="yts-parts">
                <span className="picker-section">{t.search.parts(files.length)}</span>
                <button
                  type="button"
                  className="btn primary small"
                  onClick={() => {
                    // The first part plays now; the rest wait in the queue, in order.
                    onPlayMedia(files[0]);
                    files.slice(1).forEach(onQueueMedia);
                  }}
                >
                  <IconPlay size={14} />
                  {t.search.playAll}
                </button>
              </div>
            )}
            <div className="yts-grid">
              {files.map((file, i) => (
                <div key={file.url ?? file.fileId} className="yts-card">
                  <button type="button" className="yts-main" onClick={() => onPlayMedia(file)}>
                    <span className="yts-thumb">
                      <span className="file" aria-hidden="true">
                        {file.url ? <IconFilm size={28} /> : <IconDrive size={28} />}
                      </span>
                      <span className="yts-play" aria-hidden="true">
                        <IconPlay size={18} />
                      </span>
                    </span>
                    <span className="yts-title">{file.name ?? t.search.file}</span>
                    <span className="yts-meta">
                      {[mediaSourceLabel(file), file.size ? fmtBytes(file.size) : ''].filter(Boolean).join(' · ')}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`yts-queue ${filesQueued.has(i) ? 'done' : ''}`}
                    onClick={() => {
                      onQueueMedia(file);
                      setFilesQueued((s) => new Set(s).add(i));
                    }}
                    aria-label={t.search.addToQueueNamed(file.name ?? t.search.file)}
                    title={t.search.addToQueue}
                  >
                    <IconPlus size={15} />
                    <span>{filesQueued.has(i) ? t.search.queued : t.search.queue}</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {error && !loading && (
          <p className="picker-hint">{t.search.error}</p>
        )}

        {items && !loading && items.length === 0 && (
          <p className="picker-hint">{t.search.empty}</p>
        )}

        {items && !loading && items.length > 0 && (
          <div className="yts-grid">
            {items.map((it) => (
              <div key={it.videoId} className="yts-card">
                <button type="button" className="yts-main" onClick={() => onPlay(it.videoId, it.title)}>
                  <span className="yts-thumb">
                    <img src={`https://i.ytimg.com/vi/${it.videoId}/mqdefault.jpg`} alt="" loading="lazy" />
                    {it.duration && <span className="yts-dur">{it.duration}</span>}
                    <span className="yts-play" aria-hidden="true">
                      <IconPlay size={18} />
                    </span>
                  </span>
                  <span className="yts-title">{it.title}</span>
                  <span className="yts-meta">{[it.channel, it.views].filter(Boolean).join(' · ')}</span>
                </button>
                <button
                  type="button"
                  className={`yts-queue ${queued.has(it.videoId) ? 'done' : ''}`}
                  onClick={() => queue(it)}
                  aria-label={t.search.addToQueueNamed(it.title)}
                  title={t.search.addToQueue}
                >
                  <IconPlus size={15} />
                  <span>{queued.has(it.videoId) ? t.search.queued : t.search.queue}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {!items && !files && !fileError && !loading && !error && recents.length === 0 && (
          <p className="picker-hint">{t.search.hint}</p>
        )}
      </div>
    </div>
  );
}
