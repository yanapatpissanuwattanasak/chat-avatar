# Anonymous Real-Time Social World
## Visual Direction PRD — Line Art Avatar System
**v1.0 · May 2026**

| | |
|---|---|
| Document type | Product Requirements Document — Visual Direction |
| Scope | Line Art Avatar System & World Visual Identity |
| Status | Draft — Avatar Details TBD |
| Product | Anonymous Real-Time Social World (MVP) |
| Date | May 2026 |

---

## 1. Overview

This document defines the visual direction for the Anonymous Real-Time Social World platform, focusing specifically on the Line Art Avatar System. It serves as the single source of truth for designers, engineers, and stakeholders building the visual layer of the product.

The core premise: every visual element — avatars, speech bubbles, movement trails, the world itself — must feel like it was drawn by the same hand with a single pen. Minimal strokes. Maximum personality.

> **Product in one sentence:** A real-time anonymous web world where strangers spawn into a shared space, move around, and speak through their avatars.

---

## 2. Product Vision

Create an online anonymous space where strangers can appear, coexist, and speak as simply as possible — removing friction from sign-up, real identity, and traditional social media formats.

The visual language must reinforce this vision at every level:

- Avatars feel hand-drawn, not generated
- The world feels alive without being noisy
- Every user is distinct but equal — no visual hierarchy of status
- The aesthetic is internet-native: slightly strange, playfully minimal

---

## 3. Visual Identity Principles

### 3.1 Line Art Only

All avatar characters are drawn using strokes only — no fills, no gradients, no solid color bodies. This is the defining aesthetic constraint of the system.

| Principle | Rule | Rationale |
|---|---|---|
| Stroke only | `fill: none` on all avatar shapes | Creates the hand-drawn feel |
| Consistent weight | 1.2–1.5px stroke width | Coherent across all character types |
| Round caps | `stroke-linecap: round` | Softer, friendlier energy |
| Round joins | `stroke-linejoin: round` | Consistent with caps |
| No shadows | No drop shadows or glows | Keeps the aesthetic clean and flat |
| No gradients | Solid stroke color only | Dark mode compatible, no rendering artifacts |

### 3.2 Atmosphere Is a Feature

The scene, movement, bubbles, and spacing of the space are core to the experience — not decoration. Every visual decision must ask: does this make the world feel more alive?

### 3.3 Low Friction, High Feeling

Interactions must be simple but emotionally clear. A speech bubble appearing above a line-drawn character must feel delightful, not clinical.

### 3.4 Anonymous but Distinct

Every user gets a unique visual identity without disclosing who they are. Color variation and character shape are the two primary differentiators.

---

## 4. Avatar System

### 4.1 Design Philosophy

Avatars are the heart of the product. They must:

- Be instantly readable as "a character" at small sizes
- Have distinct silhouettes so users can tell each other apart at a glance
- Express personality through shape alone — no text labels, no name tags in the world
- Feel like they belong in the same hand-drawn universe
- Animate simply — bobbing, reacting — without complex rigs

### 4.2 Character Types

Five base character archetypes have been defined. Each has a distinct silhouette and implied personality:

| Character | Shape | Personality | Notes |
|---|---|---|---|
| The Blob | Round body + circular head | Friendly, idle, approachable | Default / most neutral |
| The Bean | Tall elongated body | Excited, expressive, waving | Most dynamic silhouette |
| The Ghost | Wavy-bottom form, no legs | Floaty, shy, mysterious | Closest to "surreal" vibe |
| The Block | Square body + square head | Stoic, calm, deadpan | Comic contrast to others |
| The Star | Star-shaped body | Bouncy, loud, expressive | Most eye-catching |

> Final character selection, proportions, and animation specs are TBD — to be defined in the next design sprint.

### 4.3 Color Assignment

Each user is assigned a stroke color on spawn. Color is the primary differentiator between users sharing the same character type.

