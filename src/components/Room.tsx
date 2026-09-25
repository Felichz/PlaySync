import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRoom } from '../hooks/useRoom';
import { getLS, setLS } from '../lib/util';
import ChatPanel from './ChatPanel';
import { IconBack, IconChat, IconFilm, IconPlay, IconShare, IconUsers } from './icons';
import PeoplePanel from './PeoplePanel';
import Player from './Player';
import QueuePanel from './QueuePanel';

type Tab = 'chat' | 'queue' | 'people';

const STATUS_TEXT: Record<string, string> = {
  connecting: 'Conectando…',
  online: 'En línea',
  offline: 'Reconectando…',
};

export default function Room({ code, onLeave }: { code: string; onLeave(): void }) {
  const room = useRoom(code, getLS('playsync.name'));
  const [tab, setTab] = useState<Tab>('queue');
  const [unread, setUnread] = useState(0);
  const seenRef = useRef(0);

  useEffect(() => {
    document.title = `Sala ${code} · PlaySync`;
    return () => {
      document.title = 'PlaySync — Mira YouTube juntos';
    };
  }, [code]);

  useEffect(() => {
    setLS('playsync.lastRoom', code);
  }, [code]);

  useEffect(() => {
    if (tab === 'chat') {
      seenRef.current = room.chat.length;
      setUnread(0);
    }
  }, [tab, room.chat.length]);

  useEffect(() => {
    if (tab !== 'chat') setUnread(Math.max(0, room.chat.length - seenRef.current));
  }, [room.chat.length, tab]);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/r/${code}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PlaySync', text: `Únete a mi sala: ${code}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        room.showToast('Enlace copiado al portapapeles');
      }
    } catch {
      /* cancelado por el usuario */
    }
  };

  const live = !!room.state?.isPlaying;

  const tabs: { id: Tab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: 'chat', label: 'Chat', icon: <IconChat size={14} />, badge: unread || undefined },
    { id: 'queue', label: 'Cola', icon: <IconFilm size={14} />, badge: room.state?.queue.length || undefined },
    { id: 'people', label: 'Gente', icon: <IconUsers size={14} />, badge: room.participants.length },
  ];

  const tabButtons = (className: string) => (
    <nav className={className} aria-label="Paneles de la sala">
      {tabs.map((t) => (
        <button key={t.id} className={`tab-btn ${t.id === tab ? 'active' : ''}`} onClick={() => setTab(t.id)}>
          {t.icon}
          {t.label}
          {t.badge != null && t.badge > 0 && <span className="badge">{t.badge}</span>}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="room">
      <header className="topbar">
        <button className="icon-btn" onClick={onLeave} aria-label="Salir de la sala">
          <IconBack />
        </button>
        <span className="brand">
          <span className="mark">
            <IconPlay size={11} />
          </span>
          PlaySync
        </span>
        <span className="room-pill" title={STATUS_TEXT[room.status]}>
          <span className={`conn-dot ${room.status}`} />
          <span className="code">{code}</span>
        </span>
        <span className={`live-chip ${live ? 'live' : ''}`}>
          <i />
          {live ? <span>En vivo</span> : <span>En pausa</span>}
        </span>
        <button className="btn ghost small" onClick={() => void share()}>
          <IconShare size={13} />
          Compartir
        </button>
      </header>

      <main className="room-body">
        <section className="stage">
          <Player sync={room.sync} state={room.state} onOpenQueue={() => setTab('queue')} />
        </section>

        <aside className="side">
          {tabButtons('side-tabs')}
          <div className="tab-content">
            <div className={`panel ${tab === 'chat' ? '' : 'hidden'}`}>
              <ChatPanel chat={room.chat} meId={room.me} onSend={room.actions.sendChat} onSendMedia={room.actions.sendMedia} />
            </div>
            <div className={`panel ${tab === 'queue' ? '' : 'hidden'}`}>
              <QueuePanel
                queue={room.state?.queue ?? []}
                currentVideoId={room.state?.videoId ?? null}
                onAdd={room.actions.queueAdd}
                onAddMedia={room.actions.queueAddMedia}
                onRemove={room.actions.queueRemove}
                onJump={room.actions.queueJump}
              />
            </div>
            <div className={`panel ${tab === 'people' ? '' : 'hidden'}`}>
              <PeoplePanel
                participants={room.participants}
                meId={room.me}
                name={room.name}
                onRename={room.actions.rename}
              />
            </div>
          </div>
        </aside>
      </main>

      {tabButtons('tabbar')}

      {room.toast && (
        <div className="toast" role="status">
          {room.toast.text}
        </div>
      )}
    </div>
  );
}
