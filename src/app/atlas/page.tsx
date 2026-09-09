import type { Metadata } from "next";
import Link from "next/link";
import { listPins, isDemoMode } from "@/lib/pins/store";
import { buildAtlas } from "@/lib/pins/analytics";
import { countryFlag } from "@/lib/geo/countries";
import { CATEGORY_COLOR_VARS, CATEGORY_EMOJI, CATEGORY_LABELS } from "@/types/pin";
import CountryRanking from "@/components/atlas/CountryRanking";
import RhythmChart from "@/components/atlas/RhythmChart";
import DemoNotice from "@/components/DemoNotice";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Atlas",
  description:
    "Where kindness is being recorded: a country-by-country breakdown of the Global Kindness Map, plus what kind of kindness and when.",
};

export default async function AtlasPage() {
  const pins = await listPins();
  const atlas = buildAtlas(pins);
  const demo = isDemoMode();

  return (
    <div className="mx-auto max-w-5xl px-5 pt-14 pb-4 sm:px-8 sm:pt-20">
      <header>
        <p className="eyebrow">The Atlas</p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.02] text-balance text-paper">
          Where the lights are coming from
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-paper-dim">
          A count of what people have chosen to write down — which is not the
          same as where kindness happens. Every map like this measures who is
          using it as much as what it records, so this page is built to show
          participation honestly rather than to crown a winner.
        </p>
      </header>

      {demo && <DemoNotice className="mt-8" />}

      {atlas.total === 0 ? (
        <p className="panel mt-12 px-6 py-12 text-center text-paper-dim">
          Nothing to count yet.{" "}
          <Link href="/add" className="text-glow underline underline-offset-4">
            Add the first pin
          </Link>
          .
        </p>
      ) : (
        <>
          {/* ------------------------------------------------ Headline figures */}
          <section aria-label="Headline figures" className="mt-12">
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft sm:grid-cols-2 lg:grid-cols-4">
              <Figure label="Acts recorded" value={String(atlas.total)} />
              <Figure
                label="Countries"
                value={String(atlas.countriesRepresented)}
              />
              <Figure
                label="Widest reach"
                value={
                  atlas.leader
                    ? `${countryFlag(atlas.leader.code)} ${atlas.leader.name}`
                    : "—"
                }
                sub={
                  atlas.leader
                    ? `${atlas.leader.places} places · ${atlas.leader.days} days`
                    : undefined
                }
                small
              />
              <Figure
                label="Busiest hour (UTC)"
                value={
                  atlas.busiestHour
                    ? `${String(atlas.busiestHour.hour).padStart(2, "0")}:00`
                    : "—"
                }
                sub={
                  atlas.busiestHour ? `${atlas.busiestHour.count} pins` : undefined
                }
              />
            </dl>

            {atlas.unlocated > 0 && (
              <p className="mt-3 font-mono text-[0.64rem] tracking-[0.12em] text-paper-faint uppercase">
                {atlas.unlocated} pin{atlas.unlocated === 1 ? "" : "s"} could
                not be placed in a country and sit outside the ranking
              </p>
            )}
          </section>

          {/* --------------------------------------------------- Leaderboard */}
          <section aria-labelledby="countries-heading" className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">01 — By country</p>
                <h2
                  id="countries-heading"
                  className="mt-2 font-display text-2xl text-paper sm:text-3xl"
                >
                  Where the stories come from
                </h2>
              </div>
              {atlas.perCapitaLeader && (
                <p className="font-mono text-[0.64rem] tracking-[0.12em] text-paper-faint uppercase">
                  Densest: {countryFlag(atlas.perCapitaLeader.code)}{" "}
                  {atlas.perCapitaLeader.name}
                </p>
              )}
            </div>

            <div className="mt-6">
              <CountryRanking
                ranked={atlas.ranked}
                emerging={atlas.emerging}
                minPlaceDays={atlas.minPlaceDaysToRank}
              />
            </div>
          </section>

          {/* ---------------------------------------------------- Categories */}
          <section aria-labelledby="categories-heading" className="mt-16">
            <p className="eyebrow">02 — By kind</p>
            <h2
              id="categories-heading"
              className="mt-2 font-display text-2xl text-paper sm:text-3xl"
            >
              What people record
            </h2>

            <ul className="mt-6 space-y-2">
              {atlas.categories.map((stat) => {
                const color = CATEGORY_COLOR_VARS[stat.category];
                return (
                  <li
                    key={stat.category}
                    className="flex items-center gap-4 rounded-xl border border-line-soft bg-ink-2/60 px-4 py-3"
                  >
                    <span className="w-44 shrink-0 truncate text-sm text-paper-dim">
                      <span aria-hidden="true">
                        {CATEGORY_EMOJI[stat.category]}
                      </span>{" "}
                      {CATEGORY_LABELS[stat.category]}
                    </span>
                    <div
                      className="h-2 flex-1 overflow-hidden rounded-full bg-line-soft"
                      role="img"
                      aria-label={`${CATEGORY_LABELS[stat.category]}: ${
                        stat.count
                      } pins, ${(stat.share * 100).toFixed(0)} percent`}
                    >
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{
                          width: `${stat.share * 100}%`,
                          background: color,
                          boxShadow: `0 0 12px 0 ${color}`,
                        }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right font-mono text-[0.72rem] text-paper tabular-nums">
                      {stat.count}
                    </span>
                    <span className="hidden w-14 shrink-0 text-right font-mono text-[0.66rem] text-paper-faint tabular-nums sm:block">
                      {(stat.share * 100).toFixed(0)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ------------------------------------------------------- Rhythm */}
          <section aria-labelledby="rhythm-heading" className="mt-16">
            <p className="eyebrow">03 — By hour</p>
            <h2
              id="rhythm-heading"
              className="mt-2 font-display text-2xl text-paper sm:text-3xl"
            >
              When it gets written down
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper-dim">
              Hour of day in UTC, across every pin on the map.
            </p>
            <div className="panel mt-6 px-5 py-6">
              <RhythmChart hours={atlas.hours} />
            </div>
          </section>
        </>
      )}

      <section className="panel mt-16 px-7 py-10 text-center">
        <p className="eyebrow">Move the numbers</p>
        <h2 className="mt-4 font-display text-2xl text-balance text-paper">
          Every row on this page started as one person typing
        </h2>
        <Link href="/add" className="btn-glow mt-7 px-7 py-3.5 text-[0.95rem]">
          Add your light
        </Link>
      </section>

      <p className="mt-12 text-center">
        <Link
          href="/"
          className="font-mono text-[0.7rem] tracking-[0.16em] text-paper-faint uppercase underline-offset-4 hover:text-glow hover:underline"
        >
          ← Back to the map
        </Link>
      </p>
    </div>
  );
}

function Figure({
  label,
  value,
  sub,
  small,
}: {
  label: string;
  value: string;
  sub?: string;
  small?: boolean;
}) {
  return (
    <div className="bg-ink-2 px-5 py-6">
      <dt className="font-mono text-[0.62rem] tracking-[0.16em] text-paper-faint uppercase">
        {label}
      </dt>
      <dd
        className={`mt-2 font-display text-paper ${small ? "text-xl" : "text-3xl"}`}
      >
        {value}
      </dd>
      {sub && (
        <p className="mt-1 font-mono text-[0.62rem] text-paper-faint">{sub}</p>
      )}
    </div>
  );
}
