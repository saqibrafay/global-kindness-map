"use client";

import dynamic from "next/dynamic";
import type { KindnessPin } from "@/types/pin";

// Leaflet touches `window`, so the map must never be rendered on the server.
const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
      Loading the kindness map…
    </div>
  ),
});

export default function MapClient(props: {
  pins: KindnessPin[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}) {
  return <WorldMap {...props} />;
}
