"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useMovement, Pos } from "@/hooks/useMovement";
import { useSocket } from "@/hooks/useSocket";
import { useMute } from "@/hooks/useMute";
import Avatar from "@/components/avatars/Avatar";
import Trail from "@/components/Trail";
import SpeechBubble from "@/components/SpeechBubble";
import MessageInput from "@/app/world/MessageInput";
import RemoteAvatarSlot from "@/app/world/RemoteAvatarSlot";
import AudioManager from "@/components/AudioManager";
import NamePrompt from "@/app/world/NamePrompt";

interface BubbleState {
  text: string;
  key: number;
}

function getBubbleOpacity(localPos: Pos, userX: number, userY: number): number {
  const FULL_DIST = 200;
  const ZERO_DIST = 600;
  const dist = Math.hypot(localPos.x - userX, localPos.y - userY);
  if (dist <= FULL_DIST) return 1;
  if (dist >= ZERO_DIST) return 0;
  return 1 - (dist - FULL_DIST) / (ZERO_DIST - FULL_DIST);
}

export default function World() {
  const worldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { session, updateColor, updateName } = useSession();
  const { toggleMute, isMuted } = useMute();

  const [audioMuted, setAudioMuted] = useState(true);
  const [namePromptDone, setNamePromptDone] = useState(false);

  const showNamePrompt = session !== null && session.name === null && !namePromptDone;

  // Stable onMove delegate — updated each render to point at latest sendMove
  const onMoveRef = useRef<((pos: Pos) => void) | null>(null);
  const stableOnMove = useCallback((p: Pos) => onMoveRef.current?.(p), []);

  const { pos, isMoving, handlePointerDown, posRef } = useMovement(
    worldRef,
    stableOnMove
  );

  const {
    connected,
    roomFull,
    myUserId,
    remoteUsers,
    userCount,
    lastMessage,
    sendMove,
    sendMessage,
    sendSetName,
  } = useSocket(session, posRef, updateColor);

  onMoveRef.current = sendMove;

  // Enter key → focus chat input (when not already typing)
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      const el = document.activeElement as HTMLElement | null;
      if (el?.tagName === "INPUT" || el?.tagName === "TEXTAREA") return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Track whether we were ever connected — drives reconnect overlay
  const wasConnectedRef = useRef(false);
  if (connected) wasConnectedRef.current = true;
  const showReconnect = !connected && wasConnectedRef.current;

  // ── Bubble state ───────────────────────────────────────────────────────
  const [bubbles, setBubbles] = useState<Map<string, BubbleState>>(new Map());

  useEffect(() => {
    if (!lastMessage) return;
    setBubbles((prev) => {
      const existing = prev.get(lastMessage.userId);
      return new Map(prev).set(lastMessage.userId, {
        text: lastMessage.text,
        key: (existing?.key ?? 0) + 1,
      });
    });
  }, [lastMessage]);

  function removeBubble(userId: string) {
    setBubbles((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  }

  function handleNameSet(name: string) {
    updateName(name);
    sendSetName(name);
    setNamePromptDone(true);
  }

  function handleNameSkip() {
    setNamePromptDone(true);
  }

  // ── Render ─────────────────────────────────────────────────────────────
  if (!session) return null;

  const localBubble = myUserId ? bubbles.get(myUserId) : undefined;

  return (
    <div ref={worldRef} className="world-root" onPointerDown={handlePointerDown}>
      {/* Park background: sky + sun + ground */}
      <div className="world-bg" aria-hidden />
      <div className="world-sun" aria-hidden />
      <div className="world-ground" aria-hidden />

      {/* Remote users */}
      {Array.from(remoteUsers.values()).map((user) => (
        <RemoteAvatarSlot
          key={user.userId}
          user={user}
          bubble={bubbles.get(user.userId)}
          bubbleOpacity={getBubbleOpacity(pos, user.x, user.y)}
          isMuted={isMuted(user.userId)}
          onToggleMute={() => toggleMute(user.userId)}
          onBubbleDone={() => removeBubble(user.userId)}
        />
      ))}

      {/* Local user trail */}
      <Trail pos={pos} color={session.color} isMoving={isMoving} />

      {/* Local user avatar */}
      <div
        className="world-avatar-slot"
        style={{ left: pos.x, top: pos.y, pointerEvents: "none" }}
      >
        <div className="world-avatar-content">
          {localBubble && (
            <div className="world-bubble-anchor">
              <SpeechBubble
                key={localBubble.key}
                text={localBubble.text}
                color={session.color}
                onDone={() => myUserId && removeBubble(myUserId)}
              />
            </div>
          )}
          {session.name && <p className="avatar-name-label">{session.name}</p>}
          <Avatar avatarType={session.avatarType} strokeColor={session.color} />
        </div>
      </div>

      {/* Presence counter */}
      <p className="presence-counter" aria-live="polite">
        {userCount} soul{userCount !== 1 ? "s" : ""} in this space
      </p>

      {/* Ambient audio toggle */}
      <AudioManager
        muted={audioMuted}
        onToggle={() => setAudioMuted((m) => !m)}
      />

      {/* Reconnecting overlay */}
      {showReconnect && (
        <div className="status-overlay" data-ui>
          <span>reconnecting…</span>
        </div>
      )}

      {/* Room full overlay */}
      {roomFull && (
        <div className="room-full-overlay" data-ui>
          <p>This space is full</p>
          <span>check back soon</span>
        </div>
      )}

      {/* Name prompt — shown once for users without a saved name */}
      {showNamePrompt && (
        <NamePrompt onSet={handleNameSet} onSkip={handleNameSkip} />
      )}

      {/* Chat input */}
      <MessageInput ref={inputRef} onSend={sendMessage} />
    </div>
  );
}
