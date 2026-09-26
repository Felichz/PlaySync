// Sync client: WebSocket + clock offset estimation (NTP-lite).
import type { ClientToServer, RoomState, ServerToClient } from '../../shared/protocol';

export type ConnStatus = 'connecting' | 'online' | 'offline';

export class SyncClient {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private backoff = 500;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private pingTimer: ReturnType<typeof setInterval> | undefined;
  private closed = false;
  /** serverClock - localClock difference, in ms. */
  offset = 0;
  onMessage: ((m: ServerToClient) => void) | null = null;
  onStatus: ((s: ConnStatus) => void) | null = null;
  onOpen: (() => void) | null = null;

  constructor(url?: string) {
    this.url =
      url ?? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
  }

  connect(): void {
    this.closed = false;
    this.clearRetry();
    this.setStatus('connecting');
    this.open();
  }

  close(): void {
    this.closed = true;
    this.clearRetry();
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = undefined;
    this.ws?.close();
    this.ws = null;
  }

  isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  send(msg: ClientToServer): void {
    if (this.isOpen()) this.ws!.send(JSON.stringify(msg));
  }

  serverNow(): number {
    return Date.now() + this.offset;
  }

  private open(): void {
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch {
      this.scheduleRetry();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      this.backoff = 500;
      this.setStatus('online');
      this.startPing();
      this.onOpen?.();
    };
    ws.onmessage = (ev) => {
      let msg: ServerToClient;
      try {
        msg = JSON.parse(String(ev.data));
      } catch {
        return;
      }
      if (msg.type === 'pong') {
        const t2 = Date.now();
        const rtt = t2 - msg.t0;
        // A throttled background tab can process a pong minutes late, which
        // would poison the offset; only trust fresh samples.
        if (rtt >= 0 && rtt < 5_000) {
          this.offset = msg.t1 - (msg.t0 + rtt / 2);
        }
        return;
      }
      this.onMessage?.(msg);
    };
    const dropped = () => {
      if (this.closed) return;
      if (this.pingTimer) clearInterval(this.pingTimer);
      this.pingTimer = undefined;
      this.setStatus('offline');
      this.scheduleRetry();
    };
    ws.onclose = dropped;
    ws.onerror = dropped;
  }

  private scheduleRetry(): void {
    if (this.closed || this.retryTimer) return;
    const delay = this.backoff + Math.random() * 250;
    this.backoff = Math.min(this.backoff * 2, 8000);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      this.open();
    }, delay);
  }

  private clearRetry(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
  }

  private startPing(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    const ping = () => this.send({ type: 'ping', t0: Date.now() });
    ping();
    this.pingTimer = setInterval(ping, 8000);
  }

  private setStatus(s: ConnStatus): void {
    this.onStatus?.(s);
  }
}

/** Playback position extrapolated onto the server clock. */
export function effectivePosition(s: RoomState, serverNow: number): number {
  const hasSource = !!s.videoId || !!s.media;
  if (!hasSource) return 0;
  const p = s.isPlaying ? s.position + (serverNow - s.lastUpdatedAt) / 1000 : s.position;
  return Math.max(0, p);
}
