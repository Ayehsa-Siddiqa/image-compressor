import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iPhone and iPad: the "o" from the Toolve logo. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1f63ef" }}>
        <div style={{ width: 112, height: 112, borderRadius: "50%", border: "12px solid #ffffff" }} />
      </div>
    ),
    size,
  );
}
