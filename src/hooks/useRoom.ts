import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMedia, ChatMessage, DriveMedia, Participant, RoomState } from '../../shared/protocol';
import { useI18n } from '../i18n';
import { SyncClient, type ConnStatus } from '../lib/sync';
import { getClientId, isEmojiOnly, setLS } from '../lib/util';

export type RoomActions = {
  load(videoId: string, title?: string, autoplay?: boolean): void;
  loadMedia(media: DriveMedia): void;
  queueAdd(videoId: string, title?: string): void;
  queueAddMedia(media: DriveMedia): void;
  queueRemove(i: number): void;
  queueJump(i: number): void;
  sendChat(text: string): void;
  sendMedia(media: ChatMedia): void;
  rename(name: string): void;
  grant(id: string, control: boolean): void;
  setOpenControl(open: boolean): void;
  requestControl(): void;
};

/** A GIF, sticker or emoji burst floating over the video for a few seconds. */
export type Floater = {
  id: string;
  name: string;
  mine: boolean;
  media?: ChatMedia;
  emoji?: string;
  lane: number; // 0..1 horizontal position
};

export type ControlRequest = { id: string; name: string; at: number };

const FLOAT_MS = 5600;

export function useRoom(code: string, initialName: string) {
  const { t } = useI18n();
  // Read through a ref so switching language never reconnects the socket.
  const tRef = useRef(t);
  tRef.current = t;
  const [status, setStatus] = useState<ConnStatus>('connecting');
  const [state, setState] = useState<RoomState | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [me, setMe] = useState('');
  const [name, setName] = useState(initialName || t.guest);
  const [sync, setSync] = useState<SyncClient | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [requests, setRequests] = useState<ControlRequest[]>([]);
  const nameRef = useRef(name);
  const meRef = useRef('');
  const lanesRef = useRef<{ id: string; lane: number }[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((text: string) => {
    setToast({ id: Date.now(), text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const float = useCallback((m: ChatMessage) => {
    const emoji = !m.media && isEmojiOnly(m.text) ? m.text.trim() : undefined;
    if (!m.media && !emoji) return;
    // Pick the lane farthest from the ones still floating so bursts don't pile up.
    const busy = lanesRef.current.map((x) => x.lane);
    let lane = 0.5;
    let best = -1;
    for (let i = 0; i < 12; i++) {
      const cand = 0.14 + Math.random() * 0.72;
      const gap = busy.length ? Math.min(...busy.map((b) => Math.abs(b - cand))) : 1;
      if (gap > best) {
        best = gap;
        lane = cand;
      }
    }
    const f: Floater = { id: m.id, name: m.name, mine: m.from === meRef.current, media: m.media, emoji, lane };
    lanesRef.current = [...lanesRef.current.slice(-5), { id: f.id, lane }];
    setFloaters((all) => [...all.slice(-5), f]);
    setTimeout(() => {
      lanesRef.current = lanesRef.current.filter((x) => x.id !== f.id);
      setFloaters((all) => all.filter((x) => x.id !== f.id));
    }, FLOAT_MS);
  }, []);

  useEffect(() => {
    const client = new SyncClient();
    setSync(client);
    client.onStatus = setStatus;
    client.onOpen = () =>
      client.send({ type: 'join', room: code, name: nameRef.current, clientId: getClientId() });
    client.onMessage = (m) => {
      switch (m.type) {
        case 'welcome':
          meRef.current = m.you;
          setMe(m.you);
          setState(m.state);
          setChat(m.chat);
          setParticipants(m.participants);
          break;
        case 'state':
          setState(m.state);
          break;
        case 'participants':
          setParticipants(m.participants);
          break;
        case 'chat':
          setChat((c) => [...c, m.message].slice(-200));
          if (!m.message.system) float(m.message);
          break;
        case 'control-request':
          setRequests((rs) => [...rs.filter((r) => r.id !== m.id), { id: m.id, name: m.name, at: Date.now() }]);
          break;
        case 'error':
          showToast(tRef.current.errors[m.code] ?? tRef.current.errors.unknown);
          break;
      }
    };
    client.connect();

    const onVis = () => {
      if (document.visibilityState === 'visible') client.send({ type: 'sync-request' });
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      client.close();
    };
  }, [code, showToast, float]);

  const actions = useMemo<RoomActions>(
    () => ({
      load: (videoId, title, autoplay) => sync?.send({ type: 'load', videoId, title, autoplay }),
      loadMedia: (media) => sync?.send({ type: 'load-media', media }),
      queueAdd: (videoId, title) => sync?.send({ type: 'queue-add', videoId, title }),
      queueAddMedia: (media) => sync?.send({ type: 'queue-add-media', media }),
      queueRemove: (i) => sync?.send({ type: 'queue-remove', index: i }),
      queueJump: (i) => sync?.send({ type: 'queue-jump', index: i }),
      sendChat: (text) => sync?.send({ type: 'chat', text }),
      sendMedia: (media) => sync?.send({ type: 'chat', text: '', media }),
      rename: (n) => {
        const clean = n.trim().slice(0, 24) || tRef.current.guest;
        setName(clean);
        nameRef.current = clean;
        setLS('playsync.name', clean);
        sync?.send({ type: 'rename', name: clean });
      },
      grant: (id, control) => {
        sync?.send({ type: 'grant', id, control });
        setRequests((rs) => rs.filter((r) => r.id !== id));
      },
      setOpenControl: (open) => sync?.send({ type: 'set-open-control', open }),
      requestControl: () => sync?.send({ type: 'request-control' }),
    }),
    [sync],
  );

  const dismissRequest = useCallback((id: string) => setRequests((rs) => rs.filter((r) => r.id !== id)), []);

  const myRole = participants.find((p) => p.id === me)?.role ?? 'viewer';
  const canControl = !!state?.openControl || myRole !== 'viewer';
  // Requests from people who already got control (or left) are stale.
  const pending = requests.filter((r) => participants.some((p) => p.id === r.id && p.role === 'viewer'));

  return {
    status,
    state,
    participants,
    chat,
    me,
    name,
    sync,
    toast,
    showToast,
    actions,
    floaters,
    myRole,
    canControl,
    requests: state?.openControl ? [] : pending,
    dismissRequest,
  };
}
