"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AvatarType } from "@/lib/types";
import { randomColor } from "@/lib/palette";

const AVATAR_TYPES: AvatarType[] = ["blob", "bean", "ghost", "block", "star", "cat", "bunny", "robot", "alien"];
const STORAGE_KEY = "anon-social-session";

interface Session {
  sessionId: string;
  avatarType: AvatarType;
  color: string;
  name: string | null;
}

function loadOrCreate(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Session;
      if (parsed.sessionId && parsed.avatarType && parsed.color) {
        return { ...parsed, name: parsed.name ?? null };
      }
    }
  } catch {
    // corrupted storage — create fresh
  }

  const session: Session = {
    sessionId: uuidv4(),
    avatarType: AVATAR_TYPES[Math.floor(Math.random() * AVATAR_TYPES.length)],
    color: randomColor(),
    name: null,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(loadOrCreate());
  }, []);

  function updateColor(newColor: string) {
    setSession((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, color: newColor };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function updateName(newName: string) {
    setSession((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, name: newName };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  return { session, updateColor, updateName };
}
