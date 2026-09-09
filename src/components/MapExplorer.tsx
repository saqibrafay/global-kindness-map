"use client";

import { useMemo, useState } from "react";
import MapClient from "./MapClient";
import StoryCard from "./StoryCard";
import {
  KINDNESS_CATEGORIES,
  CATEGORY_COLOR_VARS,
  categoryTint,
  CATEGORY_EMOJI,
  CATEGORY_SHORT_LABELS,
  type KindnessCategory,
  type KindnessPin,
} from "@/types/pin";

/**
 * The map, its category filters and the story rail share one selection —
 * so filtering the chips filters both the markers and the list, and
 * "Locate" on a card flies the map to that pin.
 */
export default function MapExplorer({ pins }: { pins: KindnessPin[] }) {
  const [selected, setSelected] = useState<Set<KindnessCategory>>(new Set());
  const [focusPin, setFocusPin] = useState<KindnessPin | null>(null);

  const counts = useMemo(() => {
    const map = new Map<KindnessCategory, number>();
    for (const pin of pins) {
      map.set(pin.category, (map.get(pin.category) ?? 0) + 1);
    }
    return map;
  }, [pins]);

  const visible = useMemo(
    () => (selected.size === 0 ? pins : pins.filter((p) => selected.has(p.category))),
    [pins, selected]
  );

  function toggle(category: KindnessCategory) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  const activeCategories = KINDNESS_CATEGORIES.filter((c) => (counts.get(c) ?? 0) > 0);

  return (
    <section aria-labelledby="explore-heading" className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">02 — Explore</p>
            <h2
              id="explore-heading"
              className="mt-2 font-display text-3xl text-paper sm:text-4xl"
            >
              Every light is somebody
            </h2>
          </div>
          <p
            className="font-mono text-[0.7rem] tracking-[0.16em] text-paper-faint uppercase"
            aria-live="polite"
          >
            Showing {visible.length} of {pins.length}
          </p>
        </div>

        {/* Filters */}
        {activeCategories.length > 0 && (
          <div className="mt-6">
            <div
              role="group"
              aria-label="Filter stories by category"
              className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
            >
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                aria-pressed={selected.size === 0}
                className={`shrink-0 rounded-full border px-4 py-2 font-mono text-[0.68rem] tracking-[0.14em] uppercase transition-colors ${
                  selected.size === 0
                    ? "border-glow/60 bg-glow/12 text-glow"
                    : "border-line-soft text-paper-faint hover:border-line hover:text-paper"
                }`}
              >
                All ({pins.length})
              </button>

              {activeCategories.map((category) => {
                const on = selected.has(category);
                const color = CATEGORY_COLOR_VARS[category];
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggle(category)}
                    aria-pressed={on}
                    className="shrink-0 rounded-full border px-4 py-2 font-mono text-[0.68rem] tracking-[0.14em] uppercase transition-colors"
                    style={{
                      borderColor: on ? color : "var(--color-line-soft)",
                      color: on ? color : "var(--color-paper-faint)",
                      backgroundColor: on ? categoryTint(category, 12) : "transparent",
                    }}
                  >
                    <span aria-hidden="true">{CATEGORY_EMOJI[category]}</span>{" "}
                    {CATEGORY_SHORT_LABELS[category]} ({counts.get(category)})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Map + rail */}
        <div className="lift mt-6 overflow-hidden rounded-[1.75rem] border border-line-soft bg-ink-2">
          <div className="grid lg:grid-cols-[1fr_360px]">
            <div className="relative h-[58vh] min-h-[420px] lg:h-[68vh]">
              <MapClient pins={visible} focusPin={focusPin} />

              {visible.length === 0 && (
                <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center p-6">
                  <p className="panel px-5 py-4 text-center text-sm text-paper-dim">
                    No stories in that category yet.
                  </p>
                </div>
              )}

              <p className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-full bg-ink/90 px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.14em] text-paper-faint uppercase">
                Click the map to zoom with the wheel
              </p>
            </div>

            <aside
              aria-label="Recent kindness stories"
              className="flex max-h-[68vh] min-h-0 flex-col border-t border-line-soft lg:border-t-0 lg:border-l"
            >
              <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
                <span className="eyebrow">Latest first</span>
                {focusPin && (
                  <button
                    type="button"
                    onClick={() => setFocusPin(null)}
                    className="font-mono text-[0.62rem] tracking-[0.12em] text-paper-faint uppercase hover:text-glow"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {visible.length === 0 ? (
                  <p className="py-8 text-center text-sm text-paper-faint">
                    Nothing here yet.
                  </p>
                ) : (
                  visible.map((pin) => (
                    <StoryCard
                      key={pin.id}
                      pin={pin}
                      active={focusPin?.id === pin.id}
                      onFocus={setFocusPin}
                    />
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
