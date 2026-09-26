import { useEffect, useRef, useState } from 'react';
import type { SearchResult } from '../../shared/protocol';
import { fetchTitle, parseVideoId } from '../lib/util';
import { addRecentSearch, getRecentSearches, searchYouTube } from '../lib/ytsearch';
import { IconPlay, IconPlus, IconReplay, IconSearch, IconX } from './icons';

type Props = {
  /** Title of the video that just finished, when the search replaces an ended player. */
  endedTitle?: string | null;
  /** Why the search is back (e.g. the last pick could not be embedded). */
  notice?: string | null;
  onPlay(videoId: string, title?: string): void;
  onQueue(videoId: string, title?: string): void;
  onReplay?(): void;
};

// The search survives the player swapping it out (a video starts, fails or ends).
let lastQuery = '';

/** "What do we watch?": YouTube search that takes over the screen for people with control. */
export default function YouTubeSearch({ endedTitle, notice, onPlay, onQueue, onReplay }: Props) {
  const [q, setQ] = useState(lastQuery);
  const [query, setQuery] = useState(lastQuery);
  const [items, setItems] = useState<SearchResult[] | null>(null);
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
      // A pasted link resolves to exactly that video.
      const direct = parseVideoId(query);
      if (direct) {
        const title = await fetchTitle(direct);
        return [{ videoId: direct, title: title ?? 'Video de YouTube' }];
      }
      return searchYouTube(query, ctrl.signal);
    })()
      .then((r) => {
        if (ctrl.signal.aborted) return;
        setItems(r);
        if (!parseVideoId(query)) {
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
  }, [query]);

  const queue = (it: SearchResult) => {
    onQueue(it.videoId, it.title);
    setQueued((s) => new Set(s).add(it.videoId));
  };

  return (
    <div className="yt-search">
      <div className="yts-head">
        {endedTitle ? (
          <div className="yts-ended">
            <span className="yts-kicker">Terminó</span>
            <span className="yts-ended-title" title={endedTitle}>
              {endedTitle}
            </span>
            {onReplay && (
              <button type="button" className="btn ghost small" onClick={onReplay}>
                <IconReplay size={14} />
                Volver a ver
              </button>
            )}
          </div>
        ) : null}
        {notice && (
          <p className="yts-notice" role="alert">
            {notice}
          </p>
        )}
        <h2>{endedTitle ? '¿Y ahora qué vemos?' : '¿Qué vemos?'}</h2>
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
            placeholder="Busca en YouTube o pega un enlace"
            aria-label="Buscar en YouTube"
            enterKeyHint="search"
            maxLength={100}
          />
          {q && (
            <button type="button" className="icon-btn" onClick={() => setQ('')} aria-label="Borrar búsqueda">
              <IconX />
            </button>
          )}
        </form>
      </div>

      <div className="yts-body">
        {!items && !loading && !error && recents.length > 0 && (
          <div className="yts-recents">
            <span className="picker-section">Búsquedas recientes</span>
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
          <div className="yts-grid" aria-busy="true" aria-label="Buscando">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="yts-card skeleton">
                <span className="yts-thumb" />
                <span className="sk-line" />
                <span className="sk-line short" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="picker-hint">No pudimos buscar en YouTube ahora mismo. Prueba de nuevo o pega un enlace.</p>
        )}

        {items && !loading && items.length === 0 && (
          <p className="picker-hint">Nada por aquí. Prueba con otras palabras.</p>
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
                  aria-label={`Añadir a la cola: ${it.title}`}
                  title="Añadir a la cola"
                >
                  <IconPlus size={15} />
                  <span>{queued.has(it.videoId) ? 'En cola' : 'Cola'}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {!items && !loading && !error && recents.length === 0 && (
          <p className="picker-hint">Busca lo que quieran ver: se reproduce para todos a la vez.</p>
        )}
      </div>
    </div>
  );
}
