/// <reference lib="webworker" />
import { encodeImage } from "./encode";
import { CompressError, type WorkerRequest, type WorkerResponse } from "./types";

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async ({ data: job }: MessageEvent<WorkerRequest>) => {
  let response: WorkerResponse;
  try {
    const encoded = await encodeImage(job);
    response = { id: job.id, ok: true, ...encoded };
  } catch (error) {
    response =
      error instanceof CompressError
        ? { id: job.id, ok: false, error: error.message, code: error.code }
        : { id: job.id, ok: false, error: "Something went wrong while compressing this image.", code: "unknown" };
  }
  ctx.postMessage(response);
};
