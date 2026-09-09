import { NextRequest, NextResponse } from "next/server";
import { getPin } from "@/lib/pins/store";
import { isValidPinId } from "@/lib/moderation";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isValidPinId(id)) {
    return NextResponse.json({ error: "Kindness pin not found." }, { status: 404 });
  }

  const pin = await getPin(id);
  if (!pin) {
    return NextResponse.json({ error: "Kindness pin not found." }, { status: 404 });
  }

  return NextResponse.json({ pin });
}
