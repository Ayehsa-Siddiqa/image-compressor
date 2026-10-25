import { gifFrameCount, type InputFormat } from "./formats";
import { MAX_PIXELS } from "./limits";
import { CompressError } from "./types";

export type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
type AnyContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

export interface DecodedImage {
  image: ImageData;
  hasAlpha: boolean;
  /** Displayable copy of the original, only for formats <img> can't show everywhere. */
  preview?: Blob;
}

/** Formats most browsers can't display in <img>, so the original gets a converted preview. */
const NEEDS_PREVIEW: InputFormat[] = ["heic", "tiff"];

export async function decodeRaster(file: Blob, format: InputFormat, withPreview: boolean): Promise<DecodedImage> {
  if (format === "gif" && gifFrameCount(new Uint8Array(await file.arrayBuffer())) > 1) {
    throw new CompressError(
      "This is an animated GIF. Compressing it here would keep only the first frame, so it was left unchanged.",
      "animated",
    );
  }

  const image = (await decodeNative(file)) ?? (await decodeFallback(file, format));
  const hasAlpha = detectAlpha(image);
  const preview = withPreview && NEEDS_PREVIEW.includes(format) ? await toPreview(image, hasAlpha) : undefined;
  return { image, hasAlpha, preview };
}

async function decodeNative(file: Blob): Promise<ImageData | null> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      bitmap = await createImageBitmap(file); // older engines reject the options bag
    } catch {
      return null;
    }
  }
  try {
    return bitmapToImageData(bitmap);
  } finally {
    bitmap.close();
  }
}

async function decodeFallback(file: Blob, format: InputFormat): Promise<ImageData> {
  try {
    if (format === "heic") {
      // Only Safari decodes HEIC natively; elsewhere use libheif (loaded only when a HEIC file is added).
      const { heicTo } = await import("heic-to/next");
      const bitmap = await heicTo({ blob: file, type: "bitmap", options: { imageOrientation: "from-image" } });
      try {
        return bitmapToImageData(bitmap);
      } finally {
        bitmap.close();
      }
    }
    if (format === "tiff") {
      const { default: UTIF } = await import("utif");
      const buffer = await file.arrayBuffer();
      const [ifd] = UTIF.decode(buffer);
      if (!ifd) throw new Error("no image");
      checkPixels(ifd.width, ifd.height);
      UTIF.decodeImage(buffer, ifd);
      return new ImageData(new Uint8ClampedArray(UTIF.toRGBA8(ifd)), ifd.width, ifd.height);
    }
  } catch (error) {
    if (error instanceof CompressError) throw error;
  }
  throw new CompressError(
    "This file couldn't be read as an image. It may be damaged, or its contents don't match its extension.",
    "decode",
  );
}

function bitmapToImageData(bitmap: ImageBitmap): ImageData {
  checkPixels(bitmap.width, bitmap.height);
  const canvas = createCanvas(bitmap.width, bitmap.height);
  try {
    const ctx = context(canvas);
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } finally {
    releaseCanvas(canvas);
  }
}

function checkPixels(width: number, height: number) {
  if (width * height > MAX_PIXELS) {
    throw new CompressError(
      `This image is ${width} × ${height} px, which is too large to process in the browser (limit ${Math.round(MAX_PIXELS / 1e6)} megapixels).`,
      "too-large",
    );
  }
}

function detectAlpha({ data }: ImageData): boolean {
  for (let i = 3; i < data.length; i += 4) if (data[i] !== 255) return true;
  return false;
}

async function toPreview(image: ImageData, hasAlpha: boolean): Promise<Blob | undefined> {
  try {
    return await canvasEncode(image, hasAlpha ? "image/png" : "image/jpeg", 0.92);
  } catch {
    return undefined; // the preview is a convenience; compression still works without it
  }
}

/* ---------- canvas helpers shared with the encoders ---------- */

export function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function context(canvas: AnyCanvas): AnyContext {
  const ctx = canvas.getContext("2d") as AnyContext | null;
  if (!ctx) throw outOfMemory();
  return ctx;
}

export function releaseCanvas(canvas: AnyCanvas) {
  // Free the backing store straight away instead of waiting for garbage collection.
  canvas.width = canvas.height = 0;
}

/** Encodes pixels with the browser's built-in encoder (used as a fallback and for previews). */
export async function canvasEncode(image: ImageData, mime: string, quality?: number): Promise<Blob> {
  const canvas = createCanvas(image.width, image.height);
  try {
    context(canvas).putImageData(image, 0, 0);
    const blob =
      "convertToBlob" in canvas
        ? await canvas.convertToBlob({ type: mime, quality })
        : await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
    if (!blob) throw outOfMemory();
    return blob;
  } finally {
    releaseCanvas(canvas);
  }
}

export function outOfMemory() {
  return new CompressError("Your browser ran out of memory while processing this image. Try a smaller image.", "memory");
}
