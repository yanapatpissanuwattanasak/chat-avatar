"use client";

import dynamic from "next/dynamic";

const World = dynamic(() => import("@/app/world/World"), {
  ssr: false,
  loading: () => <div className="world-loading">loading world…</div>,
});

export default function Home() {
  return <World />;
}
