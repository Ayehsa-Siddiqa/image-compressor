import type { InputFormat, OutputChoice, OutputFormat } from "./formats";

/** Clockwise rotation applied to the pixels before encoding. */
export type Rotation = 0 | 90 | 180 | 270;

export interface CompressJob {
  id: string;
  file: Blob;
  format: InputFormat;
  /** 1–100. For PNG this controls palette size; 100 means lossless everywhere. */
  quality: number;
  output: OutputChoice;
  rotation?: Rotation;
  /** Skip work only needed for the final result (size estimates don't need a preview). */
  estimateOnly?: boolean;
}

export interface EncodedImage {
  blob: Blob;
  width: number;
  height: number;
  format: OutputFormat;
  /** Full-size preview of the original, for formats the browser can't show in <img> (HEIC, TIFF). */
  originalPreview?: Blob;
  /** Things the user should know about this result, e.g. transparency filled for JPG. */
  notes: string[];
}

/** A compression job, or a request to load codecs ahead of time (which gets no response). */
export type WorkerRequest = CompressJob | { warm: OutputFormat[] };

export type WorkerResponse =
  | ({ id: string; ok: true } & EncodedImage)
  | { id: string; ok: false; error: string; code: CompressErrorCode };

export type CompressErrorCode = "decode" | "too-large" | "unsupported-encoder" | "animated" | "memory" | "unknown";

export class CompressError extends Error {
  constructor(
    message: string,
    readonly code: CompressErrorCode,
  ) {
    super(message);
    this.name = "CompressError";
  }
}
