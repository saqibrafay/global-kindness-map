import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// iOS wants a PNG at a fixed size; this rasterises the same SVG the
// favicon uses, so there is only ever one logo file to change.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const svg = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8");
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#071018",
        }}
      >
        {/* Inset, because iOS rounds the corners and an edge-to-edge
            circle would get its limb clipped. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri} width={148} height={148} alt="" />
      </div>
    ),
    { ...size }
  );
}
