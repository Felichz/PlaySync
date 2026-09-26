import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Participant } from '../../shared/protocol';
import { useRoom } from '../hooks/useRoom';
import { avatarColor, getLS, initials, setLS } from '../lib/util';
import ChatPanel from './ChatPanel';
import { IconBack, IconChat, IconFilm, IconShare, IconUsers, Logo } from './icons';
import PeoplePanel from './PeoplePanel';
import Player from './Player';
import QueuePanel from './QueuePanel';

type Tab = 'chat' | 'queue' | 'people';

const STATUS_TEXT: Record<string, string> = {
  connecting: 'Conectando…',
  online: 'Conectado',
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
        room.showToast('Enlace copiado. Pásaselo a quien quieras.');
      }
    } catch {
      /* cancelado por el usuario */
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      room.showToast(`Código ${code} copiado`);
    } catch {
      /* sin permiso de portapapeles */
    }
  };

  const live = !!room.state?.isPlaying;
  const offline = room.status === 'offline';

  const tabs: { id: Tab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: 'chat', label: 'Chat', icon: <IconChat size={16} />, badge: unread || undefined },
    { id: 'queue', label: 'Cola', icon: <IconFilm size={16} />, badge: room.state?.queue.length || undefined },
    { id: 'people', label: 'Gente', icon: <IconUsers size={16} />, badge: room.participants.length || undefined },
  ];
  const tabIndex = tabs.findIndex((t) => t.id === tab);

  const tabButtons = (className: string) => (
    <nav className={className} aria-label="Paneles de la sala" style={{ '--i': tabIndex } as CSSProperties}>
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`tab-btn ${t.id === tab ? 'active' : ''}`}
          onClick={() => setTab(t.id)}
          aria-pressed={t.id === tab}
        >
          {t.icon}
          <span>{t.label}</span>
          {t.badge != null && t.badge > 0 && <span className={`badge ${t.id === 'chat' ? 'hot' : ''}`}>{t.badge}</span>}
        </button>
      ))}
    </nav>
  );

  return (
    <div className={`room ${live ? 'is-live' : ''}`}>
      <Ambient videoId={room.state?.media ? null : (room.state?.videoId ?? null)} live={live} />

      <header className="topbar">
        <button className="icon-btn" onClick={onLeave} aria-label="Salir de la sala">
          <IconBack />
        </button>
        <span className="brand">
          <Logo size={26} />
          <span className="wordmark">PlaySync</span>
        </span>

        <button className="ticket" onClick={() => void copyCode()} title={`${STATUS_TEXT[room.status]} · copiar código`}>
          <span className="ticket-stub">
            <span className={`conn-dot ${room.status}`} />
            Sala
          </span>
          <span className="ticket-code">{code}</span>
        </button>

        <span className="topbar-spacer" />

        <Couch people={room.participants} meId={room.me} onOpen={() => setTab('people')} />

        <span className={`live-chip ${live ? 'live' : ''} ${offline ? 'offline' : ''}`} role="status">
          {offline ? (
            <>
              <i className="dot" />
              <span>Reconectando…</span>
            </>
          ) : live ? (
            <>
              <span className="eq" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>Viendo juntos</span>
            </>
          ) : (
            <>
              <i className="dot" />
              <span>En pausa</span>
            </>
          )}
        </span>

        <button className="btn soft small invite" onClick={() => void share()}>
          <IconShare size={14} />
          <span>Invitar</span>
        </button>
      </header>

      <main className="room-body">
        <section className="stage">
          <Player sync={room.sync} state={room.state} onOpenQueue={() => setTab('queue')} />
        </section>

        <aside className="side">
          {tabButtons('seg side-tabs')}
          <div className="tab-content">
            <div className={`panel ${tab === 'chat' ? '' : 'hidden'}`}>
              <ChatPanel
                chat={room.chat}
                meId={room.me}
                onSend={room.actions.sendChat}
                onSendMedia={room.actions.sendMedia}
              />
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
                code={code}
                participants={room.participants}
                meId={room.me}
                name={room.name}
                onRename={room.actions.rename}
                onInvite={() => void share()}
              />
            </div>
          </div>
        </aside>
      </main>

      {tabButtons('tabbar')}

      {room.toast && (
        <div className="toast" role="status" key={room.toast.id}>
          {room.toast.text}
        </div>
      )}
    </div>
  );
}

/** The screen's light spilling into the room: the playing video's thumbnail, blurred wide. */
function Ambient({ videoId, live }: { videoId: string | null; live: boolean }) {
  return (
    <div className={`ambient ${live ? 'live' : ''}`} aria-hidden="true">
      <div className="ambient-base" />
      {videoId && (
        <img key={videoId} className="ambient-img" src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`} alt="" />
      )}
    </div>
  );
}

/** Who's on the couch: overlapping avatars in the top bar. */
function Couch({ people, meId, onOpen }: { people: Participant[]; meId: string; onOpen(): void }) {
  if (people.length === 0) return null;
  const shown = people.slice(0, 4);
  const extra = people.length - shown.length;
  const label = people.length === 1 ? 'Solo tú por ahora' : `${people.length} en la sala`;
  return (
    <button className="couch" onClick={onOpen} title={people.map((p) => p.name).join(', ')} aria-label={label}>
      {shown.map((p) => (
        <span
          key={p.id}
          className={`avatar ${p.id === meId ? 'me' : ''}`}
          style={{ background: avatarColor(p.name) }}
        >
          {initials(p.name)}
        </span>
      ))}
      {extra > 0 && <span className="avatar more">+{extra}</span>}
    </button>
  );
}
