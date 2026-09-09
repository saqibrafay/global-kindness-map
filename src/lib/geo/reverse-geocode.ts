/**
 * Turn a pin's coordinates into an ISO country code, once, at submission
 * time — so the Atlas can group by country without re-geocoding on every
 * page view.
 *
 * Uses OpenStreetMap's Nominatim (the same project whose tiles the map
 * already uses). Deliberately best-effort:
 *  - it never blocks a pin from being saved; on any failure the pin is
 *    stored with a null country and simply counts as "Unmapped";
 *  - a short timeout, so a slow geocoder can't hang the submission;
 *  - results are cached per rounded coordinate, so repeated pins in one
 *    city hit the network once;
 *  - set REVERSE_GEOCODE=off to disable the outbound call entirely.
 *
 * Nominatim's usage policy requires an identifying User-Agent and low
 * request rates; one lookup per submitted pin sits comfortably inside it.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";
const TIMEOUT_MS = 3500;
const CACHE_LIMIT = 2000;

const cache = new Map<string, string | null>();

function cacheKey(lat: number, lng: number): string {
  // ~1km precision is plenty for a country lookup.
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

function isEnabled(): boolean {
  return process.env.REVERSE_GEOCODE !== "off";
}

function userAgent(): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `GlobalKindnessMap/1.0 (${site})`;
}

/**
 * Returns a lowercase ISO 3166-1 alpha-2 code, or null when the country
 * can't be determined (ocean, geocoder down, lookups disabled).
 */
export async function countryCodeForCoords(
  lat: number,
  lng: number
): Promise<string | null> {
  if (!isEnabled()) return null;

  const key = cacheKey(lat, lng);
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    // zoom=3 asks for country-level detail only.
    url.searchParams.set("zoom", "3");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": userAgent(), Accept: "application/json" },
    });

    if (!res.ok) {
      remember(key, null);
      return null;
    }

    const json: { address?: { country_code?: string } } = await res.json();
    const code = json.address?.country_code?.toLowerCase() ?? null;
    const valid = code && /^[a-z]{2}$/.test(code) ? code : null;

    remember(key, valid);
    return valid;
  } catch {
    // Timeout, network error, bad JSON — the pin still saves.
    remember(key, null);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function remember(key: string, value: string | null): void {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}
