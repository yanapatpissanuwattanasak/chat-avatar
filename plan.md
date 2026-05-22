# Implementation Plan — Anonymous Real-Time Social World

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Backend | NestJS (`server/` subfolder) |
| Real-time | Socket.io (NestJS Gateway) |
| Avatar rendering | SVG inline (React components) |
| Session storage | localStorage |
| Server state | In-memory (Redis optional for scale) |

---

## Architecture Overview

Next.js handles the full frontend — world canvas, avatar rendering, movement, and UI.
NestJS in `server/` provides the WebSocket server (Socket.io Gateway), message validation, rate limiting, and session management.

Both apps live in the same repo. Run them independently or wire a `concurrently` root script.

---

## Phase 1 — Project Setup ✅

- [x] Init Next.js 15 app at repo root (`app/` router, TypeScript, Tailwind)
- [x] Init NestJS app at `server/` (`nest new server --skip-git`)
- [x] Install Socket.io on NestJS: `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`
- [x] Install Socket.io client in Next.js: `socket.io-client`
- [x] Configure CORS on NestJS Gateway (allow Next.js dev origin)
- [x] Create `lib/types.ts` at root — shared TypeScript interfaces for all socket events
- [x] Add root `package.json` with `dev` script using `concurrently` to run both apps

---

## Phase 2 — Anonymous Session ✅

- [x] On page load: check localStorage for existing `sessionId`, `avatarType`, `strokeColor`
- [x] If none: generate `sessionId` (uuid), pick random `avatarType` + `strokeColor` from palette
- [x] Persist to localStorage — restores identity on refresh
- [x] Server tracks active combinations per room and enforces no duplicate `avatarType + color` pair
- [x] If collision on join, server assigns a different color before confirming spawn

---

## Phase 3 — Avatar System (SVG) ✅

- [x] Create `components/avatars/` with one component per type:
  - `Blob.tsx` — round body + circular head
  - `Bean.tsx` — tall elongated body
  - `Ghost.tsx` — wavy-bottom form, no legs
  - `Block.tsx` — square body + square head
  - `Star.tsx` — star-shaped body
- [x] All avatars: `fill="none"`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `strokeWidth={1.3}`
- [x] Accept `strokeColor: string` and `size: number` props
- [x] Spawn animation: CSS scale 0 → 1 over 300ms, cubic-bezier bounce (`cubic-bezier(0.34, 1.56, 0.64, 1)`)
- [x] Despawn animation: CSS opacity 1 → 0 over 400ms
- [x] Idle bob: CSS keyframe translateY(0 → -3px → 0), 2s infinite
- [x] `lib/palette.ts`: 12 muted, slightly desaturated hex colors (no pure primaries)

---

## Phase 4 — World Canvas ✅

- [x] `app/world/World.tsx`: full-viewport `div` with `position: relative`, overflow hidden
- [x] Scene background: "Abstract void / dark space" for MVP — dark gradient, subtle noise texture via CSS
- [x] Render all users as positioned `<Avatar />` components at their `(x, y)` coords
- [x] Local user avatar is controllable; remote users are display-only
- [x] Ambient presence counter: `"N souls in this space"` — bottom-left, low-opacity, system sans-serif
- [x] Z-index layers: background (0) → trails (1) → avatars (2) → speech bubbles (3) → UI (10)

---

## Phase 5 — Movement ✅

- [x] `hooks/useMovement.ts`: listen to `keydown` for WASD + Arrow keys
- [x] Mobile: `pointerdown` on world → calculate target `(x, y)` from tap coordinates
- [x] Local avatar moves with lerp interpolation each animation frame
- [x] Throttle `move` emit to server: every 50ms (20 updates/sec)
- [x] Server broadcasts `{ userId, x, y }` to all other users in the room
- [x] Remote avatars lerp toward received position — smooth, not instant snap
- [x] Client-side movement trail: 3–4 ghost `<circle>` SVGs, each more transparent, fading fully in 1.5s after stop

---

## Phase 6 — Speech Bubble System ✅

- [x] `components/SpeechBubble.tsx`: SVG rounded rect + triangle tail drawn inline (not clipped)
  - Border: `1.5px` stroke, `strokeLinecap: round`, `strokeLinejoin: round`
  - Fill: translucent white (light) / translucent dark (dark scene)
  - Max width: 200px, text wraps to 2 lines max
  - Font: system sans-serif, 13–14px
- [x] Appear animation: fade-in + scale 0.85 → 1 over 200ms
- [x] Auto-disappear: visible for 4s, then fade out over 600ms
- [x] One bubble per avatar — new message starts fade-out on old immediately
- [x] `app/world/MessageInput.tsx`: fixed bottom-center input bar
  - Submit on Enter
  - Character counter appears at 80+ chars, turns red at 120
  - Client blocks submission over 120 chars

