# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (installable PWA; must stay first-class on Android, iOS and desktop browsers)

## Users

Close pairs / small groups of 2-3 (long-distance partners, close friends) watching YouTube
together at night from different cities and devices (mix of phones and PCs). Spanish-speaking.

## Product Purpose

SyncPlay is a synchronized YouTube watch party with no accounts: create a room, share a code,
and everyone's play/pause/seek stays in sync while they chat. Success = a couple 8 timezones
apart feels like they are on the same couch.

## Positioning

The video never touches the server — each client streams from YouTube directly while only tiny
sync/chat messages route through the room server. No sign-up, no install required, works in any
browser and installs as a PWA (including iOS Add to Home Screen).

## Operating Context

- Night-time, long sessions, often with the phone in one hand while the video plays.
- Flow: land → create/join room by code → paste YouTube links → watch in sync → chat with
  emojis/GIFs/stickers → queue auto-advances.
- Chat panel with WhatsApp-style picker (emoji categories + recents, Giphy GIFs/stickers + recents).
- Hosted on Render free tier (sleeps when idle; first load can be slow after 15 min).

## Capabilities and Constraints

- YouTube IFrame Player API with custom controls (YouTube chrome hidden); iOS autoplay-with-sound
  requires the "tap to play" overlay; embed-blocked videos show an inline warning; ads show.
- Giphy GIFs/stickers optional (server-side GIPHY_API_KEY, key never exposed; proxy + cache).
- Rooms and chat live in memory (lost on server restart); rooms dropped after 2h empty.
- UI language: Spanish. Repo/docs/commits: English.
- Single Node process serves static build + WebSocket.

## Brand Commitments

- Name "SyncPlay" is binding.
- User's stated bar for the redesign: "original pero pro, elegante moderno pero bonito, con
  detalles" — original, professional, elegant/modern, pretty, detail-rich. Not infantile,
  not corporate, not a Discord/Rave lookalike.

## Evidence on Hand

- Live: https://syncplay-avtu.onrender.com · repo github.com/Felichz/SyncPlay
- Full working feature set (rooms, sync, chat+media, queue, PWA) — redesign must keep all of it.

## Product Principles

1. Sync is the product: state of the room (playing, position, who's in) must always read instantly.
2. Zero-friction entry: from URL to watching in under 10 seconds, no account ever.
3. Night-first: designed for dark rooms and long sessions; comfortable over flashy.
4. Every device first-class: phone portrait/landscape, tablet, desktop — one coherent world.
5. Intimate, not enterprise: it's a couch with friends, not a conference room.
