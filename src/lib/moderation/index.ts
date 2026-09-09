import { Filter } from "bad-words";
import { isKindnessCategory } from "@/types/pin";
import { screenWithOpenAI, isOpenAIModerationEnabled } from "./openai";
import { screenWithGemini, isGeminiModerationEnabled } from "./gemini";

export { isOpenAIModerationEnabled } from "./openai";
export { isGeminiModerationEnabled } from "./gemini";

/**
 * Which AI screening provider is configured, if any. Gemini wins when both
 * keys are set, simply because it is the one with a usable free tier.
 */
export function moderationProvider(): "gemini" | "openai" | null {
  if (isGeminiModerationEnabled()) return "gemini";
  if (isOpenAIModerationEnabled()) return "openai";
  return null;
}

/** True when submissions get context-aware screening, not just a word list. */
export function isAiScreeningEnabled(): boolean {
  return moderationProvider() !== null;
}

const filter = new Filter();

export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 500;
export const LOCATION_LABEL_MAX_LENGTH = 120;

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

/**
 * Anything that looks like someone trying to get a link past us: a real
 * scheme, a bare `www.` host, or `domain.tld/...`. Deliberately blunt —
 * kindness stories have no reason to carry URLs.
 */
const LINK_PATTERNS: RegExp[] = [
  /\bhttps?:\/\//i,
  /\bwww\./i,
  /\b[a-z0-9-]+\.(com|net|org|io|co|me|ly|xyz|info|biz|shop|link|app|dev|ru|cn|in|uk)\b/i,
  /\b[a-z0-9-]+\s*\[?\.\]?\s*(com|net|org)\b/i,
];

/** Loose UUID check, so a malformed chain id fails as a 400, not a 500. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Ids minted by the in-memory demo store (see lib/pins/store.ts). */
const DEMO_ID_RE = /^(demo|local)-[a-z0-9-]{1,40}$/i;

export function isValidPinId(value: unknown): value is string {
  return typeof value === "string" && (UUID_RE.test(value) || DEMO_ID_RE.test(value));
}

/**
 * Validate + moderate a submitted kindness story before it is written to
 * the database: length checks, profanity filter, coordinate sanity,
 * category whitelist, and a basic link/spam guard.
 *
 * Still deliberately simple — smarter spam detection is a good first
 * issue for contributors (see CONTRIBUTING.md).
 */
export function validateNewPin(input: {
  latitude: unknown;
  longitude: unknown;
  message: unknown;
  category: unknown;
  location_label?: unknown;
  chain_parent_id?: unknown;
}): ValidationResult {
  const { latitude, longitude, message, category, location_label, chain_parent_id } = input;

  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    return { ok: false, error: "Invalid latitude." };
  }

  if (
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
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

  if (!isKindnessCategory(category)) {
    return { ok: false, error: "Invalid category." };
  }

  if (location_label !== undefined && location_label !== null) {
    if (typeof location_label !== "string") {
      return { ok: false, error: "Invalid location label." };
    }
    if (location_label.trim().length > LOCATION_LABEL_MAX_LENGTH) {
      return { ok: false, error: "Location label is too long." };
    }
    if (LINK_PATTERNS.some((re) => re.test(location_label))) {
      return { ok: false, error: "Links aren't allowed in the place name." };
    }
  }

  if (
    chain_parent_id !== undefined &&
    chain_parent_id !== null &&
    chain_parent_id !== "" &&
    !isValidPinId(chain_parent_id)
  ) {
    return { ok: false, error: "Invalid chain reference." };
  }

  if (LINK_PATTERNS.some((re) => re.test(trimmed))) {
    return { ok: false, error: "Links aren't allowed in kindness stories." };
  }

  return { ok: true };
}

/**
 * Extremely simple in-memory rate limiter, keyed by IP.
 *
 * Two separate budgets, because they guard different things:
 *  - successful posts, so one person can't flood the map;
 *  - total attempts, so nobody can hammer the endpoint probing validation.
 *
 * Only a pin that actually gets saved counts against the posting budget —
 * five rejected drafts in a row (a typo, a stray link) must not lock
 * someone out for an hour.
 *
 * NOTE: this resets whenever the server process restarts and does not
 * share state across multiple server instances — a basic deterrent, not a
 * robust rate limiter. For production scale, replace with a shared store
 * (e.g. Upstash Redis); flagged as a good first issue in CONTRIBUTING.md.
 */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_WINDOW = 5;
const MAX_ATTEMPTS_PER_WINDOW = 40;
/** Above this many tracked IPs, sweep the map so it can't grow forever. */
const SWEEP_THRESHOLD = 5_000;

interface IpRecord {
  submissions: number[];
  attempts: number[];
}

const ipLog = new Map<string, IpRecord>();

function fresh(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
}

function sweepExpired(now: number): void {
  for (const [ip, record] of ipLog) {
    record.submissions = fresh(record.submissions, now);
    record.attempts = fresh(record.attempts, now);
    if (record.submissions.length === 0 && record.attempts.length === 0) {
      ipLog.delete(ip);
    }
  }
}

function recordFor(ip: string, now: number): IpRecord {
  const existing = ipLog.get(ip);
  if (!existing) {
    const created: IpRecord = { submissions: [], attempts: [] };
    ipLog.set(ip, created);
    return created;
  }
  existing.submissions = fresh(existing.submissions, now);
  existing.attempts = fresh(existing.attempts, now);
  return existing;
}

/**
 * Call before doing any work for a request. Records the attempt, but does
 * NOT spend the posting budget — that only happens on a saved pin.
 */
export function checkRateLimit(ip: string): ValidationResult {
  const now = Date.now();
  if (ipLog.size > SWEEP_THRESHOLD) sweepExpired(now);

  const record = recordFor(ip, now);

  if (record.attempts.length >= MAX_ATTEMPTS_PER_WINDOW) {
    return { ok: false, error: "Too many requests from here. Please try again later." };
  }
  if (record.submissions.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    return {
      ok: false,
      error: "You've added several pins in the last hour — please come back a bit later.",
    };
  }

  record.attempts.push(now);
  return { ok: true };
}

/** Call once a pin has actually been saved. */
export function recordSubmission(ip: string): void {
  const now = Date.now();
  recordFor(ip, now).submissions.push(now);
}

/** Test/dev helper — clears rate-limit state. */
export function resetRateLimit(): void {
  ipLog.clear();
}

/**
 * The second moderation pass: context-aware screening, run only after the
 * cheap synchronous checks in validateNewPin have already rejected the
 * obvious cases (so we never spend a network call on a 4-character
 * message or a pin full of links).
 *
 * Returns ok when screening is switched off or unreachable — the local
 * word-list filter has already run and is the floor. An outage at OpenAI
 * should degrade moderation quality, not stop people posting kindness.
 */
export async function screenNewPin(message: string): Promise<ValidationResult> {
  const provider = moderationProvider();
  if (!provider) return { ok: true };

  const outcome =
    provider === "gemini"
      ? await screenWithGemini(message.trim())
      : await screenWithOpenAI(message.trim());

  if (outcome.action === "allow") return { ok: true };

  console.warn(
    `[moderation] rejected a submission (${outcome.action}): ${outcome.categories.join(", ")}`
  );
  return { ok: false, error: outcome.reason };
}
