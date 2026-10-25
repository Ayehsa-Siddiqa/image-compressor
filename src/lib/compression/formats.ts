/** Every image format the compressor accepts, and the formats it can save. */

export type InputFormat = "jpeg" | "png" | "webp" | "avif" | "gif" | "bmp" | "tiff" | "heic" | "svg" | "ico";
export type OutputFormat = "jpeg" | "png" | "webp" | "avif" | "svg";
/** "auto" keeps the original format when it can be saved, otherwise picks JPG (opaque) or PNG (transparent). */
export type OutputChoice = "auto" | Exclude<OutputFormat, "svg">;

export const INPUT_FORMATS: Record<InputFormat, { label: string; mimes: string[]; extensions: string[] }> = {
  jpeg: { label: "JPG", mimes: ["image/jpeg", "image/pjpeg"], extensions: [".jpg", ".jpeg", ".jfif", ".pjpeg"] },
  png: { label: "PNG", mimes: ["image/png", "image/apng"], extensions: [".png"] },
  webp: { label: "WebP", mimes: ["image/webp"], extensions: [".webp"] },
  avif: { label: "AVIF", mimes: ["image/avif"], extensions: [".avif"] },
  gif: { label: "GIF", mimes: ["image/gif"], extensions: [".gif"] },
  bmp: { label: "BMP", mimes: ["image/bmp", "image/x-ms-bmp"], extensions: [".bmp", ".dib"] },
  tiff: { label: "TIFF", mimes: ["image/tiff"], extensions: [".tif", ".tiff"] },
  heic: { label: "HEIC", mimes: ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"], extensions: [".heic", ".heif"] },
  svg: { label: "SVG", mimes: ["image/svg+xml"], extensions: [".svg"] },
  ico: { label: "ICO", mimes: ["image/x-icon", "image/vnd.microsoft.icon"], extensions: [".ico"] },
};

export const OUTPUT_FORMATS: Record<OutputFormat, { label: string; mime: string; extension: string }> = {
  jpeg: { label: "JPG", mime: "image/jpeg", extension: "jpg" },
  png: { label: "PNG", mime: "image/png", extension: "png" },
  webp: { label: "WebP", mime: "image/webp", extension: "webp" },
  avif: { label: "AVIF", mime: "image/avif", extension: "avif" },
  svg: { label: "SVG", mime: "image/svg+xml", extension: "svg" },
};

export const OUTPUT_CHOICES: { value: OutputChoice; label: string; hint: string }[] = [
  { value: "auto", label: "Original", hint: "Keep each image's format" },
  { value: "jpeg", label: "JPG", hint: "Best compatibility for photos" },
  { value: "png", label: "PNG", hint: "Keeps transparency" },
  { value: "webp", label: "WebP", hint: "Smaller than JPG and PNG" },
  { value: "avif", label: "AVIF", hint: "Smallest files, slower to process" },
];

/** Formats the compressor can save in their own format. Others are converted (see resolveOutput). */
const SAVEABLE: Partial<Record<InputFormat, OutputFormat>> = { jpeg: "jpeg", png: "png", webp: "webp", avif: "avif", svg: "svg" };

export function resolveOutput(input: InputFormat, choice: OutputChoice, hasAlpha: boolean): OutputFormat {
  if (input === "svg") return "svg"; // vector files are optimised, never rasterised
  if (choice !== "auto") return choice;
  return SAVEABLE[input] ?? (hasAlpha ? "png" : "jpeg");
}

export const ACCEPT_ATTRIBUTE = Object.values(INPUT_FORMATS)
  .flatMap(({ mimes, extensions }) => [...mimes, ...extensions])
  .join(",");

export const SUPPORTED_LABEL = "JPG, PNG, WebP, AVIF, GIF, HEIC, TIFF, BMP, SVG and ICO";

/**
 * Identifies the format from the file's first bytes (falling back to its type and extension),
 * so renamed or mislabelled files are handled correctly and non-images are rejected early.
 */
export async function detectFormat(file: File): Promise<InputFormat | null> {
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const ascii = (start: number, length: number) => String.fromCharCode(...head.subarray(start, start + length));
  const starts = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);

  if (starts(0xff, 0xd8, 0xff)) return "jpeg";
  if (starts(0x89, 0x50, 0x4e, 0x47)) return "png";
  if (ascii(0, 4) === "GIF8") return "gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "webp";
  if (starts(0x49, 0x49, 0x2a, 0x00) || starts(0x4d, 0x4d, 0x00, 0x2a)) return "tiff";
  if (starts(0x00, 0x00, 0x01, 0x00)) return "ico";
  if (ascii(0, 2) === "BM") return "bmp";
  if (ascii(4, 4) === "ftyp") {
    const boxSize = Math.min((head[0] << 24) | (head[1] << 16) | (head[2] << 8) | head[3], head.length);
    const brands = Array.from({ length: Math.max(0, (boxSize - 8) / 4) }, (_, i) => ascii(8 + i * 4, 4));
    if (brands.some((b) => b === "avif" || b === "avis")) return "avif";
    if (brands.some((b) => ["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"].includes(b))) return "heic";
  }
  const text = new TextDecoder().decode(head).replace(/^﻿/, "").trimStart();
  if (text.startsWith("<") && /<svg[\s>]/i.test(text)) return "svg";

  return null;
}

/** Counts frames in a GIF so animated GIFs can be identified (block structure per the GIF89a spec). */
export function gifFrameCount(bytes: Uint8Array): number {
  let pos = 13;
  if (bytes[10] & 0x80) pos += 3 * (1 << ((bytes[10] & 0x07) + 1)); // global colour table
  let frames = 0;
  const skipSubBlocks = () => {
    while (pos < bytes.length && bytes[pos] !== 0) pos += bytes[pos] + 1;
    pos++;
  };
  while (pos < bytes.length) {
    const block = bytes[pos++];
    if (block === 0x3b) break; // trailer
    if (block === 0x21) {
      pos++; // extension label
      skipSubBlocks();
    } else if (block === 0x2c) {
      frames++;
      if (frames > 1) break;
      const packed = bytes[pos + 8];
      pos += 9;
      if (packed & 0x80) pos += 3 * (1 << ((packed & 0x07) + 1)); // local colour table
      pos++; // LZW minimum code size
      skipSubBlocks();
    } else {
      break;
    }
  }
  return frames;
}
