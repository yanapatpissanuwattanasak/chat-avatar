"use client";

import { forwardRef, KeyboardEvent, useState } from "react";

interface Props {
  onSend: (text: string) => void;
}

const MAX_CHARS = 120;
const WARN_CHARS = 80;

const MessageInput = forwardRef<HTMLInputElement, Props>(function MessageInput(
  { onSend },
  ref
) {
  const [value, setValue] = useState("");

  function send() {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return;
    onSend(trimmed);
    setValue("");
    (document.activeElement as HTMLElement)?.blur();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      (e.currentTarget as HTMLInputElement).blur();
      return;
    }
    if (e.key !== "Enter") return;
    send();
  }

  const len = value.length;
  const isOver = len > MAX_CHARS;
  const showCounter = len >= WARN_CHARS;

  return (
    <div data-ui className="message-input-wrap">
      <div className="message-input-inner">
        <span className="message-input-prompt" aria-hidden>
          &gt;_
        </span>
        <input
          ref={ref}
          className="message-input"
          type="text"
          placeholder="say something…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        {showCounter && (
          <span className={`char-counter${isOver ? " char-counter--over" : ""}`}>
            {len}/{MAX_CHARS}
          </span>
        )}
        <button className="message-send-btn" onClick={send} aria-label="Send" tabIndex={-1}>
          ↵
        </button>
      </div>
    </div>
  );
});

export default MessageInput;
