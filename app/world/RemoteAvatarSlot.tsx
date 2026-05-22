"use client";

import { useEffect, useRef, useState } from "react";
import { User } from "@/lib/types";
import Avatar from "@/components/avatars/Avatar";
import SpeechBubble from "@/components/SpeechBubble";
import { useLongPress } from "@/hooks/useLongPress";

interface BubbleState {
  text: string;
  key: number;
}

interface Props {
  user: User;
  bubble: BubbleState | undefined;
  bubbleOpacity: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onBubbleDone: () => void;
}

export default function RemoteAvatarSlot({
  user,
  bubble,
  bubbleOpacity,
  isMuted,
  onToggleMute,
  onBubbleDone,
}: Props) {
  const [muteLabel, setMuteLabel] = useState<string | null>(null);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [isMoving, setIsMoving] = useState(false);
  const prevXRef = useRef(user.x);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dx = user.x - prevXRef.current;
    if (dx !== 0) {
      setFacing(dx < 0 ? "left" : "right");
      setIsMoving(true);
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      moveTimerRef.current = setTimeout(() => setIsMoving(false), 150);
    }
    prevXRef.current = user.x;
  }, [user.x]);

  function handleMute() {
    onToggleMute();
    setMuteLabel(isMuted ? "unmuted" : "muted");
    setTimeout(() => setMuteLabel(null), 1500);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    handleMute();
  }

  const longPress = useLongPress(handleMute);

  return (
    <div
      data-ui
      className="world-avatar-slot remote-avatar"
      style={{ left: user.x, top: user.y }}
      onContextMenu={handleContextMenu}
      {...longPress}
    >
      <div
        className="world-avatar-content"
        style={{ opacity: isMuted ? 0.3 : 1, transition: "opacity 200ms ease" }}
      >
        {muteLabel && <div className="mute-toast">{muteLabel}</div>}

        {bubble && !isMuted && (
          <div className="world-bubble-anchor" style={{ opacity: bubbleOpacity }}>
            <SpeechBubble
              key={bubble.key}
              text={bubble.text}
              color={user.color}
              onDone={onBubbleDone}
            />
          </div>
        )}

        {user.name && <p className="avatar-name-label">{user.name}</p>}

        <Avatar avatarType={user.avatarType} strokeColor={user.color} isMoving={isMoving} facing={facing} />
      </div>
    </div>
  );
}
