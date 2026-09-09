import { KINDNESS_CATEGORIES, type KindnessPin } from "@/types/pin";

export interface MapStats {
  total: number;
  last24h: number;
  categoriesSeen: number;
  categoryTotal: number;
  newestAt: string | null;
}

/**
 * Headline numbers for the home page. Kept out of the component body so
 * the render stays pure — the clock is read here, not during render.
 */
export function summarisePins(pins: KindnessPin[]): MapStats {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

  let last24h = 0;
  const seen = new Set<string>();
  for (const pin of pins) {
    if (new Date(pin.created_at).getTime() > dayAgo) last24h += 1;
    seen.add(pin.category);
  }

  return {
    total: pins.length,
    last24h,
    categoriesSeen: seen.size,
    categoryTotal: KINDNESS_CATEGORIES.length,
    newestAt: pins[0]?.created_at ?? null,
  };
}
