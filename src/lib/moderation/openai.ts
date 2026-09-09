/**
 * Content screening via OpenAI's Moderation endpoint.
 *
 * The endpoint itself is free to call (it doesn't bill tokens), but it
 * still needs an OpenAI account and an API key — so it is entirely
 * optional here. With no key set, submissions fall back to the local
 * word-list filter and the app keeps working on a fresh `git clone`.
 *
 * Why bother, given the local filter: a blocklist matches strings, not
 * meaning. It misses a politely-worded threat and it trips over
 * "Scunthorpe". This reads context.
 */

import {
  CRISIS_MESSAGE,
  GENERIC_BLOCK_MESSAGE,
  type ScreenOutcome,
} from "./types";

const ENDPOINT = "https://api.openai.com/v1/moderations";
const DEFAULT_MODEL = "omni-moderation-latest";
const TIMEOUT_MS = 4000;

/** Shape of the subset of the response we rely on. */
interface ModerationResponse {
  results?: Array<{
    flagged?: boolean;
    categories?: Record<string, boolean>;
    category_scores?: Record<string, number>;
  }>;
}

/**
 * Categories that reject a submission outright.
 *
 * Deliberately NOT the full flagged set. Two of OpenAI's categories fire
 * on exactly the stories this site exists to collect:
 *
 *  - `self-harm` fires on *mentions* of distress. "I sat with someone who
 *    was crying on the train" is the archetypal kindness story here.
 *  - `violence` fires on incidental mentions. "Two people stopped to help
 *    after my car died on the motorway" is not violent content.
 *
 * So we block on the sharp, unambiguous categories and let the softer
 * ones through rather than filtering out genuine acts of care.
 */
const BLOCKING_CATEGORIES = [
  "sexual",
  "sexual/minors",
  "hate",
  "hate/threatening",
  "harassment/threatening",
  "violence/graphic",
  "illicit",
  "illicit/violent",
] as const;

/**
 * Handled separately: someone describing their own intent to self-harm.
 * Publishing that anonymously on a map helps nobody, and rejecting it with
 * a blank "that isn't allowed" is worse. It gets a kind message instead.
 */
const SELF_HARM_CATEGORIES = ["self-harm/intent", "self-harm/instructions"] as const;

export function isOpenAIModerationEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/**
 * Screen a message. Returns "allow" when screening is disabled or the call
 * fails — the local filter in moderation.ts has already run and acts as
 * the floor, and an OpenAI outage must not take submissions down with it.
 */
export async function screenWithOpenAI(text: string): Promise<ScreenOutcome> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return { action: "allow" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODERATION_MODEL?.trim() || DEFAULT_MODEL,
        input: text,
      }),
    });

    if (!res.ok) {
      console.error(
        `[moderation] OpenAI returned ${res.status}; falling back to the local filter.`
      );
      return { action: "allow" };
    }

    return decideFromResponse((await res.json()) as ModerationResponse);
  } catch (err) {
    // Timeout, network error, malformed JSON — fail open, but loudly.
    console.error("[moderation] OpenAI screening failed:", err);
    return { action: "allow" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Pure decision logic, split out so it can be tested without a network
 * call or an API key.
 */
export function decideFromResponse(json: ModerationResponse): ScreenOutcome {
  const result = json.results?.[0];
  if (!result) return { action: "allow" };

  const categories = result.categories ?? {};
  const hit = (name: string) => categories[name] === true;

  const selfHarmHits = SELF_HARM_CATEGORIES.filter(hit);
  if (selfHarmHits.length > 0) {
    return {
      action: "block-compassionately",
      reason: CRISIS_MESSAGE,
      categories: selfHarmHits,
    };
  }

  const blockingHits = BLOCKING_CATEGORIES.filter(hit);
  if (blockingHits.length > 0) {
    return {
      action: "block",
      reason: GENERIC_BLOCK_MESSAGE,
      categories: blockingHits,
    };
  }

  return { action: "allow" };
}
