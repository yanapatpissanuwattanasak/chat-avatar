"use client";

import { useState } from "react";

export function useMute() {
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());

  function toggleMute(userId: string) {
    setMutedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function isMuted(userId: string): boolean {
    return mutedIds.has(userId);
  }

  return { toggleMute, isMuted };
}
