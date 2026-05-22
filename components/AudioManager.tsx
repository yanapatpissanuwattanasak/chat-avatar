"use client";

import { useEffect, useRef } from "react";

interface Props {
  muted: boolean;
  onToggle: () => void;
}

export default function AudioManager({ muted, onToggle }: Props) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  function start() {
    if (ctxRef.current) {
      ctxRef.current.resume();
      return;
    }
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.10;
    master.connect(ctx.destination);
    masterRef.current = master;

    // Wind: looped low-pass filtered noise
    const bufLen = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 320;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.35;
    src.connect(lp);
    lp.connect(windGain);
    windGain.connect(master);
    src.start();

    // Bird chirps: random intervals
    function chirp() {
      if (!ctxRef.current || ctxRef.current.state === "closed") return;
      const c = ctxRef.current;
      const t = c.currentTime;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      const freq = 1300 + Math.random() * 900;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq + 220, t + 0.07);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.15, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + 0.28);
      setTimeout(chirp, 2200 + Math.random() * 6000);
    }
    setTimeout(chirp, 800 + Math.random() * 2000);
  }

  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.gain.value = muted ? 0 : 0.10;
    }
  }, [muted]);

  useEffect(() => () => { ctxRef.current?.close(); }, []);

  function handleClick() {
    start();
    onToggle();
  }

  return (
    <button
      data-ui
      className={`audio-btn${muted ? " audio-btn--muted" : ""}`}
      onClick={handleClick}
      aria-label={muted ? "Enable ambient sound" : "Mute ambient sound"}
    >
      {muted ? "♩" : "♫"}
    </button>
  );
}
