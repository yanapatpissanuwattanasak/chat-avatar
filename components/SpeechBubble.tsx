"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  color: string;
  onDone: () => void;
}

type Phase = "appear" | "fading";

const VISIBLE_MS = 4000;
const FADE_MS = 600;

export default function SpeechBubble({ text, color, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>("appear");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setPhase("fading");
      timerRef.current = setTimeout(onDone, FADE_MS);
    }, VISIBLE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount

  return (
    <div
      className={`speech-bubble ${phase === "fading" ? "bubble-fading" : "bubble-appear"}`}
      style={
        {
          borderColor: color,
          "--bubble-color": color,
        } as React.CSSProperties
      }
    >
      {text}
    </div>
  );
}
