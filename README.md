# PlaySync — Watch YouTube together

A synchronized YouTube watch party, with no accounts, for every platform: it runs in the browser on any device (PC, Android, iPhone) and installs as a **Progressive Web App**.

## Features

- 🎬 **Real sync**: the server is the source of truth. Anyone's play, pause and seek propagate to everyone; each client estimates the server clock (NTP-lite over the WebSocket) and automatically corrects drift over 1.5 s. It resyncs when the tab regains focus or the connection drops.
- 💬 **Real-time chat** with system messages (join/leave/now playing), an emoji picker with per-user recents (WhatsApp-style), and GIFs/stickers via Giphy with search and your recently sent items.
- 📋 **Video queue**: paste YouTube links (`watch`, `youtu.be`, `shorts`, `live`…); they play in order and the room auto-advances when a video ends.
- 👥 **Code-based rooms** with a shareable link (`#/r/CODE`), no sign-up.
- 📱 **Installable PWA** on Android, iPhone (Add to Home Screen) and desktop, with manifest, auto-updating service worker and generated icons.
- 🎨 Responsive layout: bottom tab bar on mobile, side panel on desktop.
- ⏯ Custom controls (YouTube's own chrome is hidden): play/pause, seek bar, volume, mute and fullscreen. A "tap to play" overlay appears whenever the OS blocks autoplay with sound (iOS).

## Stack

- **Server**: Node + `ws` (TypeScript via `tsx`). Serves the static build and the WebSocket on the same port. Room state is in-memory (rooms are dropped after 2 h empty).
- **Client**: Vite + React + TypeScript, YouTube IFrame Player API, `vite-plugin-pwa` (Workbox).

## Development

```bash
npm install
npm run icons      # once: generates public/icons/*.png (requires sharp)
npm run dev        # server on :3001 + vite on :5173 (/ws proxy included)
```

Open http://localhost:5173.

## Production

```bash
npm run build      # builds dist/ + service worker + manifest
npm start          # serves everything at http://localhost:3001 (set PORT to change it)
```

Protocol smoke test (with the server running in another terminal):

```bash
npm run smoke      # 10 checks: join, chat, play/pause/seek, queue, clock, etc.
```

## Enabling GIFs and stickers (Giphy)

The GIF/sticker picker is powered by [Giphy](https://developers.giphy.com). The key stays
server-side; the client talks to `/api/giphy/*` on your own server (cached ~10 min per query).

1. Create a free account at developers.giphy.com → **Create an App** → choose "API" → copy the key.
2. **Local dev**: copy `.env.example` to `.env` and set `GIPHY_API_KEY=...`, then restart the server.
3. **Render**: your service → **Environment** → add `GIPHY_API_KEY` → save (it redeploys).

Without the key, everything else works — the GIF/sticker tabs just show setup instructions.
Only `https://*.giphy.com` media URLs are accepted by the server, so the chat can't be used to
embed arbitrary images.

## Playing files from Google Drive

Paste a public Drive link (`drive.google.com/file/d/…/view`) into the queue. The server
resolves Drive's download interstitial and streams the bytes to every client with HTTP Range
support, so seeking works. Nothing is stored server-side.

- **Limit**: files above `MAX_MEDIA_MB` (default **500**) are rejected with a clear message.
- **Bandwidth**: bytes flow Google → server → each viewer, so a 500 MB file watched by two
  people costs ~1 GB of server egress. Keep it in mind on Render's free tier (5 GB/month).
- The file must be shared as "Anyone with the link". Drive may throttle files with heavy
  traffic (`DRIVE_QUOTA`) — try again the next day.

## Deploy

Any host that runs Node and supports WebSockets works (it is a single process):

- **Render/Railway/Fly**: build `npm install && npm run build`, start `npm start`. The port comes from `PORT`. A `render.yaml` blueprint is included.
- **VPS**: `npm run build && PORT=8080 npm start` behind nginx with TLS.

> **Important for PWA/iOS**: installing the app and the service worker require HTTPS (or `localhost`). Render/Fly give you HTTPS out of the box.

### Installing it as an app

- **Android (Chrome)**: ⋮ menu → "Install app".
- **iPhone (Safari)**: Share → "Add to Home Screen".
- **Desktop (Chrome/Edge)**: install icon in the address bar.

## How the sync works

1. The server stores per room: `videoId`, `isPlaying`, `position` and `lastUpdatedAt` (its own clock). The effective position is `position + (now - lastUpdatedAt)` while playing; every broadcast carries `serverTime`.
2. Each client measures its clock offset with NTP-style pings (`offset = t1 - (t0 + rtt/2)`).
3. On every state message the client extrapolates the target position and corrects: seek when drift exceeds 1.5 s (rate-limited), play/pause when it differs. Local actions set a 2.5 s "pending guard" so they don't fight the server echo.
4. Periodic corrections run every 4 s (the server broadcasts a heartbeat every 5 s), plus a forced resync when the tab becomes visible again.

## Known limitations

- Videos whose owner disabled embedding show a warning (there is no legitimate bypass).
- YouTube ads show up as in any embed; they are not skipped.
- Chat/room history lives in memory: if the process restarts, rooms start empty.

## Roadmap ideas

- Room voice chat via WebRTC (signaling already travels over the WS).
- "Host only" control mode.
- In-app video search (needs a YouTube Data API key).
