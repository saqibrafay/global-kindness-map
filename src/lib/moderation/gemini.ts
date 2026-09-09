import {
  CRISIS_MESSAGE,
  GENERIC_BLOCK_MESSAGE,
  type ScreenOutcome,
} from "./types";

/**
 * Content screening via the Gemini API (Google AI Studio).
 *
 * Gemini has no dedicated moderation endpoint, so this uses a flash model
 * as a structured classifier. That turns out to suit this site better than
 * fixed harm categories would: the policy can say out loud that stories
 * about grief, illness and accidents are the *point* here, rather than
 * relying on category thresholds that fire on any mention of distress.
 *
 * Free tier is generous (a classification per submitted pin is nothing),
 * and the model is pinned to a lite flash variant for latency.
 */

const ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-flash-lite-latest";
const TIMEOUT_MS = 6000;

const SYSTEM_INSTRUCTION = `You screen submissions to the Global Kindness Map, a public map where people anonymously record real acts of kindness they did, received, or witnessed.

Return "allow" unless the text clearly falls into a block category.

ALLOW (these are the point of the site — never block them):
- Stories mentioning grief, illness, crying, loneliness, poverty, or someone having a hard time
- Stories mentioning accidents, injury, crime or disaster where someone helped
- Blunt or unpolished writing, non-native English, minor typos

BLOCK:
- Hatred or dehumanisation of a group
- Threats or harassment aimed at a person or group
- Sexual content
- Gratuitous or graphic violence
- Instructions for illegal or harmful acts
- Advertising, promotion, or spam

CRISIS (special case):
- The author appears to be describing their OWN intent to harm themselves`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    decision: { type: "string", enum: ["allow", "block", "crisis"] },
    category: { type: "string" },
  },
  required: ["decision", "category"],
};

/**
 * Gemini's own safety filters are turned off for this call — deliberately.
 * We need the model to *classify* harmful text, not refuse to look at it,
 * and we need it not to reject a story about someone in distress before
 * our policy above ever gets a say. The classifier's verdict is the only
 * thing that decides the outcome.
 */
const SAFETY_SETTINGS = [
  "HARM_CATEGORY_HARASSMENT",
  "HARM_CATEGORY_HATE_SPEECH",
  "HARM_CATEGORY_SEXUALLY_EXPLICIT",
  "HARM_CATEGORY_DANGEROUS_CONTENT",
].map((category) => ({ category, threshold: "BLOCK_NONE" }));

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  promptFeedback?: { blockReason?: string };
  error?: { status?: string; message?: string };
}

export function isGeminiModerationEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function screenWithGemini(text: string): Promise<ScreenOutcome> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return { action: "allow" };

  const model = process.env.GEMINI_MODERATION_MODEL?.trim() || DEFAULT_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${ENDPOINT_BASE}/${model}:generateContent`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
        safetySettings: SAFETY_SETTINGS,
      }),
    });

    if (!res.ok) {
      console.error(
        `[moderation] Gemini returned ${res.status}; falling back to the local filter.`
      );
      return { action: "allow" };
    }

    return decideFromGemini((await res.json()) as GeminiResponse);
  } catch (err) {
    console.error("[moderation] Gemini screening failed:", err);
    return { action: "allow" };
  } finally {
    clearTimeout(timer);
  }
}

/** Pure decision logic, testable without a network call or a key. */
export function decideFromGemini(json: GeminiResponse): ScreenOutcome {
  // If Gemini refused the prompt outright despite BLOCK_NONE, the content
  // is extreme enough that refusing it here is the right answer.
  if (json.promptFeedback?.blockReason) {
    return {
      action: "block",
      reason: GENERIC_BLOCK_MESSAGE,
      categories: [`safety:${json.promptFeedback.blockReason}`],
    };
  }

  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return { action: "allow" };

  let parsed: { decision?: string; category?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    // A model that didn't return JSON tells us nothing — don't guess.
    console.error("[moderation] Gemini returned unparseable output.");
    return { action: "allow" };
  }

  const category = typeof parsed.category === "string" ? parsed.category : "unspecified";

  if (parsed.decision === "crisis") {
    return {
      action: "block-compassionately",
      reason: CRISIS_MESSAGE,
      categories: [category],
    };
  }
  if (parsed.decision === "block") {
    return { action: "block", reason: GENERIC_BLOCK_MESSAGE, categories: [category] };
  }
  return { action: "allow" };
}
