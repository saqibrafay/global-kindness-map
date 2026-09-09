import Link from "next/link";
import MapExplorer from "@/components/MapExplorer";
import AdSlot from "@/components/AdSlot";
import DemoNotice from "@/components/DemoNotice";
import { listPins, isDemoMode } from "@/lib/pins/store";
import { summarisePins } from "@/lib/pins/stats";
import { CATEGORY_COLOR_VARS, KINDNESS_CATEGORIES } from "@/types/pin";
import { timeAgo } from "@/lib/time";

export const revalidate = 30; // refresh the map/feed at most every 30s

const STEPS = [
  {
    n: "01",
    title: "Drop a pin",
    body: "Click the spot on the map where it happened. No account, no email, no name — just the place.",
  },
  {
    n: "02",
    title: "Tell it plainly",
    body: "A few sentences. The small, specific ones travel furthest: the umbrella, the queue, the lamp on the corner.",
  },
  {
    n: "03",
    title: "Pass it on",
    body: "Every story gets its own page you can send to someone. If they add theirs, the chain keeps going.",
  },
];

export default async function HomePage() {
  const pins = await listPins();
  const demo = isDemoMode();

  const stats = summarisePins(pins);

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pt-14 pb-4 sm:px-8 sm:pt-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <p className="eyebrow reveal" style={{ "--d": "0ms" } as React.CSSProperties}>
                01 — A live record
              </p>

              <h1
                className="reveal mt-5 font-display text-[clamp(2.6rem,7vw,5rem)] leading-[0.98] text-balance text-paper"
                style={{ "--d": "80ms" } as React.CSSProperties}
              >
                The world at night,{" "}
                <em className="text-glow not-italic">lit by small acts</em>.
              </h1>

              <p
                className="reveal mt-7 max-w-xl text-lg leading-relaxed text-paper-dim"
                style={{ "--d": "180ms" } as React.CSSProperties}
              >
                Every light on this map is one real act of kindness someone did,
                received, or watched happen. No accounts. No ranking. No
                algorithm deciding which ones matter.
              </p>

              <div
                className="reveal mt-9 flex flex-wrap items-center gap-3"
                style={{ "--d": "260ms" } as React.CSSProperties}
              >
                <Link href="/add" className="btn-glow px-7 py-3.5 text-[0.95rem]">
                  Add your light
                </Link>
                <a href="#explore-heading" className="btn-ghost px-6 py-3.5 text-[0.9rem]">
                  Read the map
                </a>
              </div>
            </div>

            {/* Ledger — the cartographer's margin notes */}
            <div className="lg:col-span-5 lg:pt-3">
              <dl
                className="reveal panel divide-y divide-line-soft"
                style={{ "--d": "340ms" } as React.CSSProperties}
              >
                <Stat label="Lights on the map" value={stats.total.toLocaleString()} />
                <Stat label="Added in 24 hours" value={stats.last24h.toLocaleString()} />
                <Stat
                  label="Kinds of kindness"
                  value={`${stats.categoriesSeen} / ${stats.categoryTotal}`}
                />
                <Stat
                  label="Most recent"
                  value={stats.newestAt ? timeAgo(stats.newestAt) : "—"}
                  suppressHydrationWarning
                />
              </dl>

              {/* Category key */}
              <ul
                className="reveal mt-4 flex flex-wrap gap-x-4 gap-y-2"
                style={{ "--d": "420ms" } as React.CSSProperties}
              >
                {KINDNESS_CATEGORIES.map((category) => (
                  <li
                    key={category}
                    className="flex items-center gap-1.5 font-mono text-[0.62rem] tracking-[0.12em] text-paper-faint uppercase"
                  >
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full"
                      style={{
                        background: CATEGORY_COLOR_VARS[category],
                        boxShadow: `0 0 8px 1px ${CATEGORY_COLOR_VARS[category]}`,
                      }}
                    />
                    {category.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {demo && <DemoNotice className="mt-10" />}
        </div>
      </section>

      {/* ------------------------------------------------------------- Explore */}
      <MapExplorer pins={pins} />

      {/* ----------------------------------------------------------- How it works */}
      <section aria-labelledby="how-heading" className="mt-24 sm:mt-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="eyebrow">03 — How it works</p>
          <h2
            id="how-heading"
            className="mt-2 max-w-2xl font-display text-3xl text-balance text-paper sm:text-4xl"
          >
            Three minutes, and the map is a little brighter
          </h2>

          <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line-soft bg-line-soft sm:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="bg-ink-2 p-7">
                <span className="font-mono text-[0.7rem] tracking-[0.2em] text-glow">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-xl text-paper">{step.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-paper-dim">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="mt-24 sm:mt-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="panel relative overflow-hidden px-7 py-14 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-24 h-56 bg-[radial-gradient(50%_100%_at_50%_100%,rgba(255,179,71,0.22),transparent)]"
            />
            <p className="eyebrow relative">Your turn</p>
            <h2 className="relative mx-auto mt-4 max-w-2xl font-display text-3xl text-balance text-paper sm:text-[2.75rem] sm:leading-[1.08]">
              Somebody was kind to you once and never found out it mattered
            </h2>
            <p className="relative mx-auto mt-5 max-w-lg leading-relaxed text-paper-dim">
              Put it on the map. It takes a minute, and it stays there for
              whoever needs to read it at 3am.
            </p>
            <Link
              href="/add"
              className="btn-glow relative mt-9 px-8 py-4 text-[0.98rem]"
            >
              Add your light
            </Link>
          </div>

          <div className="mt-10">
            <AdSlot label="Footer ad" />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  suppressHydrationWarning,
}: {
  label: string;
  value: string;
  suppressHydrationWarning?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-4">
      <dt className="font-mono text-[0.66rem] tracking-[0.16em] text-paper-faint uppercase">
        {label}
      </dt>
      <dd
        className="font-display text-2xl text-paper"
        suppressHydrationWarning={suppressHydrationWarning}
      >
        {value}
      </dd>
    </div>
  );
}
