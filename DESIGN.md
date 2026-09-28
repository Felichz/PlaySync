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
colors-light:
  ground: "#f3ebe4"
  well: "#fffbf8"
  panel: "#fbf6f2"
  raised: "#eee4dd"
  raised-2: "#e4d7cf"
  glass: "rgba(252, 248, 244, 0.74)"
  line: "rgba(74, 38, 48, 0.10)"
  line-strong: "rgba(74, 38, 48, 0.17)"
  ink: "#2a1b22"
  dim: "#65525a"
  faint: "#76626a"
  glow: "#b5481f"
  glow-hi: "#9a3a18"
  glow-ink: "#fff8f3"
  glow-dim: "rgba(196, 85, 44, 0.12)"
  glow-grad: "#c75830 to #a93f1a"
  rose: "#c93f62"
  mint: "#23895b"
  danger: "#b8322f"
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

- **Screen light (ambient):** what's on screen, blurred wide behind the whole room
  (`Ambient.tsx`). It follows the video through YouTube's storyboard (the seek-preview sprite,
  one frame every 2–5 s, nearest frame to the room's position), crossfading 1.8 s between frames
  and brighter while playing. The static thumbnail sits underneath as the fallback. Drive files
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

## Light edition: "Matinée"

The same couch on a Sunday afternoon. Dark stays the default when the system has no preference
(night-first); light follows `prefers-color-scheme: light` or the person's pick.

- **Ground:** warm linen `#f3ebe4`, never pure white. Panels are near-white glass
  (`rgba(252, 248, 244, 0.74)`), inputs a bright well `#fffbf8`, others' chat bubbles and ghost
  buttons a sand `#eee4dd`. Hairlines are plum-brown alpha (`rgba(74, 38, 48, 0.10 / 0.17)`).
- **Ink:** plum-brown `#2a1b22` (13.9:1 on the ground), dim `#65525a` (5.6:1), faint `#76626a`
  (4.8:1).
- **Accent:** apricot can't carry text on linen, so glow becomes terracotta `#b5481f` (4.6:1, text
  and fills alike), `#9a3a18` for text on glow tints, and primary buttons a `#c75830 → #a93f1a`
  gradient with cream ink `#fff8f3` (4.9:1 at the label). Rose `#c93f62`, mint `#23895b` and
  danger `#b8322f` are the same roles, deepened for a light ground.
- **Depth:** shadows are warm brown (`rgba(84, 44, 36, …)`) and short, with a 1px white inset on
  glass; black shadows are never used on linen. Segmented thumbs and switch knobs turn white.
- **The screen stays dark.** `.player-frame` (and the player in fullscreen) re-declares the night
  tokens, so the video, its overlays, floating reactions and the YouTube search keep the cinema
  look, a dark screen in a lit room, grounded by a warm shadow.
- **Screen light** is a softer wash in daylight (opacity 0.22, 0.32 while playing) and the
  vignette fades to linen instead of black. Chat names use the person's hue at `62% / 32%`
  instead of `78% / 76%` (`--name-s` / `--name-l`).

**Choosing a theme:** a sun/moon segmented control, the EN/ES switch's twin, sits next to it on
the landing page and on the preferences line of the People panel (which is also where settings
live on phones). The choice is stored in `localStorage['playsync:theme']` (`'light'` or `'dark'`);
without it the app follows the system live. An inline script in `index.html` sets
`<html data-theme>`, `color-scheme`, `<meta name="theme-color">` (`#f3ebe4` / `#0f0b10`) and the
iOS status bar style before first paint. The PWA manifest keeps the night colors for the splash.

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
- **YouTube search:** replaces the screen for people with control (idle, ended, embed refused):
  4-up thumbnail grid with duration badges and hover play; a container query switches it to a
  dense list inside small frames. "+ Cola" pills turn glow-tinted once queued.
- **Permissions:** crown badge on the host's avatar; host toggles per person with a glow switch
  and a "Todos controlan" switch; viewers see a lock on the play button, a "Solo miras · Pedir el
  control" pill and a dashed note in the queue. Control requests drop in as a glass banner.
- **Floating reactions:** GIFs, stickers and emoji-only messages rise from the bottom of the
  frame on a random lane with the sender's name chip (glow for your own), ~5.6s, fullscreen too.

## Motion

180ms `cubic-bezier(.22,.8,.24,1)` for state; entrances rise 8–14px; new chat messages, queue
rows and avatars animate in. Everything collapses to instant under `prefers-reduced-motion`.

## Layout

Mobile-first column with a bottom tab bar; at ≥940px (or landscape ≥520px) the stage and a
400px side console sit side by side. Phones ≤640px hide the brand, compress the ticket to its
dot, and reduce the live chip and Invitar to icons.
