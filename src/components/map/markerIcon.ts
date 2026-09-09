import L from "leaflet";
import { CATEGORY_COLOR_VARS, type KindnessCategory } from "@/types/pin";

/**
 * Leaflet's packaged PNG markers don't survive bundling (and the old code
 * papered over that by pulling them from unpkg at runtime). These are
 * pure-CSS `divIcon`s instead: no network request, no broken image, and
 * they can carry the category colour straight through as a CSS variable.
 * Styling lives in globals.css under `.km-dot`.
 */

const FRESH_WINDOW_MS = 6 * 60 * 60 * 1000; // pins this recent keep pulsing

export function isFresh(createdAt: string): boolean {
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < FRESH_WINDOW_MS;
}

export function createPinIcon(
  category: KindnessCategory,
  opts: { fresh?: boolean; delaySeconds?: number } = {}
): L.DivIcon {
  const color = CATEGORY_COLOR_VARS[category] ?? CATEGORY_COLOR_VARS.other;
  const classes = ["km-dot", opts.fresh ? "km-dot--fresh" : ""].filter(Boolean).join(" ");
  const delay = opts.delaySeconds ?? 0;

  return L.divIcon({
    className: "km-marker",
    html: `<span class="${classes}" style="--c:${color};--delay:${delay}s"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

/** Larger single marker used on the individual story map. */
export function createFocusIcon(category: KindnessCategory): L.DivIcon {
  const color = CATEGORY_COLOR_VARS[category] ?? CATEGORY_COLOR_VARS.other;
  return L.divIcon({
    className: "km-marker",
    html: `<span class="km-dot km-dot--fresh" style="--c:${color};width:20px;height:20px"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  });
}

export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Plain OpenStreetMap tiles, turned dark in CSS (`.leaflet-tile-pane` in
 * globals.css) rather than pulled from a third-party dark basemap. CARTO's
 * dark tiles stamp "API KEY REQUIRED" across unregistered usage, and every
 * other dark provider wants a key — this keeps the promise of "no API key
 * needed" while still reading as a night map.
 */
export const TILE_MAX_ZOOM = 19;

/** True when the visitor has asked for less motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}
