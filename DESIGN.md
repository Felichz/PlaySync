---
name: PlaySync — Al Aire
description: A midnight broadcast studio — ink-blue studio night, amber practicals, red only when ON AIR.
colors:
  studio-night: "#080b11"
  console-raise: "#0d1119"
  console-high: "#131926"
  key-cap: "#1a2233"
  line-strong: "#26304a"
  line-soft: "#1c2438"
  broadcast-ink: "#e9e6dc"
  dim-signal: "#97a1b6"
  faint-label: "#74809b"
  amber-lamp: "#f5b84a"
  amber-deep: "#d99a2b"
  amber-pool: "rgba(245, 184, 74, 0.09)"
  onair-red: "#e5484d"
  red-pool: "rgba(229, 72, 77, 0.16)"
  signal-green: "#3fbf7f"
  lamp-ink: "#241a05"
  lit-red-text: "#ffd7d8"
typography:
  display:
    fontFamily: "Big Shoulders Display, 'Arial Narrow', system-ui, sans-serif"
    fontWeight: 800
    fontSize: "clamp(3.4rem, 14vw, 5.6rem)"
    lineHeight: 0.92
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Big Shoulders Display, 'Arial Narrow', system-ui, sans-serif"
    fontWeight: 700
    fontSize: "0.78rem"
    letterSpacing: "0.08em"
  title:
    fontFamily: "Big Shoulders Display, 'Arial Narrow', system-ui, sans-serif"
    fontWeight: 600
    fontSize: "1.15rem"
    letterSpacing: "0.02em"
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontWeight: 400
    fontSize: "0.95rem"
    lineHeight: 1.45
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, 'Cascadia Code', Menlo, monospace"
    fontWeight: 500
    fontSize: "0.68rem"
    letterSpacing: "0.08em"
rounded:
  key: "8px"
  card: "14px"
  row: "10px"
  lamp: "7px"
  chip: "6px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "14px"
  xl: "22px"
components:
  console-key:
    backgroundColor: "{colors.key-cap}"
    textColor: "{colors.broadcast-ink}"
    rounded: "{rounded.key}"
    padding: "9px 16px"
  console-key-primary:
    backgroundColor: "{colors.amber-lamp}"
    textColor: "{colors.lamp-ink}"
    rounded: "{rounded.key}"
    padding: "9px 16px"
  console-key-big:
    backgroundColor: "{colors.amber-lamp}"
    textColor: "{colors.lamp-ink}"
    rounded: "{rounded.key}"
    padding: "14px 20px"
  console-key-transport:
    backgroundColor: "{colors.amber-lamp}"
    textColor: "{colors.lamp-ink}"
    rounded: "{rounded.key}"
    height: "48px"
    width: "48px"
  console-input:
    backgroundColor: "{colors.console-raise}"
    textColor: "{colors.broadcast-ink}"
    rounded: "{rounded.key}"
    padding: "10px 12px"
  frequency-input:
    typography: "{typography.label}"
    backgroundColor: "{colors.console-raise}"
    textColor: "{colors.broadcast-ink}"
    rounded: "{rounded.key}"
    padding: "10px 12px"
  console-card:
    backgroundColor: "{colors.console-raise}"
    textColor: "{colors.broadcast-ink}"
    rounded: "{rounded.card}"
    padding: "22px"
  monitor:
    backgroundColor: "#000000"
    rounded: "{rounded.card}"
  onair-lamp:
    typography: "{typography.headline}"
    textColor: "{colors.faint-label}"
    rounded: "{rounded.lamp}"
    padding: "5px 12px 5px 9px"
  onair-lamp-live:
    backgroundColor: "{colors.red-pool}"
    textColor: "{colors.lit-red-text}"
    rounded: "{rounded.lamp}"
    padding: "5px 12px 5px 9px"
  chat-row:
    backgroundColor: "transparent"
    textColor: "{colors.broadcast-ink}"
  chat-row-mine:
    backgroundColor: "rgba(245, 184, 74, 0.08)"
  queue-item:
    backgroundColor: "{colors.console-raise}"
    rounded: "{rounded.row}"
    padding: "8px"
  tab-btn:
    textColor: "{colors.dim-signal}"
    rounded: "8px 8px 0 0"
    padding: "9px 14px"
  tab-btn-active:
    backgroundColor: "{colors.console-high}"
    textColor: "{colors.broadcast-ink}"
    rounded: "8px 8px 0 0"
    padding: "9px 14px"
  count-badge:
    backgroundColor: "{colors.amber-lamp}"
    textColor: "{colors.lamp-ink}"
    typography: "{typography.label}"
    height: "17px"
  toast:
    backgroundColor: "{colors.console-high}"
    textColor: "{colors.broadcast-ink}"
    typography: "{typography.label}"
    rounded: "8px"
    padding: "10px 18px"
