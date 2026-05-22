"use client";

import { useCallback, useRef } from "react";

export function useLongPress(onLongPress: () => void, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(
    (e: React.PointerEvent) => {
      // Touch or primary mouse button only — not right-click (handled by onContextMenu)
      if (e.pointerType === "mouse" && e.button !== 0) return;
      timerRef.current = setTimeout(onLongPress, delay);
    },
    [onLongPress, delay]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerMove: cancel,
    onPointerLeave: cancel,
  };
}
