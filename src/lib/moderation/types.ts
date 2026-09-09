/** Shared across moderation providers (see gemini.ts, openai.ts). */
export type ScreenOutcome =
  | { action: "allow" }
  | { action: "block"; reason: string; categories: string[] }
  | { action: "block-compassionately"; reason: string; categories: string[] };

/**
 * Shown when the author appears to be describing their own intent to harm
 * themselves. Publishing that anonymously on a map helps nobody, and a
 * blank "not allowed" is worse than saying something human.
 */
export const CRISIS_MESSAGE =
  "This doesn't look like a story for the map, and that's alright. If you're " +
  "going through something, please talk to someone — findahelpline.com lists " +
  "free, confidential helplines wherever you are.";

export const GENERIC_BLOCK_MESSAGE =
  "This doesn't read like an act of kindness. Please rewrite it as " +
  "something someone did, received, or witnessed.";
