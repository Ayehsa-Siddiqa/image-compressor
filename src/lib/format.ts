const UNITS = ["B", "KB", "MB", "GB"];

/** 8_933_212 → "8.52 MB", 514_048 → "502 KB" (1 KB = 1024 B, matching what operating systems show). */
export function formatBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits).replace(/\.0+$/, "")} ${UNITS[unit]}`;
}

/** 800 → "0.8s", 12_400 → "12s", 65_000 → "1m 05s". */
export function formatDuration(ms: number): string {
  if (ms < 10_000) return `${(Math.max(0, ms) / 1000).toFixed(1)}s`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

/** Percentage saved, rounded down so "−100%" is never shown for a non-empty file. */
export function savedPercent(original: number, compressed: number): number {
  if (original <= 0 || compressed >= original) return 0;
  return Math.min(99, Math.floor(((original - compressed) / original) * 100));
}

/**
 * "holiday photo.JPG" → "holiday photo-compressed.JPG".
 * Pass `extension` when the format changed: ("IMG_1.HEIC", "jpg") → "IMG_1-compressed.jpg".
 */
export function compressedFileName(name: string, extension?: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = extension ? `.${extension}` : dot > 0 ? name.slice(dot) : "";
  return `${base}-compressed${ext}`;
}

/** File name to download a result under. */
export function downloadName(name: string, output: { reduced: boolean; converted: boolean; extension: string }): string {
  if (output.converted) return compressedFileName(name, output.extension);
  return output.reduced ? compressedFileName(name) : name;
}
