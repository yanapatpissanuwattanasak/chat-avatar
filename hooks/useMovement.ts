"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export interface Pos {
  x: number;
  y: number;
}

const SPEED = 3;
const STOP_DIST = 4;
const PADDING = 48;
const MIN_Y_FRAC = 0.52; // characters walk only in the bottom ~48% (ground area)
const EMIT_INTERVAL = 50; // ms between server broadcasts

const MOVE_KEYS = new Set([
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "w", "a", "s", "d", "W", "A", "S", "D",
]);

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = (el as HTMLElement).tagName;
  return tag === "INPUT" || tag === "TEXTAREA";
}

function randomSpawnPos(w: number, h: number): Pos {
  return {
    x: w * (0.1 + Math.random() * 0.8),
    y: h * (MIN_Y_FRAC + 0.05 + Math.random() * (0.88 - MIN_Y_FRAC)),
  };
}

export function useMovement(
  worldRef: RefObject<HTMLDivElement | null>,
  onMove?: (pos: Pos) => void
) {
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  const posRef = useRef<Pos>({ x: 0, y: 0 });
  const keysRef = useRef<Set<string>>(new Set());
  const tapTargetRef = useRef<Pos | null>(null);
  const isMovingRef = useRef(false);
  const lastEmitRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

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
      const el = worldRef.current;

      if (el && !initializedRef.current) {
        const { width, height } = el.getBoundingClientRect();
        if (width > 0 && height > 0) {
          const init = randomSpawnPos(width, height);
          posRef.current = init;
          setPos(init);
          initializedRef.current = true;
        }
      }

      if (initializedRef.current && worldRef.current) {
        const { width, height } = worldRef.current.getBoundingClientRect();
        const maxX = width - PADDING;
        const maxY = height - PADDING;

        const prevX = posRef.current.x;
        const prevY = posRef.current.y;
        let x = prevX;
        let y = prevY;
        let moved = false;

        const keys = keysRef.current;
        if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) { y -= SPEED; moved = true; }
        if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) { y += SPEED; moved = true; }
        if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) { x -= SPEED; moved = true; }
        if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) { x += SPEED; moved = true; }

        if (!moved && tapTargetRef.current) {
          const dx = tapTargetRef.current.x - x;
          const dy = tapTargetRef.current.y - y;
          const dist = Math.hypot(dx, dy);
          if (dist > STOP_DIST) {
            x += (dx / dist) * SPEED;
            y += (dy / dist) * SPEED;
            moved = true;
          } else {
            tapTargetRef.current = null;
          }
        }

        const minY = height * MIN_Y_FRAC;
        x = Math.max(PADDING, Math.min(maxX, x));
        y = Math.max(minY, Math.min(maxY, y));

        // Only trigger a React re-render when position actually changes
        if (x !== prevX || y !== prevY) {
          posRef.current = { x, y };
          setPos({ x, y });
        }

        if (moved !== isMovingRef.current) {
          isMovingRef.current = moved;
          setIsMoving(moved);
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
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [worldRef]
  );

  return { pos, isMoving, handlePointerDown, posRef };
}
