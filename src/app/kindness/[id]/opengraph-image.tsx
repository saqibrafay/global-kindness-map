import { ImageResponse } from "next/og";
import { getPin } from "@/lib/pins/store";
import { CATEGORY_COLORS, CATEGORY_EMOJI, CATEGORY_LABELS } from "@/types/pin";

export const alt = "A kindness story from the Global Kindness Map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pin = await getPin(id);

  const category = pin?.category ?? "other";
  const color = CATEGORY_COLORS[category];
  const emoji = pin ? CATEGORY_EMOJI[category] : "🌍";
  const categoryLabel = pin ? CATEGORY_LABELS[category] : "Kindness";
  const message = pin?.message ?? "A story of kindness from around the world.";
  const place = pin?.location_label ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#05090c",
          backgroundImage: `radial-gradient(1000px 600px at 8% -10%, ${color}2e, transparent), radial-gradient(800px 500px at 100% 110%, #7cc7ff1a, transparent)`,
          padding: 72,
          fontFamily: "sans-serif",
          color: "#f3eee4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 16,
              height: 16,
              borderRadius: 999,
              backgroundColor: color,
            }}
          />
          <div style={{ display: "flex", fontSize: 28, color: "#a7b5bf", letterSpacing: 4 }}>
            GLOBAL KINDNESS MAP
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: 30, color, letterSpacing: 3 }}>
            {emoji} {categoryLabel.toUpperCase()}
            {place ? ` · ${place.toUpperCase()}` : ""}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 46,
              lineHeight: 1.32,
              maxHeight: 300,
              overflow: "hidden",
            }}
          >
            &ldquo;{message.slice(0, 190)}
            {message.length > 190 ? "…" : ""}&rdquo;
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#6c7d89", letterSpacing: 2 }}>
          The world at night, lit by small acts — add yours
        </div>
      </div>
    ),
    { ...size }
  );
}
