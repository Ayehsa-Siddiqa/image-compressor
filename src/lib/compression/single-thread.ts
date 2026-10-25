// Single-threaded AVIF and oxipng encoders, loaded without @jsquash's entry points.
// Those entry points also reference the multi-threaded builds, whose workers import themselves, and that makes
// `next build` (Turbopack) hang. The threaded builds need a cross-origin-isolated page, which we aren't, so
// @jsquash would fall back to these builds anyway.
import avifFactory from "@jsquash/avif/codec/enc/avif_enc.js";
import { defaultOptions as avifDefaults } from "@jsquash/avif/meta.js";
import { initEmscriptenModule } from "@jsquash/avif/utils.js";
import initOxipng, { optimise } from "@jsquash/oxipng/codec/pkg/squoosh_oxipng.js";

type AvifOptions = Partial<typeof avifDefaults>;

let avifModule: ReturnType<typeof initEmscriptenModule<Awaited<ReturnType<typeof avifFactory>>>> | undefined;
let oxipngReady: Promise<unknown> | undefined;

/** Same behaviour as `@jsquash/avif/encode` for 8-bit images. */
export async function encodeAvif(image: ImageData, options: AvifOptions): Promise<ArrayBuffer> {
  const opts = { ...avifDefaults, ...options };
  if (opts.lossless) Object.assign(opts, { quality: 100, qualityAlpha: -1, subsample: 3 });
  const encoder = await (avifModule ??= initEmscriptenModule(avifFactory));
  const output = encoder.encode(new Uint8Array(image.data.buffer), image.width, image.height, opts);
  if (!output) throw new Error("Encoding error.");
  return output.buffer as ArrayBuffer;
}

/** Same behaviour as `@jsquash/oxipng/optimise` for an encoded PNG. */
export async function optimisePng(
  png: ArrayBuffer,
  { level, interlace, optimiseAlpha }: { level: number; interlace: boolean; optimiseAlpha: boolean },
): Promise<ArrayBuffer> {
  await (oxipngReady ??= initOxipng());
  return optimise(new Uint8Array(png), level, interlace, optimiseAlpha).buffer as ArrayBuffer;
}
