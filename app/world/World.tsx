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
import MobileControls from "@/components/MobileControls";
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

  useEffect(() => {
    if (!showNamePrompt) worldRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMoveRef = useRef<((pos: Pos) => void) | null>(null);
  const stableOnMove = useCallback((p: Pos) => onMoveRef.current?.(p), []);

  const { pos, isMoving, facing, cameraX, cameraY, handlePointerDown, posRef, setMobileDir } = useMovement(
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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      const active = document.activeElement as HTMLElement | null;
      if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const wasConnectedRef = useRef(false);
  if (connected) wasConnectedRef.current = true;
  const showReconnect = !connected && wasConnectedRef.current;

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
    setTimeout(() => worldRef.current?.focus(), 0);
  }

  function handleNameSkip() {
    setNamePromptDone(true);
    setTimeout(() => worldRef.current?.focus(), 0);
  }

  if (!session) return null;

  const localBubble = myUserId ? bubbles.get(myUserId) : undefined;

  return (
    <div ref={worldRef} tabIndex={-1} className="world-root" onPointerDown={handlePointerDown}>

      {/* ── Scrolling world canvas ─────────────────────────────────────────── */}
      <div
        className="world-canvas"
        style={{ transform: `translate(${-cameraX}px, ${-cameraY}px)` }}
      >
        <div className="world-bg" aria-hidden />
        <div className="world-sun" aria-hidden />
        <div className="world-ground" aria-hidden />

        {/* ── World decorations ──────────────────────────────────────────── */}
        <svg className="world-decor" aria-hidden viewBox="0 0 2000 1000" width="2000" height="1000">

          {/* Dirt path */}
          <path d="M-20,760 C300,735 700,755 1000,742 C1300,730 1700,750 2020,738"
            stroke="#B08848" strokeWidth="36" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d="M-20,760 C300,735 700,755 1000,742 C1300,730 1700,750 2020,738"
            stroke="#C8A060" strokeWidth="20" fill="none" strokeLinecap="round" opacity="0.30" />

          {/* Trees — Stardew round-canopy style */}
          {([
            [110,  510, 0.78], [255,  512, 0.90], [420,  510, 0.72],
            [600,  513, 0.85], [755,  510, 0.95], [930,  511, 0.76],
            [1090, 510, 0.88], [1250, 512, 0.80], [1410, 510, 0.92],
            [1580, 513, 0.74], [1740, 510, 0.86], [1900, 511, 0.96],
            [1970, 510, 0.68], [50,   511, 0.82],
          ] as [number,number,number][]).map(([x, y, s], i) => (
            <g key={`t${i}`} transform={`translate(${x},${y}) scale(${s})`}>
              <ellipse cx="0" cy="4" rx="34" ry="9" fill="rgba(0,0,0,0.20)" />
              <rect x="-8" y="-50" width="16" height="56" rx="6" fill="#8B5830" stroke="#5A3418" strokeWidth="1.5" />
              <rect x="-3" y="-46" width="6" height="42" rx="3" fill="rgba(255,255,255,0.09)" />
              <circle cx="0"   cy="-90" r="48" fill="#307020" />
              <circle cx="-20" cy="-100" r="36" fill="#3C8A2A" />
              <circle cx="22"  cy="-96" r="32" fill="#347824" />
              <circle cx="0"   cy="-114" r="28" fill="#4A9432" />
              <circle cx="-8"  cy="-112" r="18" fill="#54A83C" />
              <circle cx="-14" cy="-112" r="10" fill="rgba(255,255,255,0.08)" />
            </g>
          ))}

          {/* Rocks */}
          {([
            [320, 690], [610, 580], [870, 820], [1150, 660],
            [1380, 790], [1660, 615], [1870, 730],
          ] as [number,number][]).map(([x, y], i) => (
            <g key={`r${i}`} transform={`translate(${x},${y})`}>
              <ellipse cx="4"  cy="5"  rx="28" ry="17" fill="rgba(0,0,0,0.18)" />
              <ellipse cx="0"  cy="0"  rx="26" ry="15" fill="#6E6A5A" stroke="#4E4A3A" strokeWidth="1.5" />
              <ellipse cx="-5" cy="-4" rx="18" ry="10" fill="#88857A" />
              <ellipse cx="-8" cy="-6" rx="10" ry="6"  fill="#A8A498" />
              <ellipse cx="-9" cy="-7" rx="5"  ry="3"  fill="rgba(255,255,255,0.38)" />
            </g>
          ))}

          {/* Yellow flowers (clustered, small) */}
          {([
            [170, 610], [480, 555], [740, 700], [1000, 580],
            [1260, 650], [1520, 595], [1800, 680],
          ] as [number,number][]).map(([x, y], i) => (
            <g key={`fy${i}`}>
              {([-14, 0, 14] as number[]).map((dx, j) => (
                <g key={j} transform={`translate(${x + dx},${y + j * 9})`}>
                  <line x1="0" y1="3" x2="0" y2="16" stroke="#4A8818" strokeWidth="1.5" />
                  <circle cx="-4" cy="0" r="4" fill="#EDD020" />
                  <circle cx="4"  cy="0" r="4" fill="#EDD020" />
                  <circle cx="0" cy="-4" r="4" fill="#EDD020" />
                  <circle cx="0"  cy="4" r="4" fill="#EDD020" />
                  <circle cx="0"  cy="0" r="3" fill="#FFF5A0" />
                </g>
              ))}
            </g>
          ))}

          {/* Purple flowers (clustered, small) */}
          {([
            [290, 635], [560, 720], [820, 570], [1080, 690],
            [1340, 620], [1620, 750], [1940, 610],
          ] as [number,number][]).map(([x, y], i) => (
            <g key={`fp${i}`}>
              {([-10, 4] as number[]).map((dx, j) => (
                <g key={j} transform={`translate(${x + dx},${y + j * 8})`}>
                  <line x1="0" y1="3" x2="0" y2="14" stroke="#4A8818" strokeWidth="1.5" />
                  <circle cx="-3.5" cy="0"  r="3.5" fill="#7850B0" />
                  <circle cx="3.5"  cy="0"  r="3.5" fill="#7850B0" />
                  <circle cx="0"   cy="-3.5" r="3.5" fill="#7850B0" />
                  <circle cx="0"    cy="3.5" r="3.5" fill="#7850B0" />
                  <circle cx="0"    cy="0"   r="2.5" fill="#B090E0" />
                </g>
              ))}
            </g>
          ))}

          {/* Bushes */}
          {([
            [200, 510], [680, 510], [1140, 510], [1720, 510],
          ] as [number,number][]).map(([x, y], i) => (
            <g key={`b${i}`} transform={`translate(${x},${y})`}>
              <ellipse cx="0" cy="3" rx="28" ry="7" fill="rgba(0,0,0,0.16)" />
              <circle cx="-16" cy="-12" r="18" fill="#2E7020" />
              <circle cx="16"  cy="-14" r="16" fill="#387828" />
              <circle cx="0"   cy="-20" r="20" fill="#358025" />
              <circle cx="-10" cy="-24" r="10" fill="#42943A" />
              <circle cx="10"  cy="-22" r="9"  fill="#3A8C30" />
              <circle cx="-14" cy="-22" r="6"  fill="rgba(255,255,255,0.07)" />
            </g>
          ))}
        </svg>

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

        <Trail pos={pos} color={session.color} isMoving={isMoving} />

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
            <Avatar avatarType={session.avatarType} strokeColor={session.color} isMoving={isMoving} facing={facing} />
          </div>
        </div>
      </div>

      {/* ── Screen-fixed UI ────────────────────────────────────────────────── */}
      <p className="presence-counter" aria-live="polite">
        {userCount} soul{userCount !== 1 ? "s" : ""} in this space
      </p>

      <AudioManager
        muted={audioMuted}
        onToggle={() => setAudioMuted((m) => !m)}
      />

      {showReconnect && (
        <div className="status-overlay" data-ui>
          <span>reconnecting…</span>
        </div>
      )}

      {roomFull && (
        <div className="room-full-overlay" data-ui>
          <p>This space is full</p>
          <span>check back soon</span>
        </div>
      )}

      {showNamePrompt && (
        <NamePrompt onSet={handleNameSet} onSkip={handleNameSkip} />
      )}

      <MobileControls setMobileDir={setMobileDir} />
      <MessageInput ref={inputRef} onSend={sendMessage} />
    </div>
  );
}
