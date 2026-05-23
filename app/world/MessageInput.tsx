"use client";

import { forwardRef, KeyboardEvent, useRef, useState } from "react";

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
  const inputElRef = useRef<HTMLInputElement>(null);

  function send() {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return;
    onSend(trimmed);
    setValue("");
    inputElRef.current?.blur();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { e.currentTarget.blur(); return; }
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
          ref={(el) => {
            inputElRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }}
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