- Color assigned randomly from a curated palette on session start
- Same color palette applies to all character types — consistent world tone
- Color persists for the duration of the session
- If localStorage token exists from a previous session, same color is restored
- No two users in the same room should share an identical character type + color combination (enforced server-side)

Palette direction: muted, slightly desaturated tones that work on both light and dark backgrounds. Avoid pure primaries — they feel too digital for the hand-drawn aesthetic.

### 4.4 Spawn Behavior

When a user enters the room:

- Avatar appears at a random position near the center of the world
- Spawn animation: subtle scale-in from 0 → 1 over 300ms with a slight bounce (cubic-bezier ease-out)
- Other users in the room see the new avatar appear in real-time
- No fanfare, no notification banner — presence is communicated through the world itself

### 4.5 Despawn Behavior

When a user leaves or disconnects:

- Avatar plays a fade-out animation over 400ms
- Server cleans up the session within 5 seconds of disconnect detection
- Stale avatars must not persist in the room — this degrades the presence experience

---

## 5. Speech Bubble System

### 5.1 Design Spec

Speech bubbles must feel like part of the same line-art language as the avatars:

| Property | Value |
|---|---|
| Shape | Rounded rectangle with tail pointing down to avatar |
| Border | 1.5px stroke, same style as avatars (round cap/join) |
| Fill | Translucent white / dark (adapts to scene background) |
| Font | System sans-serif, 13–14px, comfortable line-height |
| Max width | 200px — wraps to 2 lines max |
| Tail | Simple triangle, drawn not clipped |
| Appear animation | Fade in + scale from 0.85 → 1 over 200ms |
| Disappear animation | Fade out over 600ms, starts 4s after message sent |
| Lifetime | 4 seconds visible, then fade |
| Z-order | Always above avatars, never occluded |

### 5.2 Multiple Messages

If a user sends a second message before the first has faded:

- First bubble immediately begins fade-out
- New bubble appears above the avatar
- No message stacking — only one bubble per avatar at any time

### 5.3 Message Constraints

- Maximum 120 characters per message
- No markdown, no links, no emoji shortcuts — plain text only
- Server validates length before broadcast
- Client prevents submission if over character limit (counter shown at 80+ chars)

---

## 6. Movement & Trails

### 6.1 Movement Controls

| Platform | Control method | Notes |
|---|---|---|
| Desktop | Arrow keys or WASD | Primary MVP interaction |
| Desktop (alt) | Click-to-move | Optional, lower priority |
| Mobile | Tap-to-move | MVP mobile support |

### 6.2 Movement Feel

- Avatar moves at a constant walk speed — not instant teleport
- Smooth interpolation between positions (lerp, not snap)
- Slight bounce or bob animation while moving — reinforces the hand-drawn character feel
- Movement synced to other users in real-time via WebSocket
- Acceptable sync latency: < 100ms for a smooth shared presence experience

### 6.3 Movement Trails

As avatars move, they leave a fading trail of ghost circles behind them:

- 3–4 ghost circles, each progressively more transparent
- Trail fades completely within 1.5s of the avatar stopping
- Trail is client-side only — not synced to other users
- Trail uses the same stroke color as the avatar

---

## 7. World & Environment

### 7.1 Scene Direction

The world background must have atmospheric weight — it should feel like a place, not a whiteboard. Approved scene directions for MVP:

| Scene concept | Mood | Priority |
|---|---|---|
| Rooftop at night | Calm, cinematic, intimate | High |
| Abstract void / dark space | Surreal, internet-native, minimal | High |
| Pastel open field | Soft, welcoming, strange | Medium |
| Rain city street | Atmospheric, melancholic, alive | Medium |
| Neon room interior | Energetic, late-night, weird | Low / future |

> One scene ships with MVP. Scene selection to be confirmed after visual prototype review.

### 7.2 Scene + Avatar Contrast

The scene background must provide sufficient contrast for line-art avatars. Test requirements:

- Avatar strokes must be readable against all areas of the background
- Speech bubbles must be readable against both avatars and background
- No area of the scene should cause avatar silhouettes to disappear