---

# Design System: PlaySync — Al Aire

## Overview

**Creative North Star: "Al Aire"**

The room is a midnight broadcast studio that only the two of you tune into. The world refuses the category default of dark chat-app chrome with one neon accent: its hardware is tonal ink-blue console metal, its light is warm amber from practical lamps, and red exists only where the broadcast is live or broken. Every control is a physical instrument — keys that visibly press, a needle that sweeps the dial, VU needles that wander while the room is on air, a bezel lamp that breathes.

The interface speaks broadcast in its vocabulary and its type. Rooms are frequencies; the queue is the rundown (Programación); chat is the station switchboard of ruled log rows; the people panel is the cabina. IBM Plex Mono is reserved for anything the studio would measure — timecodes, the studio clock, queue numbers, room codes, dial frequencies — always with tabular figures. Big Shoulders Display carries anything the studio would announce: the wordmark, AL AIRE, guest names, the scrolling now-playing title. Body copy stays in the system sans so chat reads comfortably at night. Motion is electromechanical, never springy: a power-on brightness curve when the studio lights up, a 700 ms needle sweep, damped VU random walks, a 2.6 s lamp breathe.

**Key Characteristics:**

- Ink-blue tonal layering (four night steps + hairlines), not gray-on-black.
- Amber is the only interactive accent: keys, focus, active tabs, the frequency code, badges.
- Red is semantic only: ON AIR lit, dial needle, VU peak arc, offline, error.
- Console keys (8px radius, bevel highlight, 1px press travel) — never pills.
- Mono readouts with tabular-nums; condensed display for announcement type.
- Chat is a ruled switchboard log, never bubbles.
- Instruments survive the phone: one compact VU meter persists below 560px.
- UI copy is Spanish; this system document is English (repo language).

## Colors

A night palette: four steps of ink-blue console metal lit by warm amber practicals, with red wired strictly to transmission semantics.

