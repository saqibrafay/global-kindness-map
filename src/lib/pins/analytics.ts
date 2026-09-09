import {
  KINDNESS_CATEGORIES,
  type KindnessCategory,
  type KindnessPin,
} from "@/types/pin";
import { countryName, countryPopulation } from "@/lib/geo/countries";

/**
 * Countries are NOT ranked by how many pins they have.
 *
 * Raw pin count is trivially inflated: anyone can generate a few hundred
 * plausible, unique, well-written stories for one country and post them in
 * an evening. Nothing about an individual pin gives that away — not a
 * duplicate filter, not a profanity filter, not a human reviewer.
 *
 * So the ranking counts **place-days**: one point per distinct place, per
 * distinct day, counting at most MAX_PLACES_PER_DAY places in any one day.
 *
 * The cap matters. Coordinates are attacker-controlled free input, so
 * "distinct places" alone is cheap to fake — scattering 300 pins randomly
 * across a country in one afternoon scored higher than months of genuine
 * use before the cap existed. Calendar days are the one dimension a
 * submitter cannot manufacture, so the score is anchored to them: a
 * single day is worth at most MAX_PLACES_PER_DAY, no matter how many pins
 * or how widely spread. Moving the ranking therefore takes sustained
 * effort across weeks — at which point it isn't really faking, it's just
 * using the site.
 */

/** ~55km grid. Coarse enough that one city is one "place". */
const PLACE_GRID_DEGREES = 0.5;

/**
 * Most places a single day can contribute. Caps the payoff of scattering
 * coordinates, which is the cheapest way to fake spread. Raise it as the
 * map grows and genuinely busy days start hitting the ceiling.
 */
export const MAX_PLACES_PER_DAY = 3;

/**
 * Place-days a country needs before it appears in the ranking at all.
 * Deliberately low while the map is small — raise it as data accumulates,
 * because a "ranking" built on one or two data points is noise.
 */
export const MIN_PLACE_DAYS_TO_RANK = 2;

export interface CountryStat {
  code: string;
  name: string;
  /** Raw submissions. Shown for context — never used to rank. */
  pins: number;
  /** Distinct ~55km cells with at least one pin. */
  places: number;
  /** Distinct UTC dates with at least one pin. */
  days: number;
  /** Distinct (place, day) pairs, capped per day — the ranking metric. */
  placeDays: number;
  /** Share of all ranked place-days, 0–1. */
  share: number;
  /** Place-days per million people; undefined without a population figure. */
  perMillion?: number;
  population?: number;
  topCategory: KindnessCategory;
  latestAt: string;
}

export interface CategoryStat {
  category: KindnessCategory;
  count: number;
  share: number;
}

export interface HourStat {
  /** 0–23, in UTC. */
  hour: number;
  count: number;
}

export interface AtlasData {
  total: number;
  located: number;
  unlocated: number;
  countriesRepresented: number;
  /** Countries with enough spread to rank, ordered by place-days. */
  ranked: CountryStat[];
  /** Seen, but too few place-days to rank yet. Ordered by pins. */
  emerging: CountryStat[];
  categories: CategoryStat[];
  hours: HourStat[];
  busiestHour: HourStat | null;
  leader: CountryStat | null;
  perCapitaLeader: CountryStat | null;
  minPlaceDaysToRank: number;
}

function placeCell(lat: number, lng: number): string {
  const y = Math.round(lat / PLACE_GRID_DEGREES);
  const x = Math.round(lng / PLACE_GRID_DEGREES);
  return `${y}:${x}`;
}

