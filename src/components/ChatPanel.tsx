import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ChatMedia, ChatMessage } from '../../shared/protocol';
import { addRecentEmoji, EMOJI_CATEGORIES, getRecentEmojis } from '../lib/emojis';
import { giphyFetch, type GiphyItem } from '../lib/giphy';
import { useI18n } from '../i18n';
import { addRecentMedia, avatarColor, colorFor, getRecentMedia, initials, isEmojiOnly } from '../lib/util';
import { IconSend, IconSmile, IconX } from './icons';

type Props = {
  chat: ChatMessage[];
  meId: string;
  onSend(text: string): void;
  onSendMedia(media: ChatMedia): void;
};

type PickerTab = 'emoji' | 'gif' | 'sticker';
type MediaKind = 'gif' | 'sticker';

const PICKER_TABS: PickerTab[] = ['emoji', 'gif', 'sticker'];

export default function ChatPanel({ chat, meId, onSend, onSendMedia }: Props) {
  const { t, time } = useI18n();
  const [text, setText] = useState('');
  const [picker, setPicker] = useState<PickerTab | null>(null);
  const [openRuns, setOpenRuns] = useState<Set<string>>(() => new Set());
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
      <div className="chat-list" ref={listRef} onScroll={onScroll} role="log" aria-label={t.chat.log}>
        {chat.length === 0 && (
          <div className="chat-empty">
            <span className="chat-empty-art" aria-hidden="true">
              👋
            </span>
            <strong>{t.chat.emptyTitle}</strong>
            <span>{t.chat.emptyBody}</span>
          </div>
        )}
        {chat.map((m, i) => {
          if (m.system) {
            // Runs of join/leave notices collapse to the latest one plus a counter.
            let start = i;
            while (start > 0 && chat[start - 1].system) start--;
            let end = i;
            while (end < chat.length - 1 && chat[end + 1].system) end++;
            const runId = chat[start].id;
            const hidden = end - start;
            if (hidden >= 2 && !openRuns.has(runId) && i !== end) return null;
            return (
              <div key={m.id} className="chat-sys">
                {hidden >= 2 && i === end && !openRuns.has(runId) && (
                  <button
                    type="button"
                    className="sys-more"
                    onClick={() => setOpenRuns((prev) => new Set(prev).add(runId))}
                  >
                    {t.chat.moreNotices(hidden)}
                  </button>
                )}
                <span>{m.event ? t.system(m.event) : m.text}</span>
              </div>
            );
          }
          const prev = chat[i - 1];
          const next = chat[i + 1];
          const joinsPrev = !!prev && !prev.system && prev.from === m.from && m.at - prev.at < 180_000;
          const joinsNext = !!next && !next.system && next.from === m.from && next.at - m.at < 180_000;
          const mine = m.from === meId;
          const emojiOnly = !m.media && isEmojiOnly(m.text);
          return (
            <div
              key={m.id}
              className={`chat-msg ${mine ? 'mine' : ''} ${joinsPrev ? 'cont' : ''} ${joinsNext ? 'has-next' : ''}`}
            >
              {!mine && (
                <span className="chat-avatar">
                  {!joinsNext && (
                    <span className="avatar sm" style={{ background: avatarColor(m.name) }} title={m.name}>
                      {initials(m.name)}
                    </span>
                  )}
                </span>
              )}
              <div className="chat-body">
                {!joinsPrev && (
                  <div className="chat-head">
                    {!mine && (
                      <span className="chat-name" style={{ color: colorFor(m.name) }}>
                        {m.name}
                      </span>
                    )}
                    <span className="chat-at">{time(m.at)}</span>
                  </div>
                )}
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
                  <span className={`chat-text ${emojiOnly ? 'big' : ''}`}>{m.text}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {picker && (
        <ChatPicker
          tab={picker}
          onTab={setPicker}
          onEmoji={(ch) => setText((t) => (t + ch).slice(0, 500))}
          onSendMedia={sendMedia}
          onClose={() => setPicker(null)}
        />
      )}

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="composer">
          <button
            type="button"
            className={`icon-btn picker-toggle ${picker ? 'on' : ''}`}
            onClick={() => setPicker(picker ? null : 'emoji')}
            aria-label={t.chat.pickerToggle}
            aria-expanded={!!picker}
          >
            <IconSmile />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.chat.placeholder}
            maxLength={500}
            aria-label={t.chat.message}
            enterKeyHint="send"
          />
          <button className="send-btn" disabled={!text.trim()} aria-label={t.chat.send}>
            <IconSend size={16} />
          </button>
        </div>
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
  const { t } = useI18n();
  return (
    <div className="chat-picker">
      <div className="chat-picker-tabs">
        <nav className="seg mini" style={{ '--i': PICKER_TABS.indexOf(tab) } as CSSProperties}>
          {PICKER_TABS.map((id) => (
            <button
              key={id}
              type="button"
              className={`tab-btn ${tab === id ? 'active' : ''}`}
              onClick={() => onTab(id)}
              aria-pressed={tab === id}
            >
              {t.chat.tabs[id]}
            </button>
          ))}
        </nav>
        <button type="button" className="icon-btn picker-close" onClick={onClose} aria-label={t.chat.closePicker}>
          <IconX size={15} />
        </button>
      </div>
      {tab === 'emoji' ? (
        <EmojiPicker onPick={onEmoji} />
      ) : (
        <MediaPicker kind={tab} onSendMedia={onSendMedia} />
      )}
    </div>
  );
}

function EmojiPicker({ onPick }: { onPick(ch: string): void }) {
  const { t } = useI18n();
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
          <span className="picker-section">{t.chat.recent}</span>
          <div className="emoji-grid">
            {recents.map((ch, i) => (
              <button key={`${ch}-${i}`} type="button" onClick={() => pick(ch)}>
                {ch}
              </button>
            ))}
          </div>
        </>
      )}
      <span className="picker-section">{t.chat.emojiCats[EMOJI_CATEGORIES[cat].id]}</span>
      <div className="emoji-grid">
        {EMOJI_CATEGORIES[cat].emojis.map((ch, i) => (
          <button key={`${ch}-${i}`} type="button" onClick={() => pick(ch)}>
            {ch}
          </button>
        ))}
      </div>
      <div className="emoji-cats">
        {EMOJI_CATEGORIES.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={i === cat ? 'active' : ''}
            onClick={() => setCat(i)}
            title={t.chat.emojiCats[c.id]}
            aria-label={t.chat.emojiCats[c.id]}
          >
            {c.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

function MediaPicker({ kind, onSendMedia }: { kind: MediaKind; onSendMedia(media: ChatMedia): void }) {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [items, setItems] = useState<GiphyItem[] | null>(null);
  const [error, setError] = useState<'missing' | 'failed' | null>(null);
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
        setError(e.message === 'GIPHY_KEY_MISSING' ? 'missing' : 'failed');
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
          placeholder={kind === 'gif' ? t.chat.searchGifsPlaceholder : t.chat.searchStickersPlaceholder}
          aria-label={kind === 'gif' ? t.chat.searchGifs : t.chat.searchStickers}
        />
      </form>

      {error && <p className="picker-hint">{error === 'missing' ? t.chat.giphyMissing : t.chat.giphyFailed}</p>}

      {!error && recents.length > 0 && (
        <>
          <span className="picker-section">{t.chat.recent}</span>
          <div className={`media-grid ${kind === 'sticker' ? 'stickers' : ''}`}>
            {recents.map((m) => (
              <button key={m.url} type="button" onClick={() => onSendMedia(m)} aria-label={t.chat.sendAgain}>
                <img src={m.url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}

      {!error && items && items.length > 0 && (
        <>
          <span className="picker-section">{debounced ? t.chat.results : t.chat.trending}</span>
          <div className={`media-grid ${kind === 'sticker' ? 'stickers' : ''}`}>
            {items.map((it) => (
              <button key={it.id} type="button" onClick={() => send(it)} aria-label={t.chat.send}>
                <img src={it.preview} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}

      {!error && items && items.length === 0 && (
        <p className="picker-hint">{t.chat.noResults}</p>
      )}
      {!error && !items && <p className="picker-hint">{t.chat.searching}</p>}
    </div>
  );
}
