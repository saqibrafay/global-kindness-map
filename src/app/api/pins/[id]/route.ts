import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { KindnessPin } from "@/types/pin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
    .eq("id", id)
    .eq("approved", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Kindness pin not found." }, { status: 404 });
  }

  return NextResponse.json({ pin: data as KindnessPin });
}