function utcDay(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

/** Everything the Atlas needs, in one pass over the pins. */
export function buildAtlas(pins: KindnessPin[]): AtlasData {
  const byCountry = new Map<string, KindnessPin[]>();
  const categoryCounts = new Map<KindnessCategory, number>();
  const hourCounts = new Array<number>(24).fill(0);

  let unlocated = 0;

  for (const pin of pins) {
    categoryCounts.set(pin.category, (categoryCounts.get(pin.category) ?? 0) + 1);

    const at = new Date(pin.created_at);
    if (!Number.isNaN(at.getTime())) hourCounts[at.getUTCHours()] += 1;

    const code = pin.country_code?.toLowerCase();
    if (!code) {
      unlocated += 1;
      continue;
    }
    const bucket = byCountry.get(code);
    if (bucket) bucket.push(pin);
    else byCountry.set(code, [pin]);
  }

  const located = pins.length - unlocated;

  const stats: CountryStat[] = [...byCountry.entries()].map(([code, countryPins]) => {
    const counts = new Map<KindnessCategory, number>();
    const places = new Set<string>();
    const placesByDay = new Map<string, Set<string>>();
    let latestAt = countryPins[0].created_at;

    for (const pin of countryPins) {
      counts.set(pin.category, (counts.get(pin.category) ?? 0) + 1);
      if (pin.created_at > latestAt) latestAt = pin.created_at;

      const cell = placeCell(pin.latitude, pin.longitude);
      places.add(cell);

      const day = utcDay(pin.created_at);
      if (!day) continue;
      const dayPlaces = placesByDay.get(day);
      if (dayPlaces) dayPlaces.add(cell);
      else placesByDay.set(day, new Set([cell]));
    }

    // Each day contributes its distinct places, up to the daily cap.
    let placeDays = 0;
    for (const dayPlaces of placesByDay.values()) {
      placeDays += Math.min(dayPlaces.size, MAX_PLACES_PER_DAY);
    }

    const topCategory = [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    )[0][0];

    const population = countryPopulation(code);

    return {
      code,
      name: countryName(code),
      pins: countryPins.length,
      places: places.size,
      days: placesByDay.size,
      placeDays,
      share: 0, // filled in below, once the ranked total is known
      population,
      perMillion: population ? placeDays / population : undefined,
      topCategory,
      latestAt,
    };
  });

  const ranked = stats
    .filter((c) => c.placeDays >= MIN_PLACE_DAYS_TO_RANK)
    // Ties break on spread, then pins, then alphabetically — stable between renders.
    .sort(
      (a, b) =>
        b.placeDays - a.placeDays ||
        b.places - a.places ||
        b.pins - a.pins ||
        a.name.localeCompare(b.name)
    );

  const rankedPlaceDays = ranked.reduce((sum, c) => sum + c.placeDays, 0);
  for (const country of ranked) {
    country.share = rankedPlaceDays > 0 ? country.placeDays / rankedPlaceDays : 0;
  }

  const emerging = stats
    .filter((c) => c.placeDays < MIN_PLACE_DAYS_TO_RANK)
    .sort((a, b) => b.pins - a.pins || a.name.localeCompare(b.name));

  const categories: CategoryStat[] = KINDNESS_CATEGORIES.map((category) => {
    const count = categoryCounts.get(category) ?? 0;
    return {
      category,
      count,
      share: pins.length > 0 ? count / pins.length : 0,
    };
  }).sort((a, b) => b.count - a.count);

  const hours: HourStat[] = hourCounts.map((count, hour) => ({ hour, count }));
  const busiestHour =
    pins.length > 0
      ? hours.reduce((best, current) => (current.count > best.count ? current : best))
      : null;

  const withPerMillion = ranked.filter((c) => c.perMillion !== undefined);
  const perCapitaLeader =
    withPerMillion.length > 0
      ? withPerMillion.reduce((best, c) =>
          (c.perMillion ?? 0) > (best.perMillion ?? 0) ? c : best
        )
      : null;

  return {
    total: pins.length,
    located,
    unlocated,
    countriesRepresented: stats.length,
    ranked,
    emerging,
    categories,
    hours,
    busiestHour,
    leader: ranked[0] ?? null,
    perCapitaLeader,
    minPlaceDaysToRank: MIN_PLACE_DAYS_TO_RANK,
  };
}
