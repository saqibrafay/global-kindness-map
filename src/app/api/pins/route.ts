import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  validateNewPin,
  screenNewPin,
  checkRateLimit,
  recordSubmission,
} from "@/lib/moderation";
import { createPin, listPins, pinExists } from "@/lib/pins/store";
import type { NewKindnessPin } from "@/types/pin";

// Always read through to the store — the map is the point of this site.
export const dynamic = "force-dynamic";

export async function GET() {
  const pins = await listPins();
  return NextResponse.json({ pins });
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
    chain_parent_id: body.chain_parent_id,
  });

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Context-aware screening, after the cheap checks have thinned the field.
  const screening = await screenNewPin(body.message as string);
  if (!screening.ok) {
    return NextResponse.json({ error: screening.error }, { status: 400 });
  }

  // A chain has to point at a story that actually exists, or the link is
  // dead the moment it is written.
  const chainParentId = body.chain_parent_id || null;
  if (chainParentId && !(await pinExists(chainParentId))) {
    return NextResponse.json(
      { error: "The story you're chaining from no longer exists." },
      { status: 400 }
    );
  }

  const result = await createPin({
    latitude: body.latitude as number,
    longitude: body.longitude as number,
    location_label: body.location_label,
    category: body.category as NewKindnessPin["category"],
    message: body.message as string,
    chain_parent_id: chainParentId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  // Only a pin that actually landed spends the posting budget.
  recordSubmission(ip);

  // The home page caches its pin list — drop it so the new pin shows up
  // immediately rather than after the revalidate window.
  revalidatePath("/");

  return NextResponse.json({ pin: result.pin }, { status: 201 });
}
