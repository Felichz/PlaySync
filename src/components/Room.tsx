import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRoom } from '../hooks/useRoom';
import { getLS, setLS } from '../lib/util';
import ChatPanel from './ChatPanel';
import { IconBack, IconChat, IconFilm, IconShare, IconUsers } from './icons';
import PeoplePanel from './PeoplePanel';
import Player from './Player';
import QueuePanel from './QueuePanel';

type Tab = 'chat' | 'queue' | 'people';

const STATUS_TEXT: Record<string, string> = {
  connecting: 'Sintonizando…',
  online: 'En línea',
  offline: 'Reconectando…',
};

export default function Room({ code, onLeave }: { code: string; onLeave(): void }) {
  const room = useRoom(code, getLS('syncplay.name'));
  const [tab, setTab] = useState<Tab>('queue');
  const [unread, setUnread] = useState(0);
  const [clock, setClock] = useState(() => new Date());
  const seenRef = useRef(0);

  useEffect(() => {
    document.title = `Sala ${code} · SyncPlay`;
    return () => {
      document.title = 'SyncPlay — Mira YouTube juntos';
    };
  }, [code]);

  useEffect(() => {
    setLS('syncplay.lastRoom', code);
  }, [code]);

  useEffect(() => {
    const iv = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

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
        await navigator.share({ title: 'SyncPlay', text: `Únete a mi sala: ${code}`, url });
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
    { id: 'chat', label: 'Chat', icon: <IconChat size={15} />, badge: unread || undefined },
    { id: 'queue', label: 'Programación', icon: <IconFilm size={15} />, badge: room.state?.queue.length || undefined },
    { id: 'people', label: 'Cabina', icon: <IconUsers size={15} />, badge: room.participants.length },
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

  const hhmmss = clock.toLocaleTimeString('es', { hour12: false });

  return (
    <div className="room">
      <header className="topbar">
        <button className="icon-btn" onClick={onLeave} aria-label="Salir de la sala">
          <IconBack />
        </button>
        <span className="logotype">
          SYNC<b>PLAY</b>
        </span>
        <div className="freq" title={STATUS_TEXT[room.status]}>
          <span className="freq-label">FREC</span>
          <span className="freq-code">{code}</span>
          <span className={`conn-dot ${room.status}`} />
        </div>
        <span className="studio-clock">{hhmmss}</span>
        <span className={`onair ${live ? 'live' : ''}`} title={live ? 'Transmitiendo' : 'En pausa'}>
          <i />
          {live ? 'AL AIRE' : 'EN PAUSA'}
        </span>
        <button className="key small" onClick={() => void share()}>
          <IconShare size={14} />
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