---

## Phase 7 — Real-Time Events (Socket.io) ✅

### Events

| Event | Direction | Payload |
|---|---|---|
| `join` | client → server | `{ sessionId, avatarType, color, x, y }` |
| `spawn` | server → all in room | `{ userId, avatarType, color, x, y }` |
| `room_state` | server → joining client | `{ users: User[] }` |
| `despawn` | server → all in room | `{ userId }` |
| `move` | client → server | `{ x, y }` |
| `move` | server → others in room | `{ userId, x, y }` |
| `message` | client → server | `{ text }` |
| `message` | server → all in room | `{ userId, text }` |
| `count` | server → all in room | `{ count: number }` |

### NestJS Gateway (`server/src/world/world.gateway.ts`)

- [x] `@WebSocketGateway` with Socket.io, CORS configured
- [x] `handleJoin`: validate session, assign room, resolve color collision, emit `room_state` to joiner + `spawn` to others
- [x] `handleMove`: validate coords (clamp to world bounds), broadcast to room
- [x] `handleMessage`: run moderation pipeline, broadcast if clean
- [x] `handleDisconnect`: emit `despawn`, update count, schedule cleanup within 5s

---

## Phase 8 — Moderation & Safety ✅

- [x] `FilterService`: blocked word list — strip/reject messages containing blocked words
- [x] Rate limiter: 1 message per 2s per `sessionId` (in-memory map with timestamps)
- [x] Anti-spam: track message count in rolling 10s window — progressive cooldown after 5 messages
- [x] Hard cap: reject messages over 120 chars server-side (defense against client bypass)
- [x] Message logging: append `{ timestamp, sessionId, roomId, text }` to server log (file or stdout)
- [x] Client-side mute: right-click (desktop) / long-press (mobile) avatar → toggle mute state in local React state → hide that user's bubbles

---

## Phase 9 — Polish & NFRs ✅

- [x] Initial load < 2s: Next.js static export, lazy-import socket client
- [x] Room soft cap: 50 users — server sends `room_full` error on `join`, client shows friendly overlay
- [x] Session cleanup: `handleDisconnect` triggers cleanup; stale socket timeout at 5s
- [x] Mobile layout: world fills viewport, input bar at bottom, tap-to-move on world surface
- [x] Browser support: Chrome, Firefox, Safari — last 2 major versions (no exotic CSS used)
- [x] Dark scene default — no contrast issues with line-art avatars from day one

---

## Folder Structure

```
/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Entry — mounts World
│   ├── layout.tsx
│   └── world/
│       ├── World.tsx             # Main world container
│       └── MessageInput.tsx      # Chat input bar
├── components/
│   ├── avatars/
│   │   ├── Blob.tsx
│   │   ├── Bean.tsx
│   │   ├── Ghost.tsx
│   │   ├── Block.tsx
│   │   ├── Star.tsx
│   │   └── Avatar.tsx            # Dispatcher — picks component by type
│   ├── SpeechBubble.tsx
│   └── Trail.tsx
├── hooks/
│   ├── useSocket.ts              # Socket.io connection + event handlers
│   ├── useMovement.ts            # Keyboard + tap movement input
│   └── useSession.ts             # localStorage session read/write
├── lib/
│   ├── palette.ts                # 12 curated stroke colors
│   └── types.ts                  # Shared TS types (User, SocketEvents, etc.)
├── server/                       # NestJS backend
│   ├── src/
│   │   ├── world/
│   │   │   ├── world.gateway.ts  # Socket.io Gateway (all WS handlers)
│   │   │   ├── world.service.ts  # Room state, user map, color collision
│   │   │   └── world.module.ts
│   │   ├── moderation/
│   │   │   ├── filter.service.ts # Word filter + rate limiting
│   │   │   └── moderation.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
└── package.json                  # Root: concurrently dev script
```

---

## Open Decisions (from PRD)

| # | Question | Decision |
|---|---|---|
| 6 | WebSocket provider | Self-hosted Socket.io on NestJS — full control, no vendor lock-in |
| 3 | MVP scene | Abstract void / dark space — simplest to implement, strongest aesthetic |
| 1 | Characters in MVP | All 5 — SVG is lightweight, gives variety from day one |
| 5 | Room overflow | Reject with overlay: "This space is full — check back soon" |
| 4 | Color palette | 12 muted hex values — defined in `lib/palette.ts` during Phase 3 |

---

## Dev Scripts (root `package.json`)

```json
{
  "scripts": {
    "dev": "concurrently \"next dev\" \"cd server && npm run start:dev\"",
    "dev:client": "next dev",
    "dev:server": "cd server && npm run start:dev"
  }
}
```
