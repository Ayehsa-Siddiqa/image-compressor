import { CompressError, type CompressJob, type EncodedImage, type WorkerResponse } from "./types";

type Task = { job: CompressJob; resolve: (value: EncodedImage) => void; reject: (reason: CompressError) => void };

let supported: boolean | undefined;
let poolSize: number | undefined;
const idle: Worker[] = [];
const busy = new Map<Worker, Task>();
const waiting: Task[] = [];
// Without workers, jobs run one at a time on the main thread so the page stays usable.
let fallbackQueue: Promise<unknown> = Promise.resolve();
let nextId = 0;

/** Compresses one image off the main thread when the browser allows it, otherwise on the main thread. */
export function compressImage(job: Omit<CompressJob, "id">): Promise<EncodedImage> {
  const full = { ...job, id: String(++nextId) };
  if (!workersSupported()) return runOnMainThread(full);
  return new Promise<EncodedImage>((resolve, reject) => {
    waiting.push({ job: full, resolve, reject });
    pump();
  });
}

/** How many images can usefully be compressed at the same time. */
export function compressionConcurrency(): number {
  return workersSupported() ? getPoolSize() : 1;
}

function runOnMainThread(job: CompressJob): Promise<EncodedImage> {
  const run = async () => (await import("./encode")).encodeImage(job);
  const result = fallbackQueue.then(run, run);
  fallbackQueue = result.catch(() => undefined);
  return result;
}

function workersSupported(): boolean {
  return (supported ??=
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    "convertToBlob" in OffscreenCanvas.prototype);
}

/** One worker per spare core, capped by device memory since each worker holds a full-size bitmap. */
function getPoolSize(): number {
  if (poolSize !== undefined) return poolSize;
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const memoryCap = memory <= 2 ? 1 : memory <= 4 ? 2 : 4;
  return (poolSize = Math.max(1, Math.min(cores - 1, memoryCap)));
}

function pump() {
  while (waiting.length > 0) {
    const worker = idle.pop() ?? (busy.size < getPoolSize() ? spawn() : null);
    if (!worker) {
      // No worker could be started at all: finish the queue on the main thread.
      if (busy.size === 0) {
        supported = false;
        for (const task of waiting.splice(0)) runOnMainThread(task.job).then(task.resolve, task.reject);
      }
      return;
    }
    const task = waiting.shift()!;
    busy.set(worker, task);
    worker.postMessage(task.job);
  }
}

function spawn(): Worker | null {
  let worker: Worker;
  try {
    worker = new Worker(new URL("./compress.worker.ts", import.meta.url), { type: "module" });
  } catch {
    return null;
  }

  worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
    const task = busy.get(worker);
    busy.delete(worker);
    // Keep the worker (and its loaded codecs) unless the pool has shrunk.
    if (busy.size + idle.length < getPoolSize()) idle.push(worker);
    else worker.terminate();
    if (task) {
      if (data.ok) {
        const { blob, width, height, format, originalPreview, notes } = data;
        task.resolve({ blob, width, height, format, originalPreview, notes });
      } else {
        task.reject(new CompressError(data.error, data.code));
      }
    }
    pump();
  };

  // A worker crash (usually out of memory) fails its in-flight job. Drop to one worker from then on so
  // big images get the memory to themselves; a fresh worker is created for the next job.
  worker.onerror = (event) => {
    event.preventDefault();
    worker.terminate();
    const task = busy.get(worker);
    busy.delete(worker);
    poolSize = 1;
    for (const spare of idle.splice(0)) spare.terminate();
    task?.reject(new CompressError("Your browser ran out of memory while processing this image.", "memory"));
    pump();
  };

  return worker;
}
