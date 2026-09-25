import { useCallback, useEffect, useRef, useState } from 'react';
import type { RoomState } from '../../shared/protocol';
import { effectivePosition, type SyncClient } from '../lib/sync';
import { loadYT, YT_STATE, type YTPlayer } from '../lib/yt';
import { fmtTime, getLS, setLS } from '../lib/util';
import { IconFilm, IconFull, IconMute, IconPause, IconPlay, IconVolume } from './icons';

type Props = {
  sync: SyncClient | null;
  state: RoomState | null;
  onOpenQueue(): void;
};

type Pending = { until: number; isPlaying?: boolean; position?: number };

export default function Player({ sync, state, onOpenQueue }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const loadedRef = useRef<string | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  const lastSeekAtRef = useRef(0);
  const lastReconcileRef = useRef(0);
  const endedAtRef = useRef(0);
  const blockTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(() => {
    const v = Number(getLS('syncplay.vol'));
    return Number.isFinite(v) && v > 0 ? Math.min(v, 100) : 100;
  });
  const [scrub, setScrub] = useState<number | null>(null);

  const stateRef = useRef<RoomState | null>(state);
  const syncRef = useRef<SyncClient | null>(sync);
  const volRef = useRef(vol);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    syncRef.current = sync;
  }, [sync]);

  const clearBlocked = useCallback(() => {
    setBlocked(false);
    if (blockTimerRef.current) clearTimeout(blockTimerRef.current);
  }, []);

  // After issuing a play for sync reasons, if the player still hasn't started
  // (iOS/Chrome autoplay policy), ask the user for a tap.
  const scheduleBlockCheck = useCallback(() => {
    if (blockTimerRef.current) clearTimeout(blockTimerRef.current);
    blockTimerRef.current = setTimeout(() => {
      const p = playerRef.current;
      if (!p) return;
      const st = p.getPlayerState();
      if (st === YT_STATE.UNSTARTED || st === YT_STATE.CUED) setBlocked(true);
    }, 1400);
  }, []);

  const reconcile = useCallback(
    (force = false) => {
      const s = stateRef.current;
      const p = playerRef.current;
      const client = syncRef.current;
      if (!s || !p || !readyRef.current || !client) return;

      const t = Date.now();
      if (!force && t - lastReconcileRef.current < 250) return;
      lastReconcileRef.current = t;

      if (!s.videoId) return;
      const target = effectivePosition(s, client.serverNow());

      // New video: load it and grant a short grace period.
      if (loadedRef.current !== s.videoId) {
        loadedRef.current = s.videoId;
        setError(null);
        clearBlocked();
        if (s.isPlaying) {
          p.loadVideoById({ videoId: s.videoId, startSeconds: target });
          scheduleBlockCheck();
        } else {
          p.cueVideoById({ videoId: s.videoId, startSeconds: target });
        }
        pendingRef.current = { until: t + 2500, isPlaying: s.isPlaying };
        return;
      }

      // Recent local action: trust it until the server acknowledges it.
      const pend = pendingRef.current;
      if (pend && t < pend.until) {
        const acked =
          (pend.isPlaying === undefined || pend.isPlaying === s.isPlaying) &&
          (pend.position === undefined || Math.abs(pend.position - target) < 2.5);
        if (acked) pendingRef.current = null;
        return;
      }
      pendingRef.current = null;

      const yt = p.getPlayerState();
      let local = 0;
      try {
        local = p.getCurrentTime() || 0;
      } catch {
        return;
      }
      const drift = target - local;
      const canSeek = t - lastSeekAtRef.current > 2500 || Math.abs(drift) > 8;

      if (s.isPlaying) {
        if (yt !== YT_STATE.PLAYING && yt !== YT_STATE.BUFFERING) {
          if (Math.abs(drift) > 1) {
            lastSeekAtRef.current = t;
            p.seekTo(target, true);
          }
          p.playVideo();
          scheduleBlockCheck();
        } else if (Math.abs(drift) > 1.5 && canSeek) {
          lastSeekAtRef.current = t;
          p.seekTo(target, true);
        }
      } else {
        if (yt === YT_STATE.PLAYING || yt === YT_STATE.BUFFERING) p.pauseVideo();
        if (Math.abs(drift) > 4 && canSeek) {
          lastSeekAtRef.current = t;
          p.seekTo(target, true);
        }
      }
    },
    [clearBlocked, scheduleBlockCheck],
  );

  // The YouTube player is created once the first video shows up: without a
  // videoId the API never fires onReady and the room would stay "Loading…".
  const [playerEpoch, setPlayerEpoch] = useState(() => (state?.videoId ? 1 : 0));
  const firstVideoRef = useRef<string | null>(state?.videoId ?? null);

  useEffect(() => {
    if (firstVideoRef.current || !state?.videoId) return;
    firstVideoRef.current = state.videoId;
    setPlayerEpoch(1);
  }, [state]);

  // Create the player only once.
  useEffect(() => {
    if (playerEpoch === 0) return;
    let disposed = false;
    let player: YTPlayer | null = null;
    const host = hostRef.current;
    if (!host) return;

    loadYT().then((YT) => {
      if (disposed || !host) return;
      const inner = document.createElement('div');
      host.appendChild(inner);
      player = new YT.Player(inner, {
        videoId: stateRef.current?.videoId ?? firstVideoRef.current ?? undefined,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          rel: 0,
          iv_load_policy: 3,
          fs: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (disposed || !player) return;
            playerRef.current = player;
            readyRef.current = true;
            loadedRef.current = stateRef.current?.videoId ?? null;
            try {
              player.setVolume(volRef.current);
            } catch {
              /* noop */
            }
            setReady(true);
            reconcile(true);
          },
          onStateChange: (e) => {
            if (e.data === YT_STATE.ENDED) {
              const t = Date.now();
              if (t - endedAtRef.current > 5000) {
                endedAtRef.current = t;
                syncRef.current?.send({ type: 'ended' });
              }
            }
            if (e.data === YT_STATE.PLAYING) clearBlocked();
            reconcile();
          },
          onError: () => {
            setError('Este video no permite reproducción embebida o no existe. Prueba con otro.');
          },
        },
      });
    });

    return () => {
      disposed = true;
      try {
        player?.destroy();
      } catch {
        /* noop */
      }
      playerRef.current = null;
      readyRef.current = false;
      if (host) host.textContent = '';
    };
  }, [playerEpoch, reconcile, clearBlocked]);

  useEffect(() => {
    reconcile();
  }, [state, reconcile]);

  useEffect(() => {
    const iv = setInterval(() => reconcile(), 4000);
    const onVis = () => {
      if (document.visibilityState === 'visible') reconcile(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reconcile]);

  // Progress polling for the seek bar.
  useEffect(() => {
    if (!ready) return;
    const iv = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        setCur(p.getCurrentTime() || 0);
        const d = p.getDuration() || 0;
        if (d > 0) setDur(d);
        setMuted(p.isMuted());
      } catch {
        /* iframe not ready */
      }
    }, 300);
    return () => clearInterval(iv);
  }, [ready]);

  const userPlay = useCallback(() => {
    pendingRef.current = { until: Date.now() + 2500, isPlaying: true };
    syncRef.current?.send({ type: 'play' });
    clearBlocked();
    playerRef.current?.playVideo();
  }, [clearBlocked]);

  const userPause = useCallback(() => {
    pendingRef.current = { until: Date.now() + 2500, isPlaying: false };
    syncRef.current?.send({ type: 'pause' });
    playerRef.current?.pauseVideo();
  }, []);

  const userSeek = useCallback((t: number) => {
    const p = playerRef.current;
    if (!p) return;
    lastSeekAtRef.current = Date.now();
    pendingRef.current = {
      until: Date.now() + 2500,
      position: t,
      isPlaying: stateRef.current?.isPlaying,
    };
    p.seekTo(t, true);
    syncRef.current?.send({ type: 'seek', position: t });
    setCur(t);
  }, []);

  const activateFromOverlay = useCallback(() => {
    const p = playerRef.current;
    const s = stateRef.current;
    const client = syncRef.current;
    if (!p || !s || !client) return;
    p.setVolume(volRef.current);
    p.seekTo(effectivePosition(s, client.serverNow()), true);
    p.playVideo();
    clearBlocked();
  }, [clearBlocked]);

  const changeVolume = (v: number) => {
    setVol(v);
    volRef.current = v;
    setLS('syncplay.vol', String(v));
    const p = playerRef.current;
    if (!p) return;
    if (v === 0) p.mute();
    else {
      p.unMute();
      p.setVolume(v);
    }
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) p.unMute();
    else p.mute();
  };

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void el.requestFullscreen?.().catch(() => {});
  };

  const hasVideo = !!state?.videoId;
  const playing = !!state?.isPlaying;
  const max = Math.max(dur, 1);
  const sliderValue = Math.min(scrub ?? cur, max);
  const fillPct = (sliderValue / max) * 100;
  // Clean cue card before first play: hides the embed's own chrome.
  const cued = hasVideo && ready && !playing && cur < 0.5 && !error;
  const frozen = hasVideo && ready && !playing && !cued;

  const commitScrub = () => {
    if (scrub != null) {
      userSeek(scrub);
      setScrub(null);
    }
  };

  return (
    <div className={`player ${frozen ? 'is-paused' : ''}`} ref={wrapRef}>
      <div className="player-frame">
        <div ref={hostRef} className="yt-host" />

        {hasVideo && !ready && <div className="player-empty">…</div>}

        {!hasVideo && (
          <div className="player-empty">
            <span className="glyph">
              <IconFilm size={22} />
            </span>
            <p>Nada en reproducción todavía</p>
            <button className="btn primary" onClick={onOpenQueue}>
              Añadir un video
            </button>
          </div>
        )}

        {cued && (
          <button className="player-overlay" onClick={userPlay} aria-label="Reproducir">
            {state?.videoTitle && <span className="cue-title">{state.videoTitle}</span>}
            <span className="big-play">
              <IconPlay size={26} />
            </span>
            <span className="cue-hint">Toca para reproducir</span>
          </button>
        )}

        {blocked && (
          <button className="player-overlay" onClick={activateFromOverlay}>
            <span className="big-play">
              <IconPlay size={26} />
            </span>
            <span className="cue-hint">Toca para reproducir con sonido</span>
          </button>
        )}

        {error && <div className="player-error">{error}</div>}
      </div>

      <div className="controls">
        <button
          className="play-btn"
          onClick={playing ? userPause : userPlay}
          disabled={!hasVideo}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
        >
          {playing ? <IconPause size={17} /> : <IconPlay size={17} />}
        </button>
        <span className="time">{fmtTime(scrub ?? cur)}</span>
        <input
          className="seek"
          type="range"
          min={0}
          max={max}
          step={0.1}
          value={sliderValue}
          disabled={!hasVideo}
          style={{
            ['--track' as string]: `linear-gradient(to right, var(--accent) ${fillPct}%, var(--bg3) ${fillPct}%)`,
          }}
          onPointerDown={() => setScrub(cur)}
          onChange={(e) => setScrub(Number(e.target.value))}
          onPointerUp={commitScrub}
          onTouchEnd={commitScrub}
          aria-label="Progreso del video"
        />
        <span className="time">{fmtTime(dur)}</span>
        <button className="icon-btn" onClick={toggleMute} aria-label="Silenciar">
          {muted || vol === 0 ? <IconMute /> : <IconVolume />}
        </button>
        <input
          className="vol"
          type="range"
          min={0}
          max={100}
          value={vol}
          onChange={(e) => changeVolume(Number(e.target.value))}
          aria-label="Volumen"
        />
        <button className="icon-btn" onClick={toggleFullscreen} aria-label="Pantalla completa">
          <IconFull />
        </button>
      </div>

      {state?.videoTitle && (
        <div className="now-playing">
          <span className="title">
            <strong>{state.videoTitle}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
