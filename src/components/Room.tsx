import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Participant } from '../../shared/protocol';
import { useRoom } from '../hooks/useRoom';
import { isDefaultName, Rich, useI18n } from '../i18n';
import { avatarColor, getLS, initials, setLS } from '../lib/util';
import Ambient from './Ambient';
import ChatPanel from './ChatPanel';
import { IconBack, IconChat, IconCrown, IconFilm, IconHand, IconShare, IconUsers, IconX, Logo } from './icons';
import NameModal from './NameModal';
import PeoplePanel from './PeoplePanel';
import Player from './Player';
import QueuePanel from './QueuePanel';

type Tab = 'chat' | 'queue' | 'people';

export default function Room({ code, onLeave }: { code: string; onLeave(): void }) {
  const { t } = useI18n();
  const room = useRoom(code, getLS('playsync.name'));
  const [askName, setAskName] = useState(() => isDefaultName(getLS('playsync.name')));
  const [tab, setTab] = useState<Tab>('queue');
  const [unread, setUnread] = useState(0);
  const seenRef = useRef(0);

  useEffect(() => {
    document.title = t.meta.roomTitle(code);
  }, [code, t]);

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
        await navigator.share({ title: 'PlaySync', text: t.room.shareText(code), url });
      } else {
        await navigator.clipboard.writeText(url);
        room.showToast(t.room.linkCopied);
      }
    } catch {
      /* the user cancelled */
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      room.showToast(t.room.codeCopied(code));
    } catch {
      /* no clipboard permission */
    }
  };

  const live = !!room.state?.isPlaying;
  const offline = room.status === 'offline';

  const tabs: { id: Tab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: 'chat', label: t.room.tabs.chat, icon: <IconChat size={16} />, badge: unread || undefined },
    { id: 'queue', label: t.room.tabs.queue, icon: <IconFilm size={16} />, badge: room.state?.queue.length || undefined },
    { id: 'people', label: t.room.tabs.people, icon: <IconUsers size={16} />, badge: room.participants.length || undefined },
  ];
  const tabIndex = tabs.findIndex((x) => x.id === tab);

  const tabButtons = (className: string) => (
    <nav className={className} aria-label={t.room.panels} style={{ '--i': tabIndex } as CSSProperties}>
      {tabs.map((x) => (
        <button
          key={x.id}
          className={`tab-btn ${x.id === tab ? 'active' : ''}`}
          onClick={() => setTab(x.id)}
          aria-pressed={x.id === tab}
        >
          {x.icon}
          <span>{x.label}</span>
          {x.badge != null && x.badge > 0 && <span className={`badge ${x.id === 'chat' ? 'hot' : ''}`}>{x.badge}</span>}
        </button>
      ))}
    </nav>
  );

  return (
    <div className={`room ${live ? 'is-live' : ''}`}>
      <Ambient
        videoId={room.state?.media ? null : (room.state?.videoId ?? null)}
        live={live}
        state={room.state}
        sync={room.sync}
      />

      <header className="topbar">
        <button className="icon-btn" onClick={onLeave} aria-label={t.room.leave}>
          <IconBack />
        </button>
        <span className="brand">
          <Logo size={26} />
          <span className="wordmark">PlaySync</span>
        </span>

        <button className="ticket" onClick={() => void copyCode()} title={t.room.ticketTitle(t.room.status[room.status])}>
          <span className="ticket-stub">
            <span className={`conn-dot ${room.status}`} />
            {t.room.ticketStub}
          </span>
          <span className="ticket-code">{code}</span>
        </button>

        <span className="topbar-spacer" />

        <Couch people={room.participants} meId={room.me} onOpen={() => setTab('people')} />

        <span className={`live-chip ${live ? 'live' : ''} ${offline ? 'offline' : ''}`} role="status">
          {offline ? (
            <>
              <i className="dot" />
              <span>{t.room.status.offline}</span>
            </>
          ) : live ? (
            <>
              <span className="eq" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>{t.room.live}</span>
            </>
          ) : (
            <>
              <i className="dot" />
              <span>{t.room.paused}</span>
            </>
          )}
        </span>

        <button className="btn soft small invite" onClick={() => void share()}>
          <IconShare size={14} />
          <span>{t.room.invite}</span>
        </button>
      </header>

      <main className="room-body">
        <section className="stage">
          <Player
            sync={room.sync}
            state={room.state}
            canControl={room.canControl}
            floaters={room.floaters}
            onLoad={(videoId, title) => room.actions.load(videoId, title, true)}
            onQueueAdd={(videoId, title) => {
              room.actions.queueAdd(videoId, title);
              room.showToast(t.room.addedToQueue);
            }}
            onRequestControl={room.actions.requestControl}
          />
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
                canControl={room.canControl}
                onRequestControl={room.actions.requestControl}
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
                myRole={room.myRole}
                openControl={!!room.state?.openControl}
                onGrant={room.actions.grant}
                onSetOpenControl={room.actions.setOpenControl}
                onRequestControl={room.actions.requestControl}
              />
            </div>
          </div>
        </aside>
      </main>

      {tabButtons('tabbar')}

      {askName && (
        <NameModal
          others={room.participants.filter((p) => p.id !== room.me)}
          onSave={(n) => {
            room.actions.rename(n);
            setAskName(false);
          }}
          onSkip={() => setAskName(false)}
        />
      )}

      {room.requests.length > 0 && (
        <div className="requests" role="alert">
          {room.requests.map((r) => (
            <div key={r.id} className="request">
              <span className="request-icon" aria-hidden="true">
                <IconHand />
              </span>
              <span className="request-text">
                <Rich parts={t.room.request(<b>{r.name}</b>)} />
              </span>
              <button className="btn primary small" onClick={() => room.actions.grant(r.id, true)}>
                {t.room.giveControl}
              </button>
              <button className="icon-btn" onClick={() => room.dismissRequest(r.id)} aria-label={t.room.dismiss}>
                <IconX />
              </button>
            </div>
          ))}
        </div>
      )}

      {room.toast && (
        <div className="toast" role="status" key={room.toast.id}>
          {room.toast.text}
        </div>
      )}
    </div>
  );
}

/** Who's on the couch: overlapping avatars in the top bar. */
function Couch({ people, meId, onOpen }: { people: Participant[]; meId: string; onOpen(): void }) {
  const { t } = useI18n();
  if (people.length === 0) return null;
  const shown = people.slice(0, 4);
  const extra = people.length - shown.length;
  const label = t.room.couch(people.length);
  return (
    <button className="couch" onClick={onOpen} title={people.map((p) => p.name).join(', ')} aria-label={label}>
      {shown.map((p) => (
        <span
          key={p.id}
          className={`avatar ${p.id === meId ? 'me' : ''}`}
          style={{ background: avatarColor(p.name) }}
        >
          {initials(p.name)}
          {p.role === 'host' && (
            <span className="crown" title={t.room.host}>
              <IconCrown size={9} />
            </span>
          )}
        </span>
      ))}
      {extra > 0 && <span className="avatar more">+{extra}</span>}
    </button>
  );
}
