import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Keep in step with shareImage in lib/seo.ts.
export const alt = "Toolve – free online image compressor for JPG, PNG, WebP, AVIF and HEIC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const formats = ["JPG", "PNG", "WebP", "AVIF", "HEIC"];

/**
 * The preview card shown when a link to the site is shared on Facebook, WhatsApp, LinkedIn, X, Instagram,
 * TikTok and YouTube. Blog posts use their own image instead.
 */
// Cached so the image is built once, at build time.
async function logoDataUrl() {
  "use cache";
  return `data:image/png;base64,${(await readFile(join(process.cwd(), "public/toolve-light.png"))).toString("base64")}`;
}

export default async function OpengraphImage() {
  const logo = await logoDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #e3ecfd 100%)",
          color: "#0f172a",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to an image, not a page */}
        <img src={logo} width={381} height={80} alt="" />
        <div style={{ marginTop: 56, fontSize: 72, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2 }}>Compress images without losing quality</div>
        <div style={{ marginTop: 24, fontSize: 32, color: "#475569" }}>Free, fast and private: your images never leave your browser.</div>
        <div style={{ marginTop: 44, display: "flex", gap: 14 }}>
          {formats.map((format) => (
            <div
              key={format}
              style={{ padding: "10px 24px", borderRadius: 999, background: "#2563eb", color: "#ffffff", fontSize: 26, fontWeight: 700 }}
            >
              {format}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
