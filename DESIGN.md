---
name: PlaySync
description: Synchronized YouTube watch parties — a refined dark pro-tool interface.
colors:
  bg0: "#08090a"
  bg1: "#0d0e10"
  bg2: "#141517"
  bg3: "#1a1c1f"
  bg-hover: "#1f2124"
  line: "rgba(255, 255, 255, 0.07)"
  line-strong: "rgba(255, 255, 255, 0.12)"
  ink: "#f7f8f8"
  dim: "#9aa0a6"
  faint: "#6b7075"
  accent: "#7b83eb"
  accent-hi: "#8d94f0"
  accent-dim: "rgba(123, 131, 235, 0.14)"
  green: "#4cc38a"
  green-dim: "rgba(76, 195, 138, 0.15)"
  red: "#f95d5d"
  screen: "#000000"
  red-dim: "rgba(249, 93, 93, 0.14)"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.028em"
  cue:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(15px, 2.4vw, 20px)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  emoji:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1.35rem"
  emoji-category:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1.1rem"
  emoji-solo:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: 1.25
  timestamp:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 500
    lineHeight: 1.4
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.006em"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.14em"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "14px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hi}"
  button-ghost:
    backgroundColor: "{colors.bg2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  input:
    backgroundColor: "{colors.bg0}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "9px 12px"
  room-pill:
    backgroundColor: "{colors.bg2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  live-chip-live:
    backgroundColor: "{colors.green-dim}"
    textColor: "#d7f5e5"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: PlaySync

## Overview

**Creative North Star: "Signal, no noise."**

PlaySync's interface is a precision instrument in layered neutral black. Everything is quiet
until it matters: hairline borders separate surfaces instead of boxes-in-boxes, one indigo
accent marks every interactive moment, and the only chromatic statements are semantic
(green = the room is playing, red = errors). The reference bar is Linear/Raycast — craft you
feel in spacing, hover states and micro-transitions, not in decoration. There are no metaphor
props: no instruments, no costumes; the product's life is carried by a single pulsing green
"En vivo" chip.

**Key Characteristics:**
- Layered neutral blacks, four surface steps plus a hover step.
- One accent (indigo) at ≤10% coverage of any screen.
- Hairline white-alpha borders (7–12% white) instead of solid grays.
- 150ms ease-out on every state change; nothing bounces, nothing glows.
- Inter everywhere; monospace reserved strictly for codes and timecodes.

## Colors

A near-monochrome neutral stack with a single indigo voice. Green and red exist only as
semantic signals, never as decoration.

