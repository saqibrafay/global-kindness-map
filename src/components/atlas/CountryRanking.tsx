"use client";

import { useMemo, useState } from "react";
import { countryFlag } from "@/lib/geo/countries";
import {
  CATEGORY_COLOR_VARS,
  categoryTint,
  CATEGORY_EMOJI,
  CATEGORY_SHORT_LABELS,
} from "@/types/pin";
import { timeAgo } from "@/lib/time";
import { MAX_PLACES_PER_DAY, type CountryStat } from "@/lib/pins/analytics";

type Mode = "reach" | "perCapita";

export default function CountryRanking({
  ranked,
  emerging,
  minPlaceDays,
}: {
  ranked: CountryStat[];
  emerging: CountryStat[];
  minPlaceDays: number;
}) {
  const [mode, setMode] = useState<Mode>("reach");

  const rows = useMemo(() => {
    if (mode === "reach") return ranked;
    // Countries with no population figure can't be ranked per-capita, so
    // they sink to the bottom rather than being silently dropped.
    return [...ranked].sort((a, b) => {
      if (a.perMillion === undefined && b.perMillion === undefined) {
        return b.placeDays - a.placeDays;
      }
      if (a.perMillion === undefined) return 1;
      if (b.perMillion === undefined) return -1;
      return b.perMillion - a.perMillion;
    });
  }, [ranked, mode]);

  const max = useMemo(
    () =>
      Math.max(
        1,
        ...rows.map((c) => (mode === "reach" ? c.placeDays : (c.perMillion ?? 0)))
      ),
    [rows, mode]
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Ranking method"
        className="mb-4 inline-flex rounded-full border border-line-soft p-1"
      >
        <ModeButton
          active={mode === "reach"}
          onClick={() => setMode("reach")}
          label="By reach"
        />
        <ModeButton
          active={mode === "perCapita"}
          onClick={() => setMode("perCapita")}
          label="Per million people"
        />
      </div>

      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-paper-dim">
        Ordered by <strong className="font-medium text-paper">place-days</strong>{" "}
        — one point per place, per day a story arrived from it, counting at
        most {MAX_PLACES_PER_DAY} places in any single day. Three hundred
        stories posted in one afternoon are worth {MAX_PLACES_PER_DAY} points
        however widely they are scattered, so this reads as sustained
        participation over time rather than whoever posted hardest. Raw pin
        counts are shown for context but never used to order the list.
      </p>

      {rows.length === 0 ? (
        <p className="panel px-5 py-8 text-center text-sm text-paper-dim">
          No country has reached {minPlaceDays} place-days yet. The ranking
          appears once stories arrive from more than one place or day.
        </p>
      ) : (
        <ol className="space-y-1.5">
          {rows.map((country, index) => {
            const value = mode === "reach" ? country.placeDays : country.perMillion;
            const pct = value === undefined ? 0 : Math.max(2, (value / max) * 100);

            return (
              <li key={country.code}>
                <div className="group relative overflow-hidden rounded-xl border border-line-soft bg-ink-2/60 transition-colors hover:border-line">
                  {/* The bar is the background, so the row reads as a chart */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${categoryTint(
                        country.topCategory,
                        20
                      )}, ${categoryTint(country.topCategory, 4)})`,
                      borderRight: `1px solid ${categoryTint(country.topCategory, 40)}`,
                    }}
                  />

                  <div className="relative flex items-center gap-3 px-4 py-3">
                    <span className="w-6 shrink-0 font-mono text-[0.7rem] text-paper-faint tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-lg">
                      {countryFlag(country.code)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.95rem] text-paper">
                        {country.name}
                      </p>

                      {/* The shape of the data, so gaming is visible rather
                          than something the reader has to take on trust. */}
                      <p className="mt-0.5 font-mono text-[0.62rem] tracking-[0.1em] text-paper-faint uppercase">
                        {country.pins} pin{country.pins === 1 ? "" : "s"} ·{" "}
                        {country.places} place{country.places === 1 ? "" : "s"} ·{" "}
                        {country.days} day{country.days === 1 ? "" : "s"}
                      </p>

                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[0.62rem] tracking-[0.1em] uppercase">
                        <span style={{ color: CATEGORY_COLOR_VARS[country.topCategory] }}>
                          {CATEGORY_EMOJI[country.topCategory]}{" "}
                          {CATEGORY_SHORT_LABELS[country.topCategory]}
                        </span>
                        <span aria-hidden="true" className="text-paper-faint">
                          ·
                        </span>
                        <span className="text-paper-faint" suppressHydrationWarning>
                          {timeAgo(country.latestAt)}
                        </span>
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      {mode === "reach" ? (
                        <>
                          <p className="font-display text-xl text-paper tabular-nums">
                            {country.placeDays}
                          </p>
                          <p className="font-mono text-[0.6rem] text-paper-faint tabular-nums">
                            place-days
                          </p>
                        </>
                      ) : country.perMillion !== undefined ? (
                        <>
                          <p className="font-display text-xl text-paper tabular-nums">
                            {country.perMillion < 0.1
                              ? country.perMillion.toFixed(3)
                              : country.perMillion.toFixed(2)}
                          </p>
                          <p className="font-mono text-[0.6rem] text-paper-faint tabular-nums">
                            per 1M
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-display text-xl text-paper-faint">—</p>
                          <p className="font-mono text-[0.6rem] text-paper-faint">
                            no data
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {mode === "perCapita" && rows.length > 0 && (
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-paper-faint">
          Per-million figures use population estimates for the countries we
          hold data on; the rest show &ldquo;no data&rdquo; rather than a
          guess. On a small map these ratios swing wildly — treat them as a
          curiosity, not a ranking of national character.
        </p>
      )}

      {emerging.length > 0 && (
        <section aria-labelledby="emerging-heading" className="mt-10">
          <h3
            id="emerging-heading"
            className="font-mono text-[0.66rem] tracking-[0.16em] text-paper-faint uppercase"
          >
            Also on the map — not enough spread to rank yet
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {emerging.map((country) => (
              <li
                key={country.code}
                className="flex items-center gap-2 rounded-full border border-line-soft px-3 py-1.5"
              >
                <span aria-hidden="true">{countryFlag(country.code)}</span>
                <span className="text-[0.82rem] text-paper-dim">{country.name}</span>
                <span className="font-mono text-[0.6rem] text-paper-faint tabular-nums">
                  {country.pins}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 font-mono text-[0.66rem] tracking-[0.14em] uppercase transition-colors ${
        active ? "bg-glow/15 text-glow" : "text-paper-faint hover:text-paper"
      }`}
    >
      {label}
    </button>
  );
}