### 7.3 Online Presence Indicator

Display user count as ambient text in the world — not a bold UI element:

> Example copy: "12 souls in this space"
> Placement: subtle corner of the world, not overlaid on the main area
> Updates in real-time as users join / leave
> Tone: consistent with the slightly surreal voice of the product

---

## 8. Functional Requirements

### 8.1 Session & Identity

- User enters site → anonymous session created automatically
- Character type and color assigned on spawn
- No sign-up, no name entry required
- Session identity stored in localStorage for color/type persistence across refreshes
- Identity is session-scoped for MVP — no permanent profiles

### 8.2 Real-Time Sync

The following states must be synced in real-time across all users in the room:

| Event | Sync target | Latency budget |
|---|---|---|
| Avatar spawn | All users in room | < 200ms |
| Avatar despawn | All users in room | < 200ms |
| Avatar movement | All users in room | < 100ms |
| Speech bubble appear | All users in room | < 150ms |
| Speech bubble disappear | Local only (timer-based) | N/A |
| Online count update | All users in room | < 500ms |

### 8.3 Moderation & Safety

As an anonymous real-time product, basic safety is mandatory for MVP:

- Blocked word filter — server-side, applied before broadcast
- Rate limit — max 1 message per 2 seconds per session
- Anti-spam cooldown — progressive slowdown after 5 messages in 10s
- Session-level mute — long-press / right-click avatar → "Mute this person"
- Mute is client-side only for MVP — muted user's bubbles hidden locally
- Server-side message logging for abuse review
- Message length hard cap enforced server-side (120 chars)

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Initial page load | < 2s on standard connection |
| Avatar spawn time | < 300ms from page ready |
| Message broadcast latency | < 150ms peer-to-peer |
| Movement sync latency | < 100ms |
| Session cleanup after disconnect | < 5s |
| Room capacity (MVP) | 50 concurrent users (soft cap) |
| Mobile support (MVP) | Tap-to-move + messaging, read-only fallback if needed |
| Browser support | Chrome, Firefox, Safari — last 2 major versions |

---

## 10. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Which character types ship in MVP — all 5 or a subset? | Design | Open |
| 2 | Final character proportions, stroke weights, and animation timing | Design | TBD next sprint |
| 3 | Which scene ships with MVP? | Design | Open |
| 4 | Color palette — exact hex values for avatar stroke colors | Design | Open |
| 5 | Room capacity overflow strategy — queue vs. reject vs. auto new room? | Engineering | Open |
| 6 | WebSocket provider — self-hosted vs. managed (e.g. Partykit, Supabase Realtime)? | Engineering | Open |
| 7 | Launch strategy — time-boxed soft launch or open? | Product | Open |

---

## 11. MVP Launch Checklist

- [ ] User enters site → avatar spawns immediately
- [ ] Room shows multiple users simultaneously in real-time
- [ ] Avatar movement syncs to all users
- [ ] Speech bubble appears above avatar on message send
- [ ] Bubble auto-disappears after 4 seconds
- [ ] Blocked word filter active
- [ ] Message rate limit enforced
- [ ] Session mute functional
- [ ] Avatar despawns cleanly on disconnect
- [ ] Line art aesthetic applied — no fills, consistent stroke weight
- [ ] Scene background provides contrast for avatars
- [ ] Online count displayed in world
- [ ] Mobile tap-to-move functional
- [ ] Initial load < 2s

---

## 12. Future Opportunities

Post-MVP directions to explore:

- Proximity-based speech bubble visibility — only nearby users see your message
- Ambient audio — soft background sound tied to the scene
- Reactions / emotes — quick line-art gesture animations
- Multi-room worlds with themed scenes
- Ghost trails of previous messages persisting briefly in the world
- Seasonal world skins — same avatar system, different environment
- Cosmetic avatar customization — accessories drawn in the same line-art style
- Scheduled social events — timed gatherings with shared prompts
