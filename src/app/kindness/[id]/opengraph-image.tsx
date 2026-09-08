import { ImageResponse } from "next/og";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { CATEGORY_EMOJI, CATEGORY_LABELS, type KindnessPin } from "@/types/pin";

export const alt = "A kindness story from the Global Kindness Map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getPin(id: string): Promise<KindnessPin | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("kindness_pins")
      .select("*")
      .eq("id", id)
      .eq("approved", true)
      .single();
    return (data as KindnessPin) ?? null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pin = await getPin(id);

  const emoji = pin ? CATEGORY_EMOJI[pin.category] : "🌍";
  const categoryLabel = pin ? CATEGORY_LABELS[pin.category] : "Kindness";
  const message = pin?.message ?? "A story of kindness from around the world.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, color: "#92400e" }}>
          🌍 Global Kindness Map
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 48, color: "#78350f" }}>
            {emoji} {categoryLabel}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: "#1f2937",
              lineHeight: 1.3,
              maxHeight: 280,
              overflow: "hidden",
            }}
          >
            &ldquo;{message.slice(0, 220)}
            {message.length > 220 ? "…" : ""}&rdquo;
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#b45309" }}>
          Add your own act of kindness at this site →
        </div>
      </div>
    ),
    { ...size }
  );
}
