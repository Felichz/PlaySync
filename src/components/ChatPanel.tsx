import { useEffect, useRef, useState } from 'react';
import type { ChatMedia, ChatMessage } from '../../shared/protocol';
import { addRecentEmoji, EMOJI_CATEGORIES, getRecentEmojis } from '../lib/emojis';
import { giphyFetch, type GiphyItem } from '../lib/giphy';
import { addRecentMedia, colorFor, getRecentMedia, isEmojiOnly } from '../lib/util';

type Props = {
  chat: ChatMessage[];
  meId: string;
  onSend(text: string): void;
  onSendMedia(media: ChatMedia): void;
};

type PickerTab = 'emoji' | 'gif' | 'sticker';
type MediaKind = 'gif' | 'sticker';

export default function ChatPanel({ chat, meId, onSend, onSendMedia }: Props) {
  const [text, setText] = useState('');
  const [picker, setPicker] = useState<PickerTab | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [chat, picker]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
    stickRef.current = true;
  };

  const sendMedia = (media: ChatMedia) => {
    onSendMedia(media);
    stickRef.current = true;
  };

  return (
    <div className="chat">
      <div className="chat-list" ref={listRef} onScroll={onScroll} role="log" aria-label="Chat de la sala">
        {chat.length === 0 && <p className="hint">Rompe el hielo 👋</p>}
        {chat.map((m) =>
          m.system ? (
            <div key={m.id} className="chat-sys">
              {m.text}
            </div>
          ) : (
            <div key={m.id} className={`chat-msg ${m.from === meId ? 'mine' : ''}`}>
              <span className="chat-name" style={{ color: colorFor(m.name) }}>
                {m.from === meId ? 'Tú' : m.name}
              </span>
              {m.media ? (
                m.media.kind === 'gif' ? (
                  <a className="chat-gif-link" href={m.media.url} target="_blank" rel="noreferrer">
                    <img
                      className="chat-gif"
                      src={m.media.url}
                      width={m.media.width}
                      height={m.media.height}
                      alt="GIF"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <img
                    className="chat-sticker"
                    src={m.media.url}
                    width={m.media.width}
                    height={m.media.height}
                    alt="Sticker"
                    loading="lazy"
                  />
                )
              ) : (
                <span className={`chat-text ${isEmojiOnly(m.text) ? 'big' : ''}`}>{m.text}</span>
              )}
            </div>
          ),
        )}
      </div>

      {picker && (
        <ChatPicker tab={picker} onTab={setPicker} onEmoji={(ch) => setText((t) => (t + ch).slice(0, 500))} onSendMedia={sendMedia} onClose={() => setPicker(null)} />
      )}

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <button
          type="button"
          className={`icon-btn picker-toggle ${picker ? 'active' : ''}`}
          onClick={() => setPicker(picker ? null : 'emoji')}
          aria-label="Emojis, GIFs y stickers"
        >
          😊
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          maxLength={500}
          aria-label="Mensaje"
        />
        <button className="btn primary" disabled={!text.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}

// ------------------------------------------------------------------ picker

function ChatPicker({
  tab,
  onTab,
  onEmoji,
  onSendMedia,
  onClose,
}: {
  tab: PickerTab;
  onTab(t: PickerTab): void;
  onEmoji(ch: string): void;
  onSendMedia(media: ChatMedia): void;
  onClose(): void;
}) {
  return (
    <div className="chat-picker">
      <div className="chat-picker-tabs">
        <button className={tab === 'emoji' ? 'active' : ''} onClick={() => onTab('emoji')}>
          Emojis
        </button>
        <button className={tab === 'gif' ? 'active' : ''} onClick={() => onTab('gif')}>
          GIFs
        </button>
        <button className={tab === 'sticker' ? 'active' : ''} onClick={() => onTab('sticker')}>
          Stickers
        </button>
        <button className="picker-close" onClick={onClose} aria-label="Cerrar panel">
          ✕
        </button>
      </div>
      {tab === 'emoji' ? <EmojiPicker onPick={onEmoji} /> : <MediaPicker kind={tab} onSendMedia={onSendMedia} />}
    </div>
  );
}

function EmojiPicker({ onPick }: { onPick(ch: string): void }) {
  const [cat, setCat] = useState(0);
  const recents = getRecentEmojis();
  const pick = (ch: string) => {
    addRecentEmoji(ch);
    onPick(ch);
  };
  return (
    <div className="chat-picker-body">
      {recents.length > 0 && (
        <>
          <p className="picker-section">Recientes</p>
          <div className="emoji-grid">
            {recents.map((ch, i) => (
              <button key={`${ch}-${i}`} type="button" onClick={() => pick(ch)}>
                {ch}
              </button>
            ))}
          </div>
        </>
      )}
      <p className="picker-section">{EMOJI_CATEGORIES[cat].name}</p>
      <div className="emoji-grid">
        {EMOJI_CATEGORIES[cat].emojis.map((ch, i) => (
          <button key={`${ch}-${i}`} type="button" onClick={() => pick(ch)}>
            {ch}
          </button>
        ))}
      </div>
      <div className="emoji-cats">
        {EMOJI_CATEGORIES.map((c, i) => (
          <button key={c.name} type="button" className={i === cat ? 'active' : ''} onClick={() => setCat(i)} title={c.name}>
            {c.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function MediaPicker({ kind, onSendMedia }: { kind: MediaKind; onSendMedia(media: ChatMedia): void }) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [items, setItems] = useState<GiphyItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recents = getRecentMedia(kind);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setError(null);
    giphyFetch(debounced, kind)
      .then((r) => {
        if (alive) setItems(r);
      })
      .catch((e: Error) => {
        if (!alive) return;
        setError(
          e.message === 'GIPHY_KEY_MISSING'
            ? 'Los GIFs y stickers necesitan una clave gratuita de Giphy. Crea una en developers.giphy.com y configúrala como GIPHY_API_KEY en el servidor.'
            : 'No se pudieron cargar. Intenta de nuevo en un momento.',
        );
      });
    return () => {
      alive = false;
    };
  }, [debounced, kind]);

  const send = (item: GiphyItem) => {
    const media: ChatMedia = { kind, url: item.url, width: item.w, height: item.h };
    addRecentMedia(kind, media);
    onSendMedia(media);
  };

  return (
    <div className="chat-picker-body">
      <form className="picker-search" onSubmit={(e) => e.preventDefault()}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={kind === 'gif' ? 'Buscar GIFs…' : 'Buscar stickers…'}
          aria-label={kind === 'gif' ? 'Buscar GIFs' : 'Buscar stickers'}
        />
      </form>

      {error && <p className="picker-hint">{error}</p>}

      {!error && recents.length > 0 && (
        <>
          <p className="picker-section">Recientes</p>
          <div className={`media-grid ${kind === 'sticker' ? 'stickers' : ''}`}>
            {recents.map((m) => (
              <button key={m.url} type="button" onClick={() => onSendMedia(m)} aria-label="Enviar de nuevo">
                <img src={m.url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}

      {!error && items && items.length > 0 && (
        <>
          <p className="picker-section">{debounced ? 'Resultados' : 'Tendencias'}</p>
          <div className={`media-grid ${kind === 'sticker' ? 'stickers' : ''}`}>
            {items.map((it) => (
              <button key={it.id} type="button" onClick={() => send(it)} aria-label="Enviar">
                <img src={it.preview} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}

      {!error && items && items.length === 0 && <p className="picker-hint">Sin resultados. Prueba con otra búsqueda.</p>}
      {!error && !items && <p className="picker-hint">Buscando…</p>}
    </div>
  );
}
