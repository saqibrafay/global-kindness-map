import { Filter } from "bad-words";
import { KINDNESS_CATEGORIES, type KindnessCategory } from "@/types/pin";

const filter = new Filter();

export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 500;

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Validate + moderate a submitted kindness story before it is written to
 * the database. This is intentionally simple for the MVP:
 * - basic length checks
 * - profanity filter (bad-words)
 * - coordinate sanity checks
 * - category whitelist
 *
 * This is a good first area for open-source contributors to improve
 * (e.g. smarter spam detection, link stripping, multi-language profanity
 * lists).
 */
export function validateNewPin(input: {
  latitude: unknown;
  longitude: unknown;
  message: unknown;
  category: unknown;
  location_label?: unknown;
}): ValidationResult {
  const { latitude, longitude, message, category, location_label } = input;

  if (typeof latitude !== "number" || Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    return { ok: false, error: "Invalid latitude." };
  }

  if (typeof longitude !== "number" || Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    return { ok: false, error: "Invalid longitude." };
  }

  if (typeof message !== "string") {
    return { ok: false, error: "Message is required." };
  }

  const trimmed = message.trim();
  if (trimmed.length < MESSAGE_MIN_LENGTH) {
    return { ok: false, error: `Message must be at least ${MESSAGE_MIN_LENGTH} characters.` };
  }
  if (trimmed.length > MESSAGE_MAX_LENGTH) {
    return { ok: false, error: `Message must be under ${MESSAGE_MAX_LENGTH} characters.` };
  }

  if (filter.isProfane(trimmed)) {
    return { ok: false, error: "Message contains language that isn't allowed. Please rephrase." };
  }

  if (typeof category !== "string" || !KINDNESS_CATEGORIES.includes(category as KindnessCategory)) {
    return { ok: false, error: "Invalid category." };
  }

  if (location_label !== undefined && typeof location_label !== "string") {
    return { ok: false, error: "Invalid location label." };
  }
  if (typeof location_label === "string" && location_label.length > 120) {
    return { ok: false, error: "Location label is too long." };
  }

  // Very basic spam guard: block messages that are mostly a URL.
  const urlCount = (trimmed.match(/https?:\/\//gi) || []).length;
  if (urlCount > 0) {
    return { ok: false, error: "Links aren't allowed in kindness stories." };
  }

  return { ok: true };
}

/**
 * Extremely simple in-memory rate limiter, keyed by IP.
 *
 * NOTE: this resets whenever the server process restarts and does not
 * share state across multiple server instances — it's a basic deterrent,
 * not a robust rate limiter. For production scale, replace with a
 * shared store (e.g. Upstash Redis) — this is flagged as a good
 * first-issue in CONTRIBUTING.md.
 */
const submissionLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_SUBMISSIONS = 5;

export function checkRateLimit(ip: string): ValidationResult {
  const now = Date.now();
  const history = (submissionLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (history.length >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return { ok: false, error: "Too many submissions. Please try again later." };
  }

  history.push(now);
  submissionLog.set(ip, history);
  return { ok: true };
}
