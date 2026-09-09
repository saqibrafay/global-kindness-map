import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildDemoPins } from "./demo-data";
import { countryCodeForCoords } from "@/lib/geo/reverse-geocode";
import type { KindnessPin, NewKindnessPin } from "@/types/pin";

export const MAX_PINS_RETURNED = 1000;

/**
 * The single place the rest of the app reads and writes kindness pins.
 *
 * When Supabase credentials are present it talks to Supabase. When they
 * are missing (a fresh `git clone`, or the placeholder values from
 * `.env.example`) it falls back to an in-process demo store so every
 * screen is still explorable and testable. `isDemoMode()` lets the UI say
 * so out loud rather than passing sample data off as real submissions.
 */

const PLACEHOLDER_MARKERS = ["your-", "YOUR-", "changeme", "example.supabase.co"];

function looksConfigured(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  return !PLACEHOLDER_MARKERS.some((marker) => trimmed.includes(marker));
}

export function isDemoMode(): boolean {
  return !(
    looksConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    looksConfigured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/** Whether writes can actually be persisted to Supabase. */
function canWriteToSupabase(): boolean {
  return !isDemoMode() && looksConfigured(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// --- Demo store -----------------------------------------------------------
// Pins added during a dev session stick around until the server restarts.
// Newest first, matching the Supabase query order.
//
// It hangs off globalThis rather than a module-level `let` because Next
// loads this module more than once per process (route handlers and server
// components are separate bundles). With plain module scope, a pin created
// through /api/pins was invisible to the page that rendered it — the
// submission redirected straight to a "story not found".

const DEMO_STORE_KEY = Symbol.for("global-kindness-map.demo-pins");

type GlobalWithDemoStore = typeof globalThis & {
  [DEMO_STORE_KEY]?: KindnessPin[];
};

function getDemoPins(): KindnessPin[] {
  const globalRef = globalThis as GlobalWithDemoStore;
  if (!globalRef[DEMO_STORE_KEY]) {
    globalRef[DEMO_STORE_KEY] = buildDemoPins();
  }
  return globalRef[DEMO_STORE_KEY];
}

function createDemoId(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// --- Public API -----------------------------------------------------------

export async function listPins(): Promise<KindnessPin[]> {
  if (isDemoMode()) {
    return getDemoPins().slice(0, MAX_PINS_RETURNED);
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("kindness_pins")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(MAX_PINS_RETURNED);

    if (error) {
      console.error("[pins] failed to list pins:", error.message);
      return [];
    }
    return (data ?? []) as KindnessPin[];
  } catch (err) {
    // Network/config failure — an empty map beats a crashed page.
    console.error("[pins] listPins threw:", err);
    return [];
  }
}

export async function getPin(id: string): Promise<KindnessPin | null> {
  if (!id) return null;

  if (isDemoMode()) {
    return getDemoPins().find((pin) => pin.id === id) ?? null;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("kindness_pins")
      .select("*")
      .eq("id", id)
      .eq("approved", true)
      .maybeSingle();

    if (error || !data) return null;
    return data as KindnessPin;
  } catch (err) {
    console.error("[pins] getPin threw:", err);
    return null;
  }
}

export type CreatePinResult =
  | { ok: true; pin: KindnessPin }
  | { ok: false; error: string; status: number };

export async function createPin(input: NewKindnessPin): Promise<CreatePinResult> {
  // Best-effort; resolves to null rather than failing the submission.
  const countryCode =
    input.country_code ?? (await countryCodeForCoords(input.latitude, input.longitude));

  const row = {
    latitude: input.latitude,
    longitude: input.longitude,
    location_label: input.location_label?.trim() || null,
    category: input.category,
    message: input.message.trim(),
    country_code: countryCode,
    chain_parent_id: input.chain_parent_id || null,
    approved: true,
  };

  if (!canWriteToSupabase()) {
    // Demo mode: keep the pin in memory so the whole submission flow —
    // including the story page it redirects to — actually works.
    const pin: KindnessPin = {
      id: createDemoId(),
      created_at: new Date().toISOString(),
      ...row,
    };
    getDemoPins().unshift(pin);
    return { ok: true, pin };
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("kindness_pins")
      .insert(row)
      .select()
      .single();

    if (error || !data) {
      console.error("[pins] failed to insert pin:", error?.message);
      return {
        ok: false,
        error: "Failed to save your kindness pin. Please try again.",
        status: 500,
      };
    }
    return { ok: true, pin: data as KindnessPin };
  } catch (err) {
    console.error("[pins] createPin threw:", err);
    return {
      ok: false,
      error: "Failed to save your kindness pin. Please try again.",
      status: 500,
    };
  }
}

/** True when `id` refers to a pin that exists — used to validate chains. */
export async function pinExists(id: string): Promise<boolean> {
  return (await getPin(id)) !== null;
}
