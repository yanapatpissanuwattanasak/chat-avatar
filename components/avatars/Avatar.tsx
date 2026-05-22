"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarType } from "@/lib/types";
import Blob from "./Blob";
import Bean from "./Bean";
import Ghost from "./Ghost";
import Block from "./Block";
import Star from "./Star";
import Cat from "./Cat";
import Bunny from "./Bunny";
import Robot from "./Robot";
import Alien from "./Alien";

type AnimState = "spawning" | "bob" | "despawning";

interface Props {
  avatarType: AvatarType;
  strokeColor: string;
  size?: number;
  isDespawning?: boolean;
  onDespawnDone?: () => void;
}

const COMPONENTS = {
  blob: Blob,
  bean: Bean,
  ghost: Ghost,
  block: Block,
  star: Star,
  cat: Cat,
  bunny: Bunny,
  robot: Robot,
  alien: Alien,
} as const;

export default function Avatar({
  avatarType,
  strokeColor,
  size = 48,
  isDespawning = false,
  onDespawnDone,
}: Props) {
  const [animState, setAnimState] = useState<AnimState>("spawning");
  const Component = COMPONENTS[avatarType];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Spawn plays once on mount, then transitions to bob
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
    <div
      className={`avatar-wrapper ${cls}`}
      onAnimationEnd={handleAnimEnd}
      style={{ display: "inline-block" }}
    >
      <Component strokeColor={strokeColor} size={size} />
    </div>
  );
}
