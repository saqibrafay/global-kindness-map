/**
 * Country reference data for the Atlas.
 *
 * `population` is in millions (rounded, ~2024 UN/World Bank figures) and is
 * only used to offer a per-million view alongside raw counts. Countries
 * without a population entry simply show "—" for that column rather than a
 * made-up number.
 *
 * Flags are derived from the ISO code (regional indicator letters), so
 * there is no flag data to keep in sync.
 */
export interface Country {
  name: string;
  /** Millions of people. Omitted where we'd rather show nothing than a guess. */
  population?: number;
}

export const COUNTRIES: Record<string, Country> = {
  ae: { name: "United Arab Emirates", population: 9.5 },
  af: { name: "Afghanistan", population: 42.2 },
  ar: { name: "Argentina", population: 45.5 },
  at: { name: "Austria", population: 9.1 },
  au: { name: "Australia", population: 26.6 },
  bd: { name: "Bangladesh", population: 173 },
  be: { name: "Belgium", population: 11.7 },
  bg: { name: "Bulgaria", population: 6.4 },
  br: { name: "Brazil", population: 216.4 },
  ca: { name: "Canada", population: 40.1 },
  ch: { name: "Switzerland", population: 8.8 },
  cl: { name: "Chile", population: 19.6 },
  cn: { name: "China", population: 1410 },
  co: { name: "Colombia", population: 52.1 },
  cz: { name: "Czechia", population: 10.9 },
  de: { name: "Germany", population: 84.5 },
  dk: { name: "Denmark", population: 5.9 },
  dz: { name: "Algeria", population: 45.6 },
  eg: { name: "Egypt", population: 112.7 },
  es: { name: "Spain", population: 48.4 },
  et: { name: "Ethiopia", population: 126.5 },
  fi: { name: "Finland", population: 5.6 },
  fr: { name: "France", population: 68.2 },
  gb: { name: "United Kingdom", population: 68.4 },
  gh: { name: "Ghana", population: 34.1 },
  gr: { name: "Greece", population: 10.4 },
  hk: { name: "Hong Kong", population: 7.5 },
  hr: { name: "Croatia", population: 3.9 },
  hu: { name: "Hungary", population: 9.6 },
  id: { name: "Indonesia", population: 277.5 },
  ie: { name: "Ireland", population: 5.3 },
  il: { name: "Israel", population: 9.8 },
  in: { name: "India", population: 1428.6 },
  iq: { name: "Iraq", population: 45.5 },
  ir: { name: "Iran", population: 89.2 },
  it: { name: "Italy", population: 58.9 },
  jp: { name: "Japan", population: 123.3 },
  ke: { name: "Kenya", population: 55.1 },
  kr: { name: "South Korea", population: 51.8 },
  lk: { name: "Sri Lanka", population: 21.9 },
  ma: { name: "Morocco", population: 37.8 },
  mx: { name: "Mexico", population: 128.5 },
  my: { name: "Malaysia", population: 34.3 },
  ng: { name: "Nigeria", population: 223.8 },
  nl: { name: "Netherlands", population: 17.6 },
  no: { name: "Norway", population: 5.5 },
  np: { name: "Nepal", population: 30.9 },
  nz: { name: "New Zealand", population: 5.2 },
  pe: { name: "Peru", population: 34.4 },
  ph: { name: "Philippines", population: 117.3 },
  pk: { name: "Pakistan", population: 240.5 },
  pl: { name: "Poland", population: 36.7 },
  pt: { name: "Portugal", population: 10.2 },
  qa: { name: "Qatar", population: 2.7 },
  ro: { name: "Romania", population: 19.1 },
  rs: { name: "Serbia", population: 6.7 },
  ru: { name: "Russia", population: 144.4 },
  sa: { name: "Saudi Arabia", population: 36.9 },
  se: { name: "Sweden", population: 10.6 },
  sg: { name: "Singapore", population: 6 },
  th: { name: "Thailand", population: 71.8 },
  tr: { name: "Türkiye", population: 85.3 },
  tw: { name: "Taiwan", population: 23.4 },
  tz: { name: "Tanzania", population: 67.4 },
  ua: { name: "Ukraine", population: 37 },
  ug: { name: "Uganda", population: 48.6 },
  us: { name: "United States", population: 334.9 },
  uy: { name: "Uruguay", population: 3.4 },
  ve: { name: "Venezuela", population: 28.8 },
  vn: { name: "Vietnam", population: 98.9 },
  za: { name: "South Africa", population: 60.4 },
  zw: { name: "Zimbabwe", population: 16.7 },
};

/** "in" → 🇮🇳, built from regional indicator symbols. */
export function countryFlag(code: string): string {
  const upper = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "🏳️";
  return String.fromCodePoint(
    ...[...upper].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65)
  );
}

export function countryName(code: string): string {
  return COUNTRIES[code.toLowerCase()]?.name ?? code.toUpperCase();
}

export function countryPopulation(code: string): number | undefined {
  return COUNTRIES[code.toLowerCase()]?.population;
}
