"use client";

import { useEffect, useRef, useState } from "react";
import { Pos } from "@/hooks/useMovement";

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

interface Props {
  pos: Pos;
  color: string;
  isMoving: boolean;
}

const TRAIL_COUNT = 4;
const SAMPLE_INTERVAL_MS = 80;

// Opacity and radius for each trail point (oldest → newest)
const OPACITIES = [0.08, 0.15, 0.24, 0.35];
const RADII = [4, 5, 6, 7];

export default function Trail({ pos, color, isMoving }: Props) {
  const [points, setPoints] = useState<TrailPoint[]>([]);
  const lastSampleRef = useRef(0);
  const counterRef = useRef(0);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sample position while moving
  useEffect(() => {
    if (!isMoving) return;

    const now = Date.now();
    if (now - lastSampleRef.current < SAMPLE_INTERVAL_MS) return;
    lastSampleRef.current = now;

    setPoints((prev) => {
      const next = [...prev, { x: pos.x, y: pos.y, id: counterRef.current++ }];
      return next.slice(-TRAIL_COUNT);
    });
  }, [pos, isMoving]);

  // Fade out all points 1.5s after stopping
  useEffect(() => {
    if (isMoving) {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      return;
    }
    clearTimerRef.current = setTimeout(() => setPoints([]), 1500);
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [isMoving]);

  if (points.length === 0) return null;

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {points.map((pt, i) => (
        <circle
          key={pt.id}
          cx={pt.x}
          cy={pt.y}
          r={RADII[i] ?? 4}
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          opacity={OPACITIES[i] ?? 0.08}
        />
      ))}
    </svg>
  );
}
