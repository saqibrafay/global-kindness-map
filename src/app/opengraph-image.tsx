import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Share card for the site itself. Individual stories have their own at
// src/app/kindness/[id]/opengraph-image.tsx.
export const alt = "Global Kindness Map — the world at night, lit by small acts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const svg = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8");
  const mark = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#05090c",
          backgroundImage:
            "radial-gradient(900px 600px at 78% 12%, #ffb3472e, transparent), radial-gradient(700px 500px at 5% 100%, #7cc7ff18, transparent)",
          padding: 88,
          fontFamily: "sans-serif",
          color: "#f3eee4",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mark} width={128} height={128} alt="" />

        <div style={{ display: "flex", marginTop: 44, fontSize: 74, lineHeight: 1.1 }}>
          The world at night,
        </div>
        <div style={{ display: "flex", fontSize: 74, lineHeight: 1.1, color: "#ffb347" }}>
          lit by small acts.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 26,
            letterSpacing: 4,
            color: "#6c7d89",
          }}
        >
          GLOBAL KINDNESS MAP · ADD YOURS
        </div>
      </div>
    ),
    { ...size }
  );
}
