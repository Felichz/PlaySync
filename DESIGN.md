---
name: PlaySync
description: Synchronized watch parties — "Sofá a medianoche", a warm night room lit by the screen.
colors:
  ground: "#0f0b10"
  well: "#0b080c"
  panel: "#161118"
  raised: "#1f1822"
  raised-2: "#2a2130"
  glass: "rgba(22, 17, 24, 0.72)"
  line: "rgba(255, 228, 214, 0.08)"
  line-strong: "rgba(255, 228, 214, 0.14)"
  ink: "#f7eee9"
  dim: "#b9a9ab"
  faint: "#86767c"
  glow: "#ffb08a"
  glow-hi: "#ffc6a8"
  glow-ink: "#2b130c"
  glow-dim: "rgba(255, 176, 138, 0.14)"
  rose: "#ff8497"
  mint: "#7fdcae"
  danger: "#ff7272"
typography:
  display: "Bricolage Grotesque 700–750 (headlines, titles, room codes)"
  body: "Figtree 400–700 (all UI text), tabular-nums for timecodes"
rounded:
  sm: "10px"
  md: "14px"
  lg: "20px"
  pill: "999px"
---

# Design System: PlaySync

## North Star: "Sofá a medianoche"

Two people in dark rooms in different cities; the only light is the screen. The interface is
that room: a warm plum-black ground, apricot screen-light as the single voice, and the playing
video's own colors spilling into the space behind everything.

## Signature elements

- **Screen light (ambient):** the playing YouTube thumbnail, blurred wide behind the whole room
  (`.ambient` in `Room.tsx`), brighter while playing, crossfading on video change. Drive files
  and the empty room fall back to warm rose/apricot/plum radial light.
- **Ticket:** the room code is a punched cinema ticket (masked notches, dashed perforation,
  connection dot on the stub); click copies the code.
- **Couch:** overlapping avatars in the top bar; yours carries an apricot ring.
- **"Viendo juntos":** live chip with a three-bar equalizer while playing; red when reconnecting.
- **Logo:** two play marks, a rose outline catching up to a solid apricot one (sync).

## Color

- **Glow (apricot #ffb08a, gradient #ffc4a2→#ff9e7c):** every primary action, the transport,
  seek/volume fill, focus rings, own chat bubbles (tinted with rose), active tab accents.
- **Rose #ff8497:** only as glow's partner (logo, own-bubble tint, ambient light).
- **Mint:** "connected/here" dots only. **Danger:** errors and reconnecting only.
- Neutrals are warm (plum-tinted); hairlines are warm white-alpha, never gray.

## Typography

- Bricolage Grotesque: landing headline (clamp 44–72px, −0.03em), player title, panel heads,
  empty-state titles, room codes (0.14em tracking), queue indices.
- Figtree: everything read — 14.5px body, 12–13.5px labels/meta; timecodes use tabular numerals.

## Surfaces & shape

- Floating UI (top bar, tab track, side panel, transport bar, toast) is glass over the ambient
  light: `--glass` + 16–22px backdrop blur + warm hairline.
- Radii: 10px controls, 14px rows/large buttons, 16–22px panels/cards/player, pills for status
  (chips, badges, toasts, system notices).
- Segmented tabs share one sliding indicator (`.seg`, `--i` = active index); the mobile tab bar
  has a glowing top marker that slides the same way.

## Components

- **Buttons:** `.primary` apricot gradient with dark ink; `.ghost` raised plum; `.soft`
  glow-tinted (Invitar, invite card). Disabled primary turns to raised plum, not a faded glow.
- **Inputs:** well-black, strong hairline, 4px glow-dim focus ring. Composite fields (chat
  composer, queue add) ring only when the text input itself has focus.
- **Chat:** consecutive messages from one person within 3 min group (shared header, tightened
  inner corners, avatar on the last one); emoji-only messages render at 32px; runs of 3+ system
  notices collapse to the latest one plus a "+N avisos" pill.
- **Queue:** numbered rows, 16:9 thumbnails (Drive files get a glow tile), actions revealed on
  hover (always visible on touch).
- **Player:** 20px frame (16px on phones) with a warm halo while live; overlays use a radial
  scrim and a pulsing play ring.

## Motion

180ms `cubic-bezier(.22,.8,.24,1)` for state; entrances rise 8–14px; new chat messages, queue
rows and avatars animate in. Everything collapses to instant under `prefers-reduced-motion`.

## Layout

Mobile-first column with a bottom tab bar; at ≥940px (or landscape ≥520px) the stage and a
400px side console sit side by side. Phones ≤640px hide the brand, compress the ticket to its
dot, and reduce the live chip and Invitar to icons.
