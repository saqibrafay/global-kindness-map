"use client";

import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] w-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
      Loading map…
    </div>
  ),
});

export default function LocationPickerClient(props: {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}) {
  return <LocationPickerMap {...props} />;
}
