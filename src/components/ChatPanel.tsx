import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../shared/protocol';
import { colorFor } from '../lib/util';

type Props = {
  chat: ChatMessage[];
  meId: string;
  onSend(text: string): void;
};

export default function ChatPanel({ chat, meId, onSend }: Props) {
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [chat]);

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
              <span className="chat-text">{m.text}</span>
            </div>
          ),
        )}
      </div>
      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
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
