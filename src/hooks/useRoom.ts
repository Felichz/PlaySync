import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMedia, ChatMessage, Participant, RoomState } from '../../shared/protocol';
import { SyncClient, type ConnStatus } from '../lib/sync';

export type RoomActions = {
  load(videoId: string, title?: string): void;
  queueAdd(videoId: string, title?: string): void;
  queueRemove(i: number): void;
  queueJump(i: number): void;
  sendChat(text: string): void;
  sendMedia(media: ChatMedia): void;
  rename(name: string): void;
};

export function useRoom(code: string, initialName: string) {
  const [status, setStatus] = useState<ConnStatus>('connecting');
  const [state, setState] = useState<RoomState | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [me, setMe] = useState('');
  const [name, setName] = useState(initialName || 'Invitado');
  const [sync, setSync] = useState<SyncClient | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const nameRef = useRef(name);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((text: string) => {
    setToast({ id: Date.now(), text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    const client = new SyncClient();
    setSync(client);
    client.onStatus = setStatus;
    client.onOpen = () => client.send({ type: 'join', room: code, name: nameRef.current });
    client.onMessage = (m) => {
      switch (m.type) {
        case 'welcome':
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
          break;
        case 'error':
          showToast(m.message);
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
  }, [code, showToast]);

  const actions = useMemo<RoomActions>(
    () => ({
      load: (videoId, title) => sync?.send({ type: 'load', videoId, title }),
      queueAdd: (videoId, title) => sync?.send({ type: 'queue-add', videoId, title }),
      queueRemove: (i) => sync?.send({ type: 'queue-remove', index: i }),
      queueJump: (i) => sync?.send({ type: 'queue-jump', index: i }),
      sendChat: (text) => sync?.send({ type: 'chat', text }),
      sendMedia: (media) => sync?.send({ type: 'chat', text: '', media }),
      rename: (n) => {
        const clean = n.trim().slice(0, 24) || 'Invitado';
        setName(clean);
        nameRef.current = clean;
        sync?.send({ type: 'rename', name: clean });
      },
    }),
    [sync],
  );

  return { status, state, participants, chat, me, name, sync, toast, showToast, actions };
}
