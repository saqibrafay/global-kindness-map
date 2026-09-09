export const KINDNESS_CATEGORIES = [
  "help_stranger",
  "donation",
  "environment",
  "animal",
  "emotional_support",
  "community",
  "other",
] as const;

export type KindnessCategory = (typeof KINDNESS_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<KindnessCategory, string> = {
  help_stranger: "Helped a stranger",
  donation: "Donation / gift",
  environment: "Environment",
  animal: "Animal kindness",
  emotional_support: "Emotional support",
  community: "Community effort",
  other: "Something else",
};

/** Short label used where space is tight (map filter chips, marker legend). */
export const CATEGORY_SHORT_LABELS: Record<KindnessCategory, string> = {
  help_stranger: "Strangers",
  donation: "Giving",
  environment: "Environment",
  animal: "Animals",
  emotional_support: "Support",
  community: "Community",
  other: "Other",
};

export const CATEGORY_EMOJI: Record<KindnessCategory, string> = {
  help_stranger: "🤝",
  donation: "🎁",
  environment: "🌱",
  animal: "🐾",
  emotional_support: "💛",
  community: "🏘️",
  other: "✨",
};

/**
 * Literal hex per category, for contexts that can't resolve CSS variables
 * — currently only the Open Graph image, which Satori rasterises on the
 * server. Anything rendered in the browser should use
 * CATEGORY_COLOR_VARS so it follows the light/dark theme.
 */
export const CATEGORY_COLORS: Record<KindnessCategory, string> = {
  help_stranger: "#ffb347",
  donation: "#ff8a6b",
  environment: "#6fe3b0",
  animal: "#c9a7ff",
  emotional_support: "#ff9ec4",
  community: "#7cc7ff",
  other: "#f0e2bd",
};

export interface KindnessPin {
  id: string;
  created_at: string;
  latitude: number;
  longitude: number;
  location_label: string | null;
  category: KindnessCategory;
  message: string;
  /** ISO 3166-1 alpha-2, lowercase. Resolved from the coordinates on
   *  submission; null when it couldn't be determined. Powers /atlas. */
  country_code: string | null;
  chain_parent_id: string | null;
  approved: boolean;
}

export interface NewKindnessPin {
  latitude: number;
  longitude: number;
  location_label?: string;
  category: KindnessCategory;
  message: string;
  country_code?: string | null;
  chain_parent_id?: string | null;
}

export function isKindnessCategory(value: unknown): value is KindnessCategory {
  return (
    typeof value === "string" &&
    (KINDNESS_CATEGORIES as readonly string[]).includes(value)
  );
}

/**
 * The themeable form of the category palette. Both themes define these in
 * globals.css, so a colour handed to an inline style or a Leaflet marker
 * re-resolves when the theme changes — no re-render required.
 */
export const CATEGORY_COLOR_VARS: Record<KindnessCategory, string> = {
  help_stranger: "var(--color-cat-help_stranger)",
  donation: "var(--color-cat-donation)",
  environment: "var(--color-cat-environment)",
  animal: "var(--color-cat-animal)",
  emotional_support: "var(--color-cat-emotional_support)",
  community: "var(--color-cat-community)",
  other: "var(--color-cat-other)",
};

/** A translucent wash of a category colour, e.g. for a selected chip. */
export function categoryTint(category: KindnessCategory, percent: number): string {
  return `color-mix(in oklab, ${CATEGORY_COLOR_VARS[category]} ${percent}%, transparent)`;
}
