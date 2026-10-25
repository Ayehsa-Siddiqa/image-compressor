import { CompressError, type CompressJob, type EncodedImage, type WorkerResponse } from "./types";

type Pending = { resolve: (value: EncodedImage) => void; reject: (reason: CompressError) => void };

let worker: Worker | null | undefined;
const pending = new Map<string, Pending>();
// Jobs run one at a time so only one full-size bitmap is in memory at once.
let queue: Promise<unknown> = Promise.resolve();
let nextId = 0;

/** Compresses one image off the main thread when the browser allows it, otherwise on the main thread. */
export function compressImage(job: Omit<CompressJob, "id">): Promise<EncodedImage> {
  const run = () => runJob({ ...job, id: String(++nextId) });
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}

async function runJob(job: CompressJob): Promise<EncodedImage> {
  const w = getWorker();
  if (!w) {
    const { encodeImage } = await import("./encode");
    return encodeImage(job);
  }
  return new Promise<EncodedImage>((resolve, reject) => {
    pending.set(job.id, { resolve, reject });
    w.postMessage(job);
  });
}

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;

  const supported =
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    "convertToBlob" in OffscreenCanvas.prototype;
  if (!supported) return (worker = null);

  try {
    worker = new Worker(new URL("./compress.worker.ts", import.meta.url), { type: "module" });
  } catch {
    return (worker = null);
  }

  worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
    const job = pending.get(data.id);
    if (!job) return;
    pending.delete(data.id);
    if (data.ok) {
      const { blob, width, height, format, originalPreview, notes } = data;
      job.resolve({ blob, width, height, format, originalPreview, notes });
    } else {
      job.reject(new CompressError(data.error, data.code));
    }
  };

  // A worker crash (usually out of memory) fails the in-flight job; a fresh worker is created for the next one.
  worker.onerror = (event) => {
    event.preventDefault();
    worker?.terminate();
    worker = undefined;
    for (const job of pending.values()) {
      job.reject(new CompressError("Your browser ran out of memory while processing this image.", "memory"));
    }
    pending.clear();
  };

  return worker;
}
