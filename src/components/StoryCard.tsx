"use client";

import Link from "next/link";
import type { KindnessPin } from "@/types/pin";
import { CATEGORY_COLOR_VARS, CATEGORY_EMOJI, CATEGORY_LABELS } from "@/types/pin";
import { formatDate, timeAgo } from "@/lib/time";

export default function StoryCard({
  pin,
  active = false,
  onFocus,
}: {
  pin: KindnessPin;
  active?: boolean;
  /** Called when the card is selected, so the map can fly to the pin. */
  onFocus?: (pin: KindnessPin) => void;
}) {
  const color = CATEGORY_COLOR_VARS[pin.category];

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-ink-2/70 transition-all duration-300 ${
        active
          ? "border-glow/50 bg-ink-3/80"
          : "border-line-soft hover:border-line hover:bg-ink-3/60"
      }`}
    >
      {/* Category light bleeding in from the left edge */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] transition-opacity duration-300"
        style={{
          background: color,
          opacity: active ? 1 : 0.45,
          boxShadow: `0 0 18px 1px ${color}`,
        }}
      />

      <div className="p-4 pl-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className="font-mono text-[0.62rem] tracking-[0.16em] uppercase"
            style={{ color }}
          >
            {CATEGORY_EMOJI[pin.category]} {CATEGORY_LABELS[pin.category]}
          </span>
          <time
            dateTime={pin.created_at}
            title={formatDate(pin.created_at)}
            suppressHydrationWarning
            className="shrink-0 font-mono text-[0.62rem] text-paper-faint"
          >
            {timeAgo(pin.created_at)}
          </time>
        </div>

        <p className="mt-2.5 line-clamp-3 text-[0.9rem] leading-relaxed text-paper-dim transition-colors group-hover:text-paper">
          {pin.message}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          {pin.location_label ? (
            <span className="truncate font-mono text-[0.65rem] text-paper-faint">
              ◈ {pin.location_label}
            </span>
          ) : (
            <span />
          )}

          <div className="flex shrink-0 items-center gap-1">
            {onFocus && (
              <button
                type="button"
                onClick={() => onFocus(pin)}
                className="rounded-full px-2 py-1 font-mono text-[0.62rem] tracking-[0.12em] text-paper-faint uppercase transition-colors hover:text-glow"
                aria-label={`Show this story on the map${
                  pin.location_label ? `: ${pin.location_label}` : ""
                }`}
              >
                Locate
              </button>
            )}
            <Link
              href={`/kindness/${pin.id}`}
              className="rounded-full px-2 py-1 font-mono text-[0.62rem] tracking-[0.12em] text-paper-faint uppercase transition-colors hover:text-glow"
            >
              Read →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
