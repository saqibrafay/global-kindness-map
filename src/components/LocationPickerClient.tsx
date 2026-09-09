"use client";

import dynamic from "next/dynamic";
import type { KindnessCategory } from "@/types/pin";
import type { Coords } from "./LocationPickerMap";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[340px] w-full items-center justify-center rounded-2xl border border-line-soft bg-ink-2 sm:h-[400px]">
      <span className="eyebrow">Loading map…</span>
    </div>
  ),
});

export default function LocationPickerClient(props: {
  value: Coords | null;
  onChange: (coords: Coords) => void;
  category: KindnessCategory;
}) {
  return <LocationPickerMap {...props} />;
}
