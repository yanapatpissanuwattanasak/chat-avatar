"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarType } from "@/lib/types";
import Person from "./Person";

type AnimState = "spawning" | "bob" | "despawning";

interface Props {
  avatarType: AvatarType;
  strokeColor: string;
  size?: number;
  isMoving?: boolean;
  facing?: "left" | "right";
  isDespawning?: boolean;
  onDespawnDone?: () => void;
}

export default function Avatar({
  strokeColor,
  size = 48,
  isMoving = false,
  facing = "right",
  isDespawning = false,
  onDespawnDone,
}: Props) {
  const [animState, setAnimState] = useState<AnimState>("spawning");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleAnimEnd() {
    if (animState === "spawning") setAnimState("bob");
  }

  useEffect(() => {
    if (!isDespawning) return;
    setAnimState("despawning");
    timerRef.current = setTimeout(() => onDespawnDone?.(), 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDespawning, onDespawnDone]);

  const cls =
    animState === "spawning"
      ? "avatar-spawn"
      : animState === "despawning"
        ? "avatar-despawn"
        : "avatar-bob";

  return (
    <div style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}>
      <div
        className={`avatar-wrapper ${cls}`}
        onAnimationEnd={handleAnimEnd}
        style={{ display: "inline-block" }}
      >
        <Person strokeColor={strokeColor} size={size} isMoving={isMoving} />
      </div>
    </div>
  );
}
