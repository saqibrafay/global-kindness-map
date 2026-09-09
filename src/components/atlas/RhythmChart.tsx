import type { HourStat } from "@/lib/pins/analytics";

/**
 * When kindness gets recorded, by hour (UTC). A plain CSS bar chart — no
 * charting library for 24 numbers.
 */
export default function RhythmChart({ hours }: { hours: HourStat[] }) {
  const max = Math.max(1, ...hours.map((h) => h.count));

  return (
    <figure>
      <div
        className="flex h-40 items-end gap-[3px]"
        role="img"
        aria-label={`Acts of kindness by hour of day, UTC. ${hours
          .filter((h) => h.count > 0)
          .map((h) => `${h.hour}:00 — ${h.count}`)
          .join("; ")}`}
      >
        {hours.map((h) => {
          const pct = (h.count / max) * 100;
          return (
            <div
              key={h.hour}
              className="group relative flex-1 rounded-t-[3px] bg-line-soft transition-colors hover:bg-line"
              style={{ height: "100%" }}
            >
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-[3px] bg-gradient-to-t from-glow-deep to-glow transition-[height] duration-500"
                style={{
                  height: `${Math.max(h.count > 0 ? 4 : 0, pct)}%`,
                  opacity: h.count > 0 ? 0.9 : 0,
                }}
              />
            </div>
          );
        })}
      </div>

      <figcaption className="mt-3 flex justify-between font-mono text-[0.6rem] tracking-[0.12em] text-paper-faint uppercase">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </figcaption>
    </figure>
  );
}
