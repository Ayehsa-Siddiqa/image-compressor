import { decodeRaster, canvasEncode } from "./decode";
import { OUTPUT_FORMATS, resolveOutput, type OutputFormat } from "./formats";
import { CompressError, type CompressJob, type EncodedImage } from "./types";

/**
 * Decodes an image and re-encodes it with high-efficiency codecs, entirely in the browser:
 * MozJPEG for JPG, libwebp for WebP, libavif for AVIF, palette reduction + oxipng for PNG and SVGO for SVG.
 * Codecs are WebAssembly modules loaded on first use; if one can't load, the browser's encoder is used.
 * Pixel dimensions never change.
 */
export async function encodeImage(job: CompressJob): Promise<EncodedImage> {
  if (job.format === "svg") return optimizeSvg(job.file);

  const { image, hasAlpha, preview } = await decodeRaster(job.file, job.format, !job.estimateOnly);
  // job.format isn't SVG here, so the output is always a raster format.
  const format = resolveOutput(job.format, job.output, hasAlpha) as Exclude<OutputFormat, "svg">;
  const notes: string[] = [];

  if (format === "jpeg" && hasAlpha) {
    flattenOnWhite(image);
    notes.push("JPG doesn't support transparency, so transparent areas were filled with white. Choose PNG, WebP or AVIF to keep them.");
  }

  const bytes = await encodeRaster(format, image, job.quality);
  return {
    blob: bytes instanceof Blob ? bytes : new Blob([bytes], { type: OUTPUT_FORMATS[format].mime }),
    width: image.width,
    height: image.height,
    format,
    originalPreview: preview,
    notes,
  };
}

async function encodeRaster(format: Exclude<OutputFormat, "svg">, image: ImageData, quality: number) {
  switch (format) {
    case "jpeg":
      return encodeJpeg(image, quality);
    case "webp":
      return encodeWebp(image, quality);
    case "avif":
      return encodeAvif(image, quality);
    case "png":
      return encodePng(image, quality);
  }
}

const megapixels = (image: ImageData) => (image.width * image.height) / 1e6;

async function encodeJpeg(image: ImageData, quality: number): Promise<ArrayBuffer | Blob> {
  try {
    const { default: encode } = await import("@jsquash/jpeg/encode.js");
    const highQuality = quality >= 90;
    return await encode(image, {
      quality,
      progressive: true,
      optimize_coding: true,
      // Trellis quantisation finds smaller encodings at the same visual quality. The multipass variant is
      // several times slower for about 1% smaller files, so it stays off.
      trellis_multipass: false,
      trellis_opt_zero: true,
      trellis_opt_table: true,
      // Keep full colour resolution at high quality so red/blue edges and text stay crisp.
      auto_subsample: !highQuality,
      chroma_subsample: highQuality ? 1 : 2,
    });
  } catch (error) {
    if (error instanceof CompressError) throw error;
    return checkedCanvasEncode(image, "image/jpeg", quality);
  }
}

async function encodeWebp(image: ImageData, quality: number): Promise<ArrayBuffer | Blob> {
  try {
    const { default: encode } = await import("@jsquash/webp/encode.js");
    const lossless = quality >= 100;
    return await encode(image, {
      quality: lossless ? 75 : quality,
      lossless: lossless ? 1 : 0,
      // Method 6 compresses only a few percent better than 4 but takes 2–3× longer; small images can afford 5.
      method: megapixels(image) > 1 ? 4 : 5,
      use_sharp_yuv: 1,
      alpha_quality: lossless ? 100 : Math.max(quality, 85),
      exact: 0,
    });
  } catch (error) {
    if (error instanceof CompressError) throw error;
    return checkedCanvasEncode(image, "image/webp", quality);
  }
}

async function encodeAvif(image: ImageData, quality: number): Promise<ArrayBuffer> {
  try {
    const { encodeAvif: encode } = await import("./single-thread");
    const lossless = quality >= 100;
    const result = await encode(image, {
      // libavif's scale is stricter than JPG's: our 80 maps to 60, which looks visually lossless for most photos.
      quality: lossless ? 100 : Math.max(1, Math.round(quality * 0.75)),
      lossless,
      // The encoder is single-threaded here, so lean towards speed; larger images go faster still.
      speed: megapixels(image) > 2 ? 9 : 8,
      enableSharpYUV: !lossless,
    });
    if (!result) throw new Error("empty");
    return result;
  } catch {
    throw new CompressError("This browser couldn't run the AVIF encoder. Try WebP for similarly small files.", "unsupported-encoder");
  }
}

async function encodePng(image: ImageData, quality: number): Promise<ArrayBuffer> {
  const { default: UPNG } = await import("upng-js");
  // Below 100, reduce to an optimal palette (keeps transparency); at 100 the PNG stays lossless.
  const colors = quality >= 100 ? 0 : pngPaletteSize(quality);
  const png = UPNG.encode([image.data.buffer as ArrayBuffer], image.width, image.height, colors);
  try {
    const { optimisePng: optimise } = await import("./single-thread");
    // Lossless pass: finds the best PNG filters and deflate settings without changing a pixel.
    return await optimise(png, { level: megapixels(image) > 4 ? 1 : 2, interlace: false, optimiseAlpha: true });
  } catch {
    return png;
  }
}

/** Maps quality 1–99 onto 4–256 colours, keeping more colours at the high end where the eye notices banding. */
export function pngPaletteSize(quality: number): number {
  return Math.max(4, Math.round(256 * Math.pow(quality / 100, 1.5)));
}

async function checkedCanvasEncode(image: ImageData, mime: string, quality: number): Promise<Blob> {
  const blob = await canvasEncode(image, mime, Math.min(1, Math.max(0.01, quality / 100)));
  // Browsers that can't encode a format silently fall back to PNG; don't pass that off as the requested format.
  if (blob.type !== mime) {
    throw new CompressError(`Your browser can't save ${mime.split("/")[1].toUpperCase()} images. Try Chrome, Edge or Firefox.`, "unsupported-encoder");
  }
  return blob;
}

function flattenOnWhite({ data }: ImageData) {
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    if (a === 1) continue;
    data[i] = Math.round(data[i] * a + 255 * (1 - a));
    data[i + 1] = Math.round(data[i + 1] * a + 255 * (1 - a));
    data[i + 2] = Math.round(data[i + 2] * a + 255 * (1 - a));
    data[i + 3] = 255;
  }
}

async function optimizeSvg(file: Blob): Promise<EncodedImage> {
  const source = await file.text();
  let optimized: string;
  try {
    const { optimize } = await import("svgo/browser");
    // preset-default keeps the viewBox, so the graphic scales exactly as before.
    optimized = optimize(source, { multipass: true }).data;
  } catch {
    throw new CompressError("This SVG couldn't be read. It may be damaged or not valid SVG.", "decode");
  }
  const { width, height } = svgSize(optimized);
  return { blob: new Blob([optimized], { type: "image/svg+xml" }), width, height, format: "svg", notes: [] };
}

function svgSize(svg: string): { width: number; height: number } {
  const tag = /<svg\b[^>]*>/i.exec(svg)?.[0] ?? "";
  const attr = (name: string) => new RegExp(`\\s${name}=["']?([\\d.]+)`, "i").exec(tag)?.[1];
  const viewBox = /viewBox=["']?\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(tag);
  const width = Number(attr("width") ?? viewBox?.[1] ?? 0);
  const height = Number(attr("height") ?? viewBox?.[2] ?? 0);
  return { width: Math.round(width), height: Math.round(height) };
}
