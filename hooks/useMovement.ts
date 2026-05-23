"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export interface Pos {
  x: number;
  y: number;
}

export const WORLD_HEIGHT = 1000;
export const WORLD_WIDTH = 2000;
export const GROUND_START_Y = 530;

const SPEED = 3;
const STOP_DIST = 4;
const PADDING = 48;
const EMIT_INTERVAL = 50;

const MOVE_KEYS = new Set([
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "w", "a", "s", "d", "W", "A", "S", "D",
]);

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = (el as HTMLElement).tagName;
  return tag === "INPUT" || tag === "TEXTAREA";
}

function randomSpawnPos(screenWidth: number): Pos {
  return {
    x: screenWidth * (0.1 + Math.random() * 0.8),
    y: GROUND_START_Y + 50 + Math.random() * (WORLD_HEIGHT - GROUND_START_Y - 50 - PADDING),
  };
}

export function useMovement(
  worldRef: RefObject<HTMLDivElement | null>,
  onMove?: (pos: Pos) => void
) {
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [cameraY, setCameraY] = useState(0);
  const [cameraX, setCameraX] = useState(0);

  const facingRef = useRef<"left" | "right">("right");
  const mobileDirRef = useRef({ up: false, down: false, left: false, right: false });

  const posRef = useRef<Pos>({ x: 0, y: 0 });
  const cameraYRef = useRef(0);
  const cameraXRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const tapTargetRef = useRef<Pos | null>(null);
  const isMovingRef = useRef(false);
  const lastEmitRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const screenWidthRef = useRef(0);
  const screenHeightRef = useRef(0);

  // Cache screen dimensions; update on resize but ignore keyboard-induced shrinks
  useEffect(() => {
    function measure() {
      if (!worldRef.current) return;
      const { width, height } = worldRef.current.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const prevH = screenHeightRef.current;
      if (prevH > 0 && height < prevH * 0.75 && Math.abs(width - screenWidthRef.current) < 50) return;
      screenWidthRef.current = width;
      screenHeightRef.current = height;
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [worldRef]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!MOVE_KEYS.has(e.key)) return;
      if (isTypingTarget(document.activeElement)) return;
      e.preventDefault();
      keysRef.current.add(e.key);
      tapTargetRef.current = null;
    };
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      // Bootstrap screen size on first frame if resize handler hasn't fired yet
      if (screenWidthRef.current === 0 && worldRef.current) {
        const { width, height } = worldRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          screenWidthRef.current = width;
          screenHeightRef.current = height;
        }
      }

      if (!initializedRef.current && screenWidthRef.current > 0) {
        const init = randomSpawnPos(screenWidthRef.current);
        posRef.current = init;
        setPos(init);
        initializedRef.current = true;
      }

      if (initializedRef.current) {
        const sw = screenWidthRef.current;
        const sh = screenHeightRef.current;

        const prevX = posRef.current.x;
        const prevY = posRef.current.y;
        let x = prevX;
        let y = prevY;
        let moved = false;

        const keys = keysRef.current;
        const mob = mobileDirRef.current;
        if (keys.has("ArrowUp")    || keys.has("w") || keys.has("W") || mob.up)    { y -= SPEED; moved = true; }
        if (keys.has("ArrowDown")  || keys.has("s") || keys.has("S") || mob.down)  { y += SPEED; moved = true; }
        if (keys.has("ArrowLeft")  || keys.has("a") || keys.has("A") || mob.left)  { x -= SPEED; moved = true; if (facingRef.current !== "left")  { facingRef.current = "left";  setFacing("left");  } }
        if (keys.has("ArrowRight") || keys.has("d") || keys.has("D") || mob.right) { x += SPEED; moved = true; if (facingRef.current !== "right") { facingRef.current = "right"; setFacing("right"); } }

        if (!moved && tapTargetRef.current) {
          const dx = tapTargetRef.current.x - x;
          const dy = tapTargetRef.current.y - y;
          const dist = Math.hypot(dx, dy);
          if (dist > STOP_DIST) {
            x += (dx / dist) * SPEED;
            y += (dy / dist) * SPEED;
            moved = true;
            const newFacing = dx < 0 ? "left" : "right";
            if (facingRef.current !== newFacing) { facingRef.current = newFacing; setFacing(newFacing); }
          } else {
            tapTargetRef.current = null;
          }
        }

        x = Math.max(PADDING, Math.min(WORLD_WIDTH - PADDING, x));
        y = Math.max(GROUND_START_Y, Math.min(WORLD_HEIGHT - PADDING, y));

        if (x !== prevX || y !== prevY) {
          posRef.current = { x, y };
          setPos({ x, y });
        }

        if (moved !== isMovingRef.current) {
          isMovingRef.current = moved;
          setIsMoving(moved);
        }

        // Camera: follow character, clamped so world edge never scrolls past screen
        const maxCameraY = Math.max(0, WORLD_HEIGHT - sh);
        const newCameraY = sh > 0 ? Math.max(0, Math.min(maxCameraY, y - sh / 2)) : 0;
        if (newCameraY !== cameraYRef.current) {
          cameraYRef.current = newCameraY;
          setCameraY(newCameraY);
        }

        const maxCameraX = Math.max(0, WORLD_WIDTH - sw);
        const newCameraX = sw > 0 ? Math.max(0, Math.min(maxCameraX, x - sw / 2)) : 0;
        if (newCameraX !== cameraXRef.current) {
          cameraXRef.current = newCameraX;
          setCameraX(newCameraX);
        }

        if (onMove) {
          const now = performance.now();
          if (now - lastEmitRef.current >= EMIT_INTERVAL) {
            lastEmitRef.current = now;
            onMove(posRef.current);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [worldRef, onMove]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!worldRef.current) return;
      if ((e.target as HTMLElement).closest("[data-ui]")) return;
      const rect = worldRef.current.getBoundingClientRect();
      tapTargetRef.current = {
        x: e.clientX - rect.left + cameraXRef.current, // screen → world coords
        y: e.clientY - rect.top + cameraYRef.current,
      };
    },
    [worldRef]
  );

  const setMobileDir = useCallback(
    (dir: Partial<{ up: boolean; down: boolean; left: boolean; right: boolean }>) => {
      Object.assign(mobileDirRef.current, dir);
    },
    []
  );

  return { pos, isMoving, facing, cameraX, cameraY, handlePointerDown, posRef, setMobileDir };
}
