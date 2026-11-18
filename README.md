# PlaySync

Watch YouTube or a public Google Drive video in sync with people on other devices. Create a room, share a six-character code, and play, pause and seek stay aligned for everyone while you chat.

**[Live demo](https://playsync.medanolabs.com)** · **[Case study](https://felix.medanolabs.com/work/playsync/)** · **Author: [Felix Andersson](https://felix.medanolabs.com/)**

> The demo runs on a free Render instance that sleeps when idle, so the first load can take up to a minute.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/readme/01-room-dark.webp">
  <img src="docs/readme/01-room-light.webp" width="100%" alt="PlaySync, screenshot in a browser window. Same video. Same second. Create a room, share a code and watch YouTube together while you chat. No accounts. Marked: 1, The room code. Share it and the other person is in. 2, Who is here, and whether the room is watching together. 3, Chat, queue and people share one panel.">
</picture>

## What it is

A watch party for two or three people in different places, on any mix of phones and computers. No accounts and nothing to install: open the site, create a room and send the link (`#/r/CODE`). It can also be installed as a Progressive Web App on Android, iOS and desktop. The interface is in English by default, with a Spanish version (EN / ES switch on the landing page and in the room's People panel); code and docs are in English.

YouTube video never passes through the server. Each client plays the official YouTube embed directly; the server holds the room's state and relays small JSON messages over one WebSocket. The server owns the playback clock and each client steers its own player toward it. Most of the engineering is in keeping, for example, a phone on mobile data and a desktop on Wi-Fi within a second or two of each other through buffering, background tabs, autoplay blocks and reconnects.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/readme/02-search-dark.webp">
  <img src="docs/readme/02-search-light.webp" width="100%" alt="PlaySync, screenshot in a browser window. Pick the next one without leaving the room. YouTube search inside the player, with no API key. What you add goes to a queue that plays one video after another.">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/readme/03-guest-dark.webp">
  <img src="docs/readme/03-guest-light.webp" width="100%" alt="PlaySync, screenshot on a phone. A guest, on a phone. Guests watch in sync and can ask for control. Chat, queue and people become a tab bar at the bottom.">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/readme/04-landing-dark.webp">
  <img src="docs/readme/04-landing-light.webp" width="100%" alt="PlaySync, screenshot in a browser window. A room in one step. Type a name and create a room, or join with a code. It works in any browser and installs as an app.">
</picture>

## Features

- **Room-wide playback**: play, pause, seek and end of video apply to everyone; the queue advances automatically.
- **Rooms by code**: six characters from an alphabet without look-alikes (no `0/O`, `1/I/L`), shareable as a link. No sign-up.
- **Roles**: whoever opens the room hosts it. The host grants or revokes control per person, or lets everyone control. Viewers can request control; the host gets a one-tap prompt.
- **Queue** from YouTube links (`watch`, `youtu.be`, `shorts`, `live`, `embed`) and public Google Drive video files.
- **YouTube search** in the player for people with control: shown when nothing is playing, after the last video ends, or when a video cannot be embedded.
- **Chat** with system notices (joins, leaves, what's playing), an emoji picker with per-user recents, and Giphy GIFs and stickers with search and recents.
- **Floating reactions**: GIFs, stickers and emoji-only messages float over the video for everyone, including in fullscreen.
- **Screen light**: the colors of the playing YouTube video are projected behind the room, sampled from YouTube's seek-preview frames, with the thumbnail as a fallback.
- **Name prompt**: someone who opens a room link without a name is asked for one, and can skip as Guest.
- **Custom controls** (YouTube's own controls are hidden) and a "tap to join with sound" overlay when the browser blocks autoplay, as iOS does.
- **Installable PWA** with a manifest, an auto-updating service worker and generated icons.
- **Light and dark themes**: follows the system setting by default, with a switch next to the language switch. The player keeps a dark frame in the light theme.
- **Responsive layout**: bottom tab bar on phones; video and side panel side by side from 940px wide, or in landscape from 520px.

## How sync works

**The server owns the clock.** For each room, `server/index.ts` stores the source (`videoId` or a Drive `media` item), `isPlaying`, `position` and `lastUpdatedAt` in its own clock. While playing, the effective position is `position + (now - lastUpdatedAt)`. Every change goes through `commit()`, which first rebases `position` to the effective position, so play, pause and seek never lose time. Every `state` message carries `serverTime`, and the server re-broadcasts state every 5 s even when nobody acts. When the last person leaves, the room pauses and freezes its position, so it resumes where it stopped.

**Each client estimates the server clock.** `src/lib/sync.ts` pings on connect and every 8 s and computes `offset = t1 - (t0 + rtt / 2)` (NTP-style). Samples with a round trip of 5 s or more are discarded, because a throttled background tab can process a pong minutes late. On a dropped connection it reconnects with exponential backoff (0.5 s doubling to 8 s, with jitter), rejoins, and receives the full state, chat and participant list in the `welcome` message.

**A reconcile loop steers the local player** (`src/components/Player.tsx`). It extrapolates the target position on the server clock and compares it with the player. It runs on every state message (throttled to once per 250 ms), every 4 s, and immediately when the tab becomes visible again, at which point the client also sends a `sync-request`.

| Situation | What the client does |
| --- | --- |
| Room playing, local player stopped | Seek if drift exceeds 1 s, then play |
| Room playing, local player playing | Seek if drift exceeds 1.5 s, at most once every 2.5 s unless drift exceeds 8 s |
| Room paused | Pause; seek only if drift exceeds 4 s |
| The user just played, paused or seeked | Trust the local action for 2.5 s, until the server echoes it back |
| Player still not started 1.4 s after a sync play | Show the "tap to join with sound" overlay (autoplay policy) |

The same loop drives a native `<video>` element for Drive files. Clients report end of video at most once every 5 s, and the server ignores repeats within 3 s, so two clients finishing together advance the queue once.

## How it's built

**Roles are enforced on the server.** Every intent that changes playback or the queue is in `CONTROL_INTENTS`; the server checks the sender's role and answers a viewer with a `forbidden` error instead of trusting the UI. The host is identified by a stable per-browser id (kept in `localStorage`, never sent to other clients), so the role survives reloads. If the host is gone for more than a minute, the role passes to the person who has been in the room longest. Control requests are limited to one every 20 s per person.

**Google Drive files go through a streaming proxy.** `/api/media/:fileId` resolves a public Drive file to a direct download URL, replaying Drive's virus-scan confirmation form when it appears, and caches the result for 30 minutes. It forwards the browser's `Range` header, so seeking works, and re-resolves once if Google's time-limited URL has expired. A watchdog closes the connection if Google stops sending for 12 s, so the browser re-requests the range instead of hanging. Nothing is stored on the server.

- Files above `MAX_MEDIA_MB` (default 3000) are rejected with an error message. The file must be shared as "Anyone with the link"; Drive may throttle heavily downloaded files (`DRIVE_QUOTA`) until the next day.
- Unlike YouTube, these bytes do flow through the server (Google to server to each viewer). A 500 MB file watched by two people costs about 1 GB of egress, which matters on a free hosting tier.

**Direct video links skip the server.** A link to a `.mp4`, `.webm`, `.m4v`, `.mov` or `.ogv` file (an R2 or S3 bucket, any static host) is shared as a URL, and each browser loads it from that host, with `Range` requests for seeking. The host must serve those requests publicly; no CORS setup is needed to play.

**YouTube search without a key.** `/api/youtube/search` reads the data embedded in YouTube's results page and caches each query for 15 minutes. If that stops working, setting `YOUTUBE_API_KEY` makes the server fall back to the YouTube Data API v3 (100 quota units per search, 10,000 per day free).

**Giphy through the server.** The client calls `/api/giphy/*` on its own server, so the key never reaches the browser; search results are cached for 10 minutes and trending for 30. Without `GIPHY_API_KEY` everything else works and the GIF and sticker tabs show setup instructions.

**Hardening**

- WebSocket frames are capped at 16 KB; malformed messages are dropped and handler errors are caught per message.
- All input is normalized: room codes, 11-character video ids, Drive file ids, names (24 chars), titles (200), chat messages (500).
- Chat is rate-limited to 6 messages per 3 s per connection, and each room keeps its last 100 messages.
- Chat media must be `https` on `*.giphy.com`, so the chat can't be used to embed arbitrary images.
- The static file server rejects path traversal; hashed assets are served as immutable.
- Dead connections are detected with a WebSocket ping every 30 s; empty rooms are deleted after 2 hours.

**Where to look**

| Path | What's there |
| --- | --- |
| `shared/protocol.ts` | Message types shared by server and client |
| `server/index.ts` | Rooms, roles, sync state, HTTP API, Drive proxy, static files |
| `src/lib/sync.ts` | WebSocket client, clock offset, reconnection |
| `src/components/Player.tsx` | YouTube and `<video>` players, reconcile loop, controls |
| `src/hooks/useRoom.ts` | Room state and actions for the UI |
| `scripts/smoke.mjs` | Two-client protocol test |

## Stack

- **Server**: Node 20+, [`ws`](https://github.com/websockets/ws), TypeScript run with `tsx`. One process serves the static build, `/api/*` and `/ws` on the same port. Room state lives in memory.
- **Client**: React 19, Vite 6, TypeScript, the YouTube IFrame Player API, `vite-plugin-pwa` (Workbox). Hand-written CSS, no UI library.

## Getting started

Requires Node 20 or newer.

```bash
npm install
npm run dev        # server on :3001 (tsx watch) + Vite on :5173, proxying /ws and /api
```

Open http://localhost:5173. Everything works without configuration except GIFs and stickers.

Optional environment variables. For local development put them in a `.env` file at the repo root (see `.env.example`); the server reads it at startup.

| Variable | Purpose |
| --- | --- |
| `GIPHY_API_KEY` | Enables GIFs and stickers. Free key from [developers.giphy.com](https://developers.giphy.com) (Create an App, API). |
| `YOUTUBE_API_KEY` | YouTube Data API v3 fallback for search, only used if keyless search fails. |
| `MAX_MEDIA_MB` | Size limit for Drive files. Default `3000`. |
| `PORT` | Server port. Default `3001`. |
| `API_PORT` | Dev only: where Vite proxies `/ws` and `/api`. Default `3001`. |

Other scripts:

```bash
npm run check      # type-check client and server
npm run build      # production build: dist/, service worker, manifest
npm start          # serve everything from one process at http://localhost:3001
npm run icons      # regenerate public/icons/*.png from the logo (uses sharp)
```

## Deploy

It is a single process, so any host that runs Node and supports WebSockets works. A [`render.yaml`](render.yaml) blueprint is included: a free web service with build `npm install && npm run build`, start `npm start`, health check on `/api/health`, Node 20 and `MAX_MEDIA_MB=3000`. Set `GIPHY_API_KEY` (and optionally `YOUTUBE_API_KEY`) in the service's Environment settings.

On a VPS: `npm run build && PORT=8080 npm start` behind nginx with TLS.

The public address, playsync.medanolabs.com, is a Cloudflare Worker (`edge/`) that forwards pages, the API and the `/ws` WebSocket to the server running the app. It contains no app code. The server address is the `ORIGIN` secret, so it does not appear in the repo: `npx wrangler secret put ORIGIN -c edge/wrangler.jsonc`, then `npx wrangler deploy -c edge/wrangler.jsonc`.

Installing the app and the service worker require HTTPS (or `localhost`); Render provides HTTPS by default. To install: Chrome on Android, menu then "Install app"; Safari on iPhone, Share then "Add to Home Screen"; Chrome or Edge on desktop, the install icon in the address bar.

## Testing

`scripts/smoke.mjs` connects two WebSocket clients to a running server and walks through the protocol:

```bash
npm start          # in one terminal
npm run smoke      # in another
```

It checks:

- join and system notices; chat and GIF propagation; rejection of non-Giphy media;
- load, play and seek propagation; the ping/pong clock exchange; that the effective position extrapolates correctly after 1.5 s;
- queue add and auto-advance, and the ended state;
- roles: the room's creator hosts and a joiner only watches, a viewer's `play` is refused, the host receives a control request, and a granted viewer can play;
- that the Drive endpoint answers an invalid file id with a JSON error.

`SMOKE_URL`, `SMOKE_HTTP` and `SMOKE_ROOM` point it at another server or room. It tests the protocol and server, not a real browser player.

## Known limitations

- Videos whose owner disabled embedding can't play; the room shows a notice, and whoever has control gets the search screen to pick another.
- YouTube ads show as in any embed and are not skipped.
- Rooms and chat live in memory: a restart empties them, and the app runs as a single instance.
- A room code is the only access control: anyone with the code can join as a viewer.

A possible next step is voice chat in the room over WebRTC.