### Primary
- **Amber Lamp** (#f5b84a): the working light of the studio. Primary keys (with Amber Deep as the gradient's bottom stop), focus rings and input focus, the room frequency code, active tab markers, unread/count badges, seek-bar fill, dial numbers' accent moments (via hover glow), the toast prefix dot, the "Play" half of the wordmark. Text on amber is Lamp Ink (#241a05), never white.
- **Amber Deep** (#d99a2b): bottom stop of the primary-key gradient and its border; keeps amber keys feeling lit from above rather than flat.
- **Amber Pool** (rgba(245, 184, 74, 0.09)): the lamp's light spill — the landing's radial ceiling glow, the room's top glow, "mine" chat-row washes (fading to transparent), key-on and hover tints at 0.08–0.16 strength.

### Secondary
- **On-Air Red** (#e5484d): transmission and fault color. Lit ON AIR lamp (text Lit Red #ffd7d8 on Red Pool), the tuning-dial needle (with red glow), the VU peak arc and live VU lamp, the offline connection dot, form errors and the monitor error chip. Never decorative, never a button.
- **Red Pool** (rgba(229, 72, 77, 0.16)): lit ON AIR background and error chip background.

### Tertiary
- **Signal Green** (#3fbf7f): the online connection dot (with green glow) and the VU meter's safe arc. Status only — no green buttons or green text elsewhere.

### Neutral
- **Studio Night** (#080b11): page floor — body background under the landing and room, PWA background/theme color.
- **Console Raise** (#0d1119): first raised surface — console card, topbar, inputs, queue items, picker, no-signal monitor.
- **Console High** (#131926): second raised surface — active tab background, tab-content panel, toast, VU meter gradient top.
- **Key Cap** (#1a2233): key-cap gradient top, emoji-cell hover, scrollbar thumb, slider track rest.
- **Line Strong** (#26304a): hardware borders — cards, keys, inputs, monitor bezel, VU arc base.
- **Line Soft** (#1c2438): hairline rules — chat row separators, panel and tab dividers, thumb borders.
- **Broadcast Ink** (#e9e6dc): warm off-white primary text; also the VU needle and slider-thumb fill.
- **Dim Signal** (#97a1b6): secondary text — promises, timecodes, hints, system chat lines.
- **Faint Label** (#74809b): labels, placeholders, dial ticks, idle ON AIR lamp, queue numbers.

Per-name hue: guest identity colors are derived, not chosen — `hsl(hash(name) mod 360, 65%, 62%)` tints chat names and cabina signal icons. It is the only unsaturated-free color outside the studio palette.

### Named Rules
**The Red Means Transmission Rule.** Red appears only where something is live, peaking, or broken: lit ON AIR, dial needle, VU peak arc and live lamp, offline dot, error text/chips. If red is used anywhere else, the world is broken.

**The Amber Practical Rule.** Amber is the only color a user can act on — keys, focus, active tabs, the frequency code, badges. It is lamp light, not neon: always paired with Lamp Ink (#241a05) text on amber surfaces, never with white.

## Typography

**Display Font:** Big Shoulders Display (with Arial Narrow, system-ui fallback) — weights 500;600;700;800 loaded
**Body Font:** system-ui stack (system-ui, -apple-system, Segoe UI, Roboto)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, Cascadia Code, Menlo fallback) — weights 400;500;600 loaded

**Character:** A condensed display face plays the studio's announcement voice against a mono readout face that plays its instruments — the pairing is the broadcast world in two fonts. The system sans stays invisible so long night sessions stay comfortable.

### Hierarchy
- **Display** (800, clamp(3.4rem, 14vw, 5.6rem), line-height 0.92, uppercase): the SYNCPLAY wordmark only; "Play" in Amber Lamp.
- **Headline** (condensed 700 caps, 0.72–1.05rem, tracking 0.08–0.16em): logotype SYNC**PLAY**, the ON AIR lamp, big console keys ("ENCENDER ESTUDIO"), chat guest names, tab labels use the sans at 600 instead.
- **Title** (condensed 600, 1.15rem, tracking 0.02em): now-playing title and cue overlay title (clamp(1rem, 2.6vw, 1.6rem)); the marquee carrier.
- **Body** (400/600, 0.88–1.02rem, line-height 1.45–1.5, promise max-width 40ch): the landing promise, chat text (emoji-only messages render at 2.1rem), queue titles, hints, people names.
- **Label** (mono 500/600, 0.6–1.05rem, tracking 0.03–0.3em, uppercase, tabular-nums): every readout — FREC code (tracking 0.22em), frequency input (tracking 0.3em, centered), studio clock, timecodes, "EMITIENDO" tag, queue numbers (01, 02…), bylines, field/picker section labels, dividers, dial numbers, cue hints, toast, footer.

### Named Rules
**The Readout Rule.** If the studio would measure it, it is IBM Plex Mono with `font-variant-numeric: tabular-nums`. If the studio would announce it, it is Big Shoulders Display. Body text is never a readout; a readout is never body text.

**The Loaded Weights Rule.** Only the loaded cuts exist: Big Shoulders Display 500–800, Plex Mono 400–600. Never request or synthesize weights outside those sets (no BSD 400 or 900, no mono 700).

## Layout

Two surfaces, both full-viewport columns (`100dvh`).

**Landing (the studio):** centered single column `width: min(620px, 100%)` — tuning dial, wordmark, promise, then the console card. A top bar (logotype + "TRANSMISIÓN SINCRONIZADA" tag) and a mono footer with safe-area bottom padding frame it. Amber Pool radial glows from the top-center and a faint green spill bottom-right keep the night from being flat.

**Room (the console):** topbar (back, logotype, frequency with connection dot, studio clock, ON AIR lamp, Compartir key) over a two-zone body. The stage centers the monitor (`max-width: 980px`, `aspect-ratio: 16/9`) with a transport row and now-playing strip beneath. The side console carries the panels: Chat, Programación (queue), Cabina (people).

**Breakpoints (as built):**
- **Two-pane** — `min-width: 940px` OR `orientation: landscape AND min-width: 520px`: room-body becomes a row; the side console is a fixed `380px` column with console tab buttons on top; the bottom tab bar hides; the tab-content becomes a full 14px-radius card; the monitor sizes by height: `width: min(100%, calc((100dvh - 240px) * 16 / 9))`.
- **Landscape phones** — `landscape, 520–939.98px`: side narrows to `min(46vw, 340px)`; monitor tightens to `max-height: calc(100dvh - 185px)` sized against `100dvh - 205px`.
- **Compact** — `max-width: 560px`: volume slider hidden, VU reduced to a single 34×28 meter, stage padding drops to 10px, topbar compacts (logotype and studio clock hidden), monitor capped at `46dvh`.

**Rhythm:** gaps run 6/8/10/12/14px; the console card pads 22px; queue items 8px; safe-area insets (`env(safe-area-inset-bottom)`) pad the footer, tab bar, and toast. Panels stack hairline-separated sections rather than nested cards.

## Elevation & Depth

Depth is tonal first: Studio Night → Console Raise → Console High → Key Cap steps surfaces up the console, with 1px Line Strong/Line Soft hairlines closing each level. Shadows are rare, deep-black pools under hardware — never ambient gray — plus colored glow only where a lamp is lit (amber key glow, red ON-air glow, needle glows).

### Shadow Vocabulary
- **Console shadow** (`0 14px 40px rgba(2, 4, 9, 0.55)`): console card, monitor, toast — the only drop shadow.
- **Key bevel** (`inset 0 1px 0 rgba(233, 230, 220, 0.06), 0 2px 6px rgba(2, 4, 9, 0.4)`): resting keys; pressed keys swap to `inset 0 2px 6px rgba(2, 4, 9, 0.5)` with 1px downward travel.
- **Amber key glow** (`inset 0 1px 0 rgba(255, 240, 210, 0.55), 0 3px 10px rgba(245, 184, 74, 0.22)`): primary keys only.
- **Bezel glass** (`inset 0 14px 18px -12px rgba(5, 7, 12, 0.7), inset 0 -14px 18px -12px rgba(5, 7, 12, 0.5)`): the monitor's inner top/bottom shading, overlay-only so clicks pass through.
- **Lamp glows**: lit ON AIR (`0 0 20px rgba(229, 72, 77, 0.3)` breathing to `0 0 8px` at 2.6s), dial needle (`0 0 10px rgba(229, 72, 77, 0.7)`), VU live lamp (`0 0 6px` red), online dot (`0 0 8px` green).

### Named Rules
**The Unlit Studio Rule.** No ambient or gray shadows, no elevation-by-blur (the mobile tab bar's 10px backdrop blur is the sole exception, as frosted console glass). Surfaces rise by tone; only real hardware casts a pool; only lit lamps glow.

## Shapes

Rectangles with softened corners, sized by role: cards and the monitor at 14px, queue rows 10px, keys/inputs/emoji cells 8px, the ON-Air bezel 7px, mini meters and icon keys 6px. Full rounds are reserved for point indicators only — the 999px count badge and the circular connection dot, slider thumbs, VU lamp. Every raised surface closes with a 1px border (Line Strong outside, Line Soft inside). The monitor is a hard 16:9 rectangle with glass; keys carry a top bevel highlight so they read as caps sitting in a console. Tabs are console file-tabs: square-bottomed (radius `8px 8px 0 0`) with the active tab's 2px amber marker drawn as an inset top bar.

### Named Rules
**The Console Key Rule.** Buttons are keys: 8px-radius caps with a bevel highlight that physically press (translateY 1px + inset shadow at 80ms). Never pills, never floating circles.

## Components

### Console keys (buttons)
- **Shape:** 8px-radius cap; sizes — default `9px 16px`, small `6px 12px` (0.82rem), big `14px 20px` (condensed 700 uppercase), icon 38×38, transport 48×48 (primary 56×56, cue overlay 78×78).
- **Default:** Key Cap → Console High vertical gradient over Line Strong border, bevel + base shadow. **Primary:** Amber Lamp → Amber Deep gradient, Amber Deep border, Lamp Ink text at weight 700, amber glow. **On (latched):** amber-tinted gradient wash with amber border.
- **Hover:** amber border + `brightness(1.08)` (primary: 1.06). **Active/pressed:** translateY(1px) + inset shadow. **Disabled:** opacity 0.45. **Focus:** 2px solid amber outline, offset 2px — on keys, icon buttons, and tabs alike.
- Icon buttons are 32px ghost keys (6px radius, Dim Signal → Ink text, amber-pool wash on hover).

### Inputs
- **Style:** Console Raise field, Line Strong border, 8px radius, `10px 12px` padding; placeholders Faint Label.
- **Focus:** amber border + 3px amber ring at 0.12 alpha (inputs never take the outline — they take the ring).
- **Frequency input:** the join code field — mono 600, centered, uppercase, 0.3em tracking, 1.05rem. Reads as dialing, not typing.

### The monitor (video surface)
- 16:9 black rectangle (14px radius, Line Strong border, console shadow) with glass inset shading over the embed; YouTube chrome stays out of frame.
- **States:** empty = SMPTE color bars + "SIN SEÑAL" + amber key; cued = dark overlay with cue title, 78px amber play key, "LISTO PARA EMITIR"; blocked (autoplay policy) = darker overlay, "Toca para emitir con sonido"; paused = frozen frame dimmed `brightness(0.45) saturate(0.65)` (300ms) so EN PAUSA reads instantly; error = red-pool chip bottom-center in Lit Red text.

### ON AIR lamp and connection dot
- **Lamp:** rectangular bezel (7px radius) in condensed 700, tracking 0.16em. Idle: Faint Label text, dim indicator square. Live ("AL AIRE"): red-pool wash, red border, Lit Red text, glowing red square, 2.6s breathe. Paused reads "EN PAUSA", unlit.
- **Connection dot:** online green + glow; connecting amber; offline red pulsing at 1s.

### VU meters
- Twin 44×34 meter faces (single 34×28 below 560px), Console-High-to-night gradient, SVG arc green → amber → red across the sweep, ink needle pivoting from the bottom center, small lamp at lower right (red + glow only while live).
- **Behavior:** needles run a damped random walk via requestAnimationFrame while live (targets −10°..36°, approach constants 190/230ms); fall back to rest (−38°) at 320ms decay when paused. They are instruments, not decoration — they follow actual playback state.

### Tuning dial
- 64px face under Line Soft rules: 85 ticks (majors every 6th at 14px, minors 8/4px, Faint/Dim), FM band numbers 88–108 in mono, and a 2px red needle with red glow and arrow cap.
- **Behavior:** the needle rests at 14% and sweeps to a position hashed from the room code being dialed (`left` transition 700ms, cubic-bezier(0.2, 0.8, 0.2, 1)). Decorative but truthful to input — it moves as you type a frequency.

### Now-playing marquee
- "EMITIENDO" mono tag + condensed 600 title at 1.15rem. Overflow is measured after font load and resize; the title scrolls only when it overflows, at `duration = overflowPx / 22s` (min 8s), pausing on hover. Never scrolls short titles.

### Tabs and panels (side console)
- **Console tabs:** file-tab shape (`8px 8px 0 0`), sans 600 0.88rem; active = Console High fill + 2px inset amber top bar + Ink text; inactive Dim. Count badges: amber 999px chip, mono 0.66rem, Lamp Ink text.
- **Panels:** the tab-content card rounds 14px on top (full radius on desktop), Line Soft border, Console High ground. Mobile switches panels under the bottom tab bar (frosted `rgba(13, 17, 25, 0.94)` + 10px blur, safe-area padded; active tab amber text on amber-pool wash).

### Chat — the station switchboard
- Ruled log rows separated by Line Soft hairlines — never bubbles. Row head: guest name in condensed 700 uppercase tinted by the per-name hue, timestamp in mono 0.62rem.
- **Mine:** amber-pool wash gradient fading to transparent by 78% width, top-corner rounded, head row reversed (name right). **System lines:** centered mono in Dim with an amber "·" prefix. **Emoji-only messages** render at 2.1rem; GIFs cap at `min(240px, 100%)` with Line Soft border; stickers render bare at 148px.
- **Composer:** picker toggle (icon button, amber when open), input, amber send key (disabled when empty). **Picker:** console tabs (Emojis/GIFs/Stickers), mono section labels, 38px-min auto-fill emoji grid with Key-Cap hover, 3-column media grid (GIFs cover-cropped 88px, stickers contained 96px), category strip at 0.55 opacity.

### Queue — the rundown
- Add form on top (input + amber key with plus icon; invalid-link error in red); list of rows: mono two-digit number (01), 92px 16:9 thumbnail, 600-weight title clamped to 2 lines, "programó {name}" mono byline, and play/remove icon actions.
- **Current item:** amber border at 0.6 alpha + 1px inset amber ring at 0.22 — the rundown's on-air line.

### People — the cabina
- Simple rows: per-name-hue 3-bar signal icon, name (yours in amber with mono "(tú)"), hairline-free list over the panel. Rename form (input + amber key) along the bottom.

### Toast
- Fixed bottom-center (above the tab bar on mobile, 24px on desktop): Console High card, 8px radius, mono 0.82rem, amber "●" prefix, console shadow.

### Iconography
- **Authored set only** (`src/components/icons.tsx`): 24×24 viewBox, `currentColor`, 1.7 stroke, round caps/joins — "geometric like console silkscreen labels". Play/pause/speaker bodies are filled; the signal icon is 3 filled bars with opacity steps; SMPTE bars are a fixed-palette mini SVG. Rendered at 14–30px. No icon packages, no icon fonts, no emoji as UI icons (emoji live only in chat content and the picker).

### Logo and PWA icons
- The mark: amber play triangle + red broadcast arcs (second arc at 0.55 opacity) + red lamp dot, pooled on a radial Studio-Night→ink gradient (`#1c2438 → #080b11`) in a 512 viewBox tile with `rx=110`.
- **Derivatives** (`scripts/make-icons.mjs`): pwa-512/192 as the rounded tile; maskable-512 and apple-touch-icon as full-bleed (glyph scaled 0.62/0.72, no transparency). Manifest and `theme-color` use Studio Night (#080b11); iOS status bar black-translucent.

## Do's and Don'ts

### Do:
- **Do** make every button a console key: 8px radius, cap gradient, bevel highlight, 1px press travel, 80/120ms transitions.
- **Do** write every measured value in IBM Plex Mono with tabular-nums (timecodes, clock, queue numbers, codes).
- **Do** pair amber surfaces with Lamp Ink (#241a05) text; focus with the 2px amber outline (keys/tabs) or amber border + 3px ring (inputs).
- **Do** keep instruments truthful: VU walks only while playing, needle sweeps with the dialed code, marquee scrolls only on overflow, ON AIR follows actual playback.
- **Do** tint guest identity with the derived per-name hue `hsl(hash 65% 62%)` for chat names and cabina signals.
- **Do** style panel scrollbars as console slots (8px, Key Cap thumb, 4px radius) and keep ::selection amber at 0.3.
- **Do** respect safe-area insets on the footer, tab bar, and toast; keep UI copy in Spanish.

### Don't:
- **Don't** use pill-shaped buttons or floating round buttons — full rounds are only for the count badge and point indicators (dots, lamps, slider thumbs).
- **Don't** apply gradients to text; the wordmark's amber is a solid color on a span.
- **Don't** use red outside transmission semantics (ON AIR lit, dial needle, VU peak/live lamp, offline, error).
- **Don't** use emoji as UI iconography; the authored 1.7-stroke set is the only icon language.
- **Don't** use chat bubbles — the switchboard is ruled log rows with hairline separators.
- **Don't** add ambient gray shadows, springy/bouncy easing, or new neon glows; motion stays electromechanical (power-on 900ms, sweep 700ms, breathe 2.6s, damped VU walks).
- **Don't** step outside the loaded font weights (BSD 500–800, Plex Mono 400–600) or introduce a third brand face.
