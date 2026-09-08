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

export const CATEGORY_EMOJI: Record<KindnessCategory, string> = {
  help_stranger: "🤝",
  donation: "🎁",
  environment: "🌱",
  animal: "🐾",
  emotional_support: "💛",
  community: "🏘️",
  other: "✨",
};

export interface KindnessPin {
  id: string;
  created_at: string;
  latitude: number;
  longitude: number;
  location_label: string | null;
  category: KindnessCategory;
  message: string;
  chain_parent_id: string | null;
  approved: boolean;
}

export interface NewKindnessPin {
  latitude: number;
  longitude: number;
  location_label?: string;
  category: KindnessCategory;
  message: string;
  chain_parent_id?: string | null;
}
