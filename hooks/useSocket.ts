"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  AvatarType,
  CountPayload,
  DespawnPayload,
  EVENTS,
  JoinPayload,
  MessageBroadcastPayload,
  MovebroadcastPayload,
  NameUpdatePayload,
  RoomStatePayload,
  SpawnPayload,
  User,
} from "@/lib/types";
import { Pos } from "@/hooks/useMovement";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

interface Session {
  sessionId: string;
  avatarType: AvatarType;
  color: string;
  name: string | null;
}

export function useSocket(
  session: Session | null,
  posRef: RefObject<Pos>,
  onColorUpdate: (color: string) => void
) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomFull, setRoomFull] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Map<string, User>>(new Map());
  const [userCount, setUserCount] = useState(1);
  const [lastMessage, setLastMessage] = useState<{
    userId: string;
    text: string;
  } | null>(null);

  // Stable ref so onColorUpdate identity doesn't re-trigger the effect
  const onColorUpdateRef = useRef(onColorUpdate);
  onColorUpdateRef.current = onColorUpdate;

  useEffect(() => {
    if (!session) return;

    const socket = io(SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setMyUserId(socket.id ?? null);

      const payload: JoinPayload = {
        sessionId: session.sessionId,
        avatarType: session.avatarType,
        color: session.color,
        name: session.name,
        x: posRef.current?.x ?? 0,
        y: posRef.current?.y ?? 0,
      };
      socket.emit(EVENTS.JOIN, payload);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setMyUserId(null);
    });

    socket.on(EVENTS.ROOM_STATE, (data: RoomStatePayload) => {
      if (data.you.color !== session.color) {
        onColorUpdateRef.current(data.you.color);
      }
      const map = new Map<string, User>(
        data.users.map((u) => [u.userId, { ...u, name: u.name ?? null }])
      );
      setRemoteUsers(map);
    });

    socket.on(EVENTS.SPAWN, (data: SpawnPayload) => {
      setRemoteUsers((prev) => {
        const next = new Map(prev);
        next.set(data.userId, {
          userId: data.userId,
          sessionId: "",
          avatarType: data.avatarType,
          color: data.color,
          x: data.x,
          y: data.y,
          name: data.name ?? null,
        });
        return next;
      });
    });

    socket.on(EVENTS.NAME_UPDATE, (data: NameUpdatePayload) => {
      setRemoteUsers((prev) => {
        const user = prev.get(data.userId);
        if (!user) return prev;
        const next = new Map(prev);
        next.set(data.userId, { ...user, name: data.name });
        return next;
      });
    });

    socket.on(EVENTS.DESPAWN, (data: DespawnPayload) => {
      setRemoteUsers((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    });

    socket.on(EVENTS.MOVE, (data: MovebroadcastPayload) => {
      setRemoteUsers((prev) => {
        const user = prev.get(data.userId);
        if (!user) return prev;
        const next = new Map(prev);
        next.set(data.userId, { ...user, x: data.x, y: data.y });
        return next;
      });
    });

    socket.on(EVENTS.MESSAGE, (data: MessageBroadcastPayload) => {
      setLastMessage(data);
    });

    socket.on(EVENTS.COUNT, (data: CountPayload) => {
      setUserCount(data.count);
    });

    socket.on(EVENTS.ROOM_FULL, () => setRoomFull(true));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // Session identity is stable after first load — intentionally not re-connecting on every pos change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.sessionId]);

  const sendMove = useCallback((pos: Pos) => {
    socketRef.current?.emit(EVENTS.MOVE, { x: pos.x, y: pos.y });
  }, []);

  const sendMessage = useCallback((text: string) => {
    socketRef.current?.emit(EVENTS.MESSAGE, { text });
  }, []);

  const sendSetName = useCallback((name: string) => {
    socketRef.current?.emit(EVENTS.SET_NAME, { name });
  }, []);

  return {
    connected,
    roomFull,
    myUserId,
    remoteUsers,
    userCount,
    lastMessage,
    sendMove,
    sendMessage,
    sendSetName,
  };
}
