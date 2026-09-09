"use client";

import dynamic from "next/dynamic";
import type { KindnessPin } from "@/types/pin";

// Leaflet touches `window`, so the map must never be rendered on the server.
const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-ink-2">
      <div className="flex flex-col items-center gap-3">
        <span className="size-3 animate-ping rounded-full bg-glow" />
        <span className="eyebrow">Lighting the map…</span>
      </div>
    </div>
  ),
});

export default function MapClient(props: {
  pins: KindnessPin[];
  focusPin?: KindnessPin | null;
  height?: string;
  center?: [number, number];
  zoom?: number;
}) {
  return <WorldMap {...props} />;
}
