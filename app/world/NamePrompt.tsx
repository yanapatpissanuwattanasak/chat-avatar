"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";

interface Props {
  onSet: (name: string) => void;
  onSkip: () => void;
}

const MAX_NAME = 16;

export default function NamePrompt({ onSet, onSkip }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit() {
    const trimmed = value.trim();
    if (trimmed) onSet(trimmed);
    else onSkip();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { onSkip(); return; }
    if (e.key === "Enter") { submit(); }
  }

  return (
    <div className="name-prompt-overlay" data-ui>
      <div className="name-prompt-box">
        <p className="name-prompt-title">what&apos;s your name?</p>
        <p className="name-prompt-sub">shown above your character</p>
        <input
          ref={inputRef}
          className="name-prompt-input"
          type="text"
          placeholder="enter name…"
          maxLength={MAX_NAME}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="name-prompt-actions">
          <button className="name-prompt-btn" onClick={submit}>confirm</button>
          <button className="name-prompt-skip" onClick={onSkip}>skip</button>
        </div>
      </div>
    </div>
  );
}