### Primary
- **Indigo** (#7b83eb, hover #8d94f0): every interactive moment — primary buttons, play
  transport, active tabs, seek fill, focus rings, badges, the user's own chat bubbles.
  Dim variant rgba(123,131,235,0.14) is the tint for hover washes and own-message bubbles.

### Secondary
- **Signal Green** (#4cc38a): the room-is-playing signal only (live chip, connection dot).
  Dim variant for its chip background.

### Tertiary
- **Signal Red** (#f95d5d): errors and reconnecting state only. Never decoration.

### Neutral
- **Void** (#08090a): page ground.
- **Panel** (#0d0e10): cards, side panels, picker.
- **Raised** (#141517): inputs at rest, chat bubbles, tabs, toasts.
- **Raised Hover** (#1a1c1f / hover #1f2124): interactive surface steps.
- **Hairline** (rgba(255,255,255,0.07)) and **Hairline Strong** (0.12): all borders.
- **Ink** (#f7f8f8): primary text. **Dim** (#9aa0a6): secondary text.
- **Faint** (#6b7075): placeholders and metadata only, never body copy.

### Named Rules
**The One Voice Rule.** Indigo appears only where a user can act or where their own message
lives. If a surface is not interactive, it has no accent.
**The Semantic Color Rule.** Green means playing; red means error. Neither is used decoratively.

## Typography

**Body Font:** Inter (system-ui fallback), 14px base, −0.006em tracking.
**Label Font:** Inter 11.5px/500 for section labels.
**Mono Font:** IBM Plex Mono (400/500) — room codes, timecodes, code input only.

**Character:** One tight, neutral workhorse face at small sizes; monospace is a punctuation
mark, not a personality.

### Hierarchy
- **Display** (700, 30px, 1.15, −0.028em): landing headline only.
- **Title** (600, 13.5px, 1.35): buttons, video titles, names, panel headers.
- **Body** (400, 13–14px, 1.45–1.5): chat text, hints, queue titles.
- **Label** (500, 11.5px, 0.02em): field labels, section labels ("Tu nombre", "Recientes").
- **Mono readout** (500, 11.5–12px, 0.14em): room codes, `0:25` timecodes.

### Named Rules
**The Mono Punctuation Rule.** Monospace marks machine data (codes, clocks); it never styles
buttons or prose.

## Layout

Single-column mobile-first; at ≥940px (or landscape ≥520px) the room becomes a two-pane
instrument: player stage left, 380px side console right. Compact phones (≤560px) hide the
volume slider and tighten the topbar. Panel paddings step 8/12/16px; list rows are separated
by hairlines or hover surfaces, never nested cards.

## Elevation & Depth

Depth comes from surface layering (four black steps) plus two soft black shadows — never
colored halos. Buttons carry a 1px inset top highlight to sit above their ground.

### Shadow Vocabulary
- **shadow-1** (`0 1px 2px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)`): inputs at rest, small keys.
- **shadow-2** (`0 1px 2px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.3)`): cards, the player
  frame, toasts.

### Named Rules
**The Layered Black Rule.** Elevation is a surface step first; shadows only accompany a real
floating element (card, overlay), never a flat list row.

## Shapes

Radii: 6px (small controls, thumbs), 8px (buttons, inputs, rows), 12px (cards, panels, player
frame). 999px pills are reserved for status readouts (room code pill, live chip, count badges)
and chat avatars. Bubbles keep one broken corner (4px) toward the sender edge.

## Components

### Buttons
- **Shape:** 8px radius, 8×14px padding; icon-only 32px squares.
- **Primary:** indigo fill, white text, inset white top highlight; hover lightens; active
  presses down 0.5px.
- **Ghost:** raised surface, hairline border; hover raises border to strong.

### Inputs / Fields
- **Style:** void-black fill, strong hairline border, 8px radius.
- **Focus:** indigo border + 3px accent-dim ring. Hover raises border. Code input is mono,
  centered, 0.18em tracking.

### Chat
- **Bubbles:** raised surface with hairline border, 12px radius broken to 4px at the sender
  corner; own messages use the accent-dim tint with indigo border. Hover washes the row
  (indigo tint for own messages). Emoji-only messages render at 26px, chrome stripped.

### Queue Rows
- 8px radius, transparent until hover (raised surface + hairline border); action buttons
  hidden until row hover (always visible on touch). The player carries playing state — rows
  stay neutral.

### Navigation
- Side tabs: quiet pills, active = raised surface; bottom mobile tabs: column layout, active =
  accent tint with accent text. Badges are indigo pills with white numerals.

## Do's and Don'ts

### Do:
- **Do** use Inter 13–14px for all UI text; −0.006em body tracking.
- **Do** keep borders as white-alpha hairlines (0.07–0.12) on every raised surface.
- **Do** reserve mono (IBM Plex Mono) for room codes and timecodes.
- **Do** transition states at 150ms ease-out; scale the seek thumb on hover.

### Don't:
- **Don't** introduce a second accent or colored decoration; green/red are semantic only.
- **Don't** use metaphor instruments, retro faces, or skin props — elegance is spacing and
  order, not costume.
- **Don't** nest cards; rows live on hairlines or hover surfaces.
- **Don't** use pills for buttons — pills are status readouts only.
