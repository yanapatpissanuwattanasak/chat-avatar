"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  muted: boolean;
  onToggle: () => void;
}

export default function AudioManager({ muted, onToggle }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.4);

  function start() {
    if (audioRef.current) {
      audioRef.current.play();
      return;
    }
    const audio = new Audio("/bg-music.mp3");
    audio.loop = true;
    audio.volume = muted ? 0 : volume;
    audioRef.current = audio;
    audio.play().catch(() => {});
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [muted, volume]);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  function handleClick() {
    start();
    onToggle();
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    setVolume(Number(e.target.value));
  }

  return (
    <div data-ui className="audio-control">
      {!muted && (
        <input
          className="volume-slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolume}
          aria-label="Volume"
        />
      )}
      <button
        className={`audio-btn${muted ? " audio-btn--muted" : ""}`}
        onClick={handleClick}
        aria-label={muted ? "Enable ambient sound" : "Mute ambient sound"}
      >
        {muted ? "♩" : "♫"}
      </button>
    </div>
  );
}
