import Link from "next/link";
import type { KindnessPin } from "@/types/pin";
import { CATEGORY_EMOJI, CATEGORY_LABELS } from "@/types/pin";

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
    [12, "mo"],
    [Infinity, "y"],
  ];
  let value = seconds;
  let unitLabel = "s";
  for (const [size, label] of units) {
    if (value < size) {
      unitLabel = label;
      break;
    }
    value = Math.floor(value / size);
    unitLabel = label;
  }
  return `${value}${unitLabel} ago`;
}

export default function KindnessFeed({ pins }: { pins: KindnessPin[] }) {
  if (pins.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
        No kindness stories yet — be the first to add one!
      </div>
    );
  }

  return (
    <ul className="flex max-h-[600px] flex-col gap-3 overflow-y-auto pr-1">
      {pins.map((pin) => (
        <li key={pin.id}>
          <Link
            href={`/kindness/${pin.id}`}
            className="block rounded-xl border border-amber-100 bg-white p-4 transition hover:border-amber-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-amber-800">
                {CATEGORY_EMOJI[pin.category]} {CATEGORY_LABELS[pin.category]}
              </span>
              <span className="shrink-0 text-xs text-gray-400">{timeAgo(pin.created_at)}</span>
            </div>
            <p className="mt-1 line-clamp-3 text-sm text-gray-700">{pin.message}</p>
            {pin.location_label && (
              <p className="mt-1 text-xs text-gray-400">📍 {pin.location_label}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
