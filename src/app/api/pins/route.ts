import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateNewPin, checkRateLimit } from "@/lib/moderation";
import type { KindnessPin, NewKindnessPin } from "@/types/pin";

// Cap how many pins we return in one go. Good first issue: real pagination.
const MAX_PINS_RETURNED = 1000;

export async function GET() {
  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server is not configured yet — see .env.example." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("kindness_pins")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(MAX_PINS_RETURNED);

  if (error) {
    console.error("Failed to fetch pins:", error);
    return NextResponse.json({ error: "Failed to load kindness pins." }, { status: 500 });
  }

  return NextResponse.json({ pins: (data ?? []) as KindnessPin[] });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.ok) {
    return NextResponse.json({ error: rateLimit.error }, { status: 429 });
  }

  let body: Partial<NewKindnessPin>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateNewPin({
    latitude: body.latitude,
    longitude: body.longitude,
    message: body.message,
    category: body.category,
    location_label: body.location_label,
  });

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdminClient();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server is not configured yet — see .env.example." },
      { status: 503 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("kindness_pins")
    .insert({
      latitude: body.latitude,
      longitude: body.longitude,
      location_label: body.location_label?.trim() || null,
      category: body.category,
      message: (body.message as string).trim(),
      chain_parent_id: body.chain_parent_id || null,
      approved: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert pin:", error);
    return NextResponse.json({ error: "Failed to save your kindness pin." }, { status: 500 });
  }

  return NextResponse.json({ pin: data as KindnessPin }, { status: 201 });
}
