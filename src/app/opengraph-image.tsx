import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1600, height: 900 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image() {
  const icon = await readFile(path.join(process.cwd(), "public/Subsight.png"));
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          gap: 32,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt="" width={200} height={200} style={{ objectFit: "contain" }} />
        <div style={{ display: "flex", fontSize: 88, fontWeight: 600, color: "#000000", letterSpacing: -3, textAlign: "center" }}>
          Subsight Tracker
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#555555", textAlign: "center" }}>
          Track every subscription and personal expense together
        </div>
      </div>
    ),
    size,
  );
}
