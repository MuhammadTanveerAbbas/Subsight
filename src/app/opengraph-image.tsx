import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
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
          backgroundColor: "#ffffff",
          gap: 24,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt="" width={112} height={112} style={{ objectFit: "contain" }} />
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#0A0A0A",
            letterSpacing: -3,
            lineHeight: 1.1,
          }}
        >
          Subsight
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#555555",
            textAlign: "center",
          }}
        >
          Track every subscription and personal expense together
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#22c55e",
            color: "#0A0A0A",
            fontSize: 28,
            fontWeight: 600,
            borderRadius: 9999,
            paddingLeft: 40,
            paddingRight: 40,
            paddingTop: 16,
            paddingBottom: 16,
            marginTop: 8,
          }}
        >
          Start tracking free
        </div>
      </div>
    ),
    size,
  );
}
