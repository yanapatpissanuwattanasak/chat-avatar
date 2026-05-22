export type AvatarType = "person";

export interface User {
  userId: string;
  sessionId: string;
  avatarType: AvatarType;
  color: string;
  x: number;
  y: number;
  name: string | null;
}

// ── Socket event payloads ──────────────────────────────────────────────────

export interface JoinPayload {
  sessionId: string;
  avatarType: AvatarType;
  color: string;
  x: number;
  y: number;
  name: string | null;
}

export interface SpawnPayload {
  userId: string;
  avatarType: AvatarType;
  color: string;
  x: number;
  y: number;
  name: string | null;
}

export interface SetNamePayload {
  name: string;
}

export interface NameUpdatePayload {
  userId: string;
  name: string;
}

export interface RoomStatePayload {
  users: User[];
  // The joining user's assigned identity (server may change color on collision)
  you: { color: string; avatarType: AvatarType };
}

export interface DespawnPayload {
  userId: string;
}

export interface MovePayload {
  x: number;
  y: number;
}

export interface MovebroadcastPayload {
  userId: string;
  x: number;
  y: number;
}

export interface MessagePayload {
  text: string;
}

export interface MessageBroadcastPayload {
  userId: string;
  text: string;
}

export interface CountPayload {
  count: number;
}

export interface RoomFullPayload {
  message: string;
}

// ── Socket event names ─────────────────────────────────────────────────────

export const EVENTS = {
  JOIN: "join",
  SPAWN: "spawn",
  ROOM_STATE: "room_state",
  DESPAWN: "despawn",
  MOVE: "move",
  MESSAGE: "message",
  COUNT: "count",
  ROOM_FULL: "room_full",
  SET_NAME: "set_name",
  NAME_UPDATE: "name_update",
  ERROR: "error",
} as const;
