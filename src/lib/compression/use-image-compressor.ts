"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { compressImage, compressionConcurrency } from "./client";
import { SUPPORTED_LABEL, detectFormat, type InputFormat, type OutputChoice, type OutputFormat } from "./formats";
import { DEFAULT_QUALITY, MAX_FILE_BYTES, MAX_FILES } from "./limits";
import { CompressError } from "./types";
import { formatBytes } from "../format";

export type ItemStatus = "pending" | "processing" | "done" | "error";

/** Settings every image is compressed with. */
export interface Settings {
  quality: number;
  output: OutputChoice;
}

export interface CompressedOutput {
  /** What the user downloads: the compressed file, or the original when compression didn't make it smaller. */
  blob: Blob;
  url: string;
  size: number;
  /** Size the encoder actually produced (may be larger than the original). */
  encodedSize: number;
  reduced: boolean;
  /** Saved in a different format from the original (e.g. HEIC → JPG). Conversions are always kept. */
  converted: boolean;
  format: OutputFormat;
  settings: Settings;
  notes: string[];
}

export interface ImageItem {
  id: string;
  file: File;
  format: InputFormat;
  previewUrl: string;
  /** Converted preview for originals the browser can't display (HEIC, TIFF). */
  originalPreviewUrl?: string;
  width?: number;
  height?: number;
  status: ItemStatus;
  output?: CompressedOutput;
  error?: string;
}

interface State {
  items: ImageItem[];
  selectedId: string | null;
  /** Settings new and re-compressed images are encoded with. */
  settings: Settings;
  /** Set once the user presses Compress; later additions are then compressed automatically. */
  started: boolean;
  finished: boolean;
  notices: string[];
  /** Timing of the current or most recent compression run (Date.now() values). */
  run: { startedAt: number; endedAt?: number; completed: number } | null;
}

type Action =
  | { type: "add"; items: ImageItem[]; notices: string[] }
  | { type: "replace"; id: string; item: ImageItem }
  | { type: "remove"; id: string; at: number }
  | { type: "clear" }
  | { type: "select"; id: string }
  | { type: "start" }
  | { type: "apply-settings"; settings: Settings }
  | { type: "processing"; id: string; at: number }
  | { type: "done"; id: string; at: number; output: CompressedOutput; width: number; height: number; originalPreviewUrl?: string }
  | { type: "error"; id: string; at: number; message: string }
  | { type: "dimensions"; id: string; width: number; height: number }
  | { type: "finish" }
  | { type: "dismiss-notices" };

const initialState: State = {
  items: [],
  selectedId: null,
  settings: { quality: DEFAULT_QUALITY, output: "auto" },
  started: false,
  finished: false,
  notices: [],
  run: null,
};

function update(items: ImageItem[], id: string, patch: (item: ImageItem) => ImageItem) {
  return items.map((item) => (item.id === id ? patch(item) : item));
}

/** Counts one more image as finished in the current run. */
function countCompleted(state: State): State {
  return state.run ? { ...state, run: { ...state.run, completed: state.run.completed + 1 } } : state;
}

/** Closes the run once nothing is compressing or waiting to be compressed. */
function endRunIfIdle(state: State, at: number): State {
  const busy = state.items.some((item) => item.status === "processing" || needsWork(item, state.settings));
  return busy || !state.run || state.run.endedAt ? state : { ...state, run: { ...state.run, endedAt: at } };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      return {
        ...state,
        items: [...state.items, ...action.items],
        selectedId: state.selectedId ?? action.items[0]?.id ?? null,
        notices: action.notices,
      };
    case "replace":
      return {
        ...state,
        items: state.items.map((item) => (item.id === action.id ? action.item : item)),
        selectedId: state.selectedId === action.id ? action.item.id : state.selectedId,
        notices: [],
      };
    case "remove": {
      const items = state.items.filter((item) => item.id !== action.id);
      if (items.length === 0) return { ...initialState, settings: state.settings };
      const selectedId = state.selectedId === action.id ? items[0].id : state.selectedId;
      // Removing the last image still being compressed ends the run.
      return endRunIfIdle({ ...state, items, selectedId }, action.at);
    }
    case "clear":
      return { ...initialState, settings: state.settings };
    case "select":
      return { ...state, selectedId: action.id };
    case "start":
      return { ...state, started: true, notices: [] };
    case "apply-settings":
      return { ...state, settings: action.settings, started: true };
    case "processing":
      return {
        ...state,
        items: update(state.items, action.id, (i) => ({ ...i, status: "processing", error: undefined })),
        run: state.run && !state.run.endedAt ? state.run : { startedAt: action.at, completed: 0 },
      };
    case "done":
      return endRunIfIdle(countCompleted({
        ...state,
        items: update(state.items, action.id, (i) => ({
          ...i,
          status: "done",
          output: action.output,
          width: action.width,
          height: action.height,
          originalPreviewUrl: action.originalPreviewUrl ?? i.originalPreviewUrl,
        })),
      }), action.at);
    case "error":
      return endRunIfIdle(countCompleted({
        ...state,
        items: update(state.items, action.id, (i) => ({ ...i, status: "error", error: action.message, output: undefined })),
      }), action.at);
    case "dimensions":
      return {
        ...state,
        items: update(state.items, action.id, (i) => (i.width ? i : { ...i, width: action.width, height: action.height })),
      };
    case "finish":
      return { ...state, finished: true };
    case "dismiss-notices":
      return { ...state, notices: [] };
  }
}

const sameSettings = (a: Settings, b: Settings) => a.quality === b.quality && a.output === b.output;

const needsWork = (item: ImageItem, settings: Settings) =>
  item.status === "pending" || (item.status === "done" && !!item.output && !sameSettings(item.output.settings, settings));

let nextItemId = 0;

function createItem(file: File, format: InputFormat): ImageItem {
  return { id: `img-${++nextItemId}`, file, format, previewUrl: URL.createObjectURL(file), status: "pending" };
}

async function validate(file: File): Promise<{ format: InputFormat } | { error: string }> {
  if (file.size === 0) return { error: `“${file.name}” is empty.` };
  if (file.size > MAX_FILE_BYTES) {
    return { error: `“${file.name}” is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_FILE_BYTES)} per image.` };
  }
  try {
    const format = await detectFormat(file);
    if (format) return { format };
  } catch {
    // unreadable file: reported below
  }
  return { error: `“${file.name}” isn't a supported image. Supported formats: ${SUPPORTED_LABEL}.` };
}

function revokeItem(item: ImageItem) {
  URL.revokeObjectURL(item.previewUrl);
  if (item.originalPreviewUrl) URL.revokeObjectURL(item.originalPreviewUrl);
  if (item.output) URL.revokeObjectURL(item.output.url);
}

export function useImageCompressor() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  const inFlight = useRef(new Set<string>());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Free every object URL when the compressor unmounts.
  useEffect(() => () => stateRef.current.items.forEach(revokeItem), []);

  // Process as many images at once as the device has workers for; re-runs whenever an image finishes or the queue changes.
  useEffect(() => {
    if (!state.started) return;
    const settings = state.settings;
    const room = compressionConcurrency() - inFlight.current.size;
    if (room <= 0) return;
    const ready = state.items.filter((item) => !inFlight.current.has(item.id) && needsWork(item, settings));
    for (const next of ready.slice(0, room)) {
      inFlight.current.add(next.id);
      dispatch({ type: "processing", id: next.id, at: Date.now() });

      compressImage({
        file: next.file,
        format: next.format,
        quality: settings.quality,
        output: settings.output,
        estimateOnly: !!next.originalPreviewUrl,
      })
        .then(({ blob, width, height, format, notes, originalPreview }) => {
          const current = stateRef.current.items.find((item) => item.id === next.id);
          if (!current) return; // removed or replaced meanwhile
          const converted = format !== next.format;
          const reduced = blob.size < next.file.size;
          // Same format and not smaller: hand back the original rather than a bigger file.
          const kept = reduced || converted ? blob : next.file;
          const output: CompressedOutput = {
            blob: kept,
            url: URL.createObjectURL(kept),
            size: kept.size,
            encodedSize: blob.size,
            reduced,
            converted,
            format,
            settings,
            notes,
          };
          if (current.output) URL.revokeObjectURL(current.output.url);
          const originalPreviewUrl =
            originalPreview && !current.originalPreviewUrl ? URL.createObjectURL(originalPreview) : undefined;
          dispatch({ type: "done", id: next.id, at: Date.now(), output, width, height, originalPreviewUrl });
        })
        .catch((error: unknown) => {
          const current = stateRef.current.items.find((item) => item.id === next.id);
          if (current?.output) URL.revokeObjectURL(current.output.url);
          const message = error instanceof CompressError ? error.message : "Something went wrong while compressing this image.";
          dispatch({ type: "error", id: next.id, at: Date.now(), message });
        })
        .finally(() => {
          inFlight.current.delete(next.id);
          setTick((t) => t + 1);
        });
    }
  }, [state.started, state.items, state.settings, tick]);

  const addFiles = useCallback(async (files: Iterable<File>) => {
    const notices: string[] = [];
    const items: ImageItem[] = [];
    const room = MAX_FILES - stateRef.current.items.length;
    let skipped = 0;

    const checked = await Promise.all(Array.from(files, async (file) => ({ file, result: await validate(file) })));
    for (const { file, result } of checked) {
      if ("error" in result) notices.push(result.error);
      else if (items.length >= room) skipped++;
      else items.push(createItem(file, result.format));
    }
    if (skipped > 0) {
      notices.push(`Up to ${MAX_FILES} images can be compressed at once, so ${skipped} ${skipped === 1 ? "file was" : "files were"} skipped.`);
    }
    dispatch({ type: "add", items, notices });
  }, []);

  const replaceFile = useCallback(async (id: string, file: File) => {
    const result = await validate(file);
    const current = stateRef.current.items.find((item) => item.id === id);
    if (!current) return;
    if ("error" in result) {
      dispatch({ type: "add", items: [], notices: [result.error] });
      return;
    }
    revokeItem(current);
    dispatch({ type: "replace", id, item: createItem(file, result.format) });
  }, []);

  const removeItem = useCallback((id: string) => {
    const current = stateRef.current.items.find((item) => item.id === id);
    if (current) revokeItem(current);
    dispatch({ type: "remove", id, at: Date.now() });
  }, []);

  const clear = useCallback(() => {
    stateRef.current.items.forEach(revokeItem);
    dispatch({ type: "clear" });
  }, []);

  const actions = useMemo(
    () => ({
      addFiles,
      replaceFile,
      removeItem,
      clear,
      select: (id: string) => dispatch({ type: "select", id }),
      start: () => dispatch({ type: "start" }),
      applySettings: (settings: Settings) => dispatch({ type: "apply-settings", settings }),
      setDimensions: (id: string, width: number, height: number) => dispatch({ type: "dimensions", id, width, height }),
      finish: () => dispatch({ type: "finish" }),
      dismissNotices: () => dispatch({ type: "dismiss-notices" }),
    }),
    [addFiles, replaceFile, removeItem, clear],
  );

  const summary = useMemo(() => {
    const done = state.items.filter((item) => item.status === "done" && item.output);
    const queued = state.items.filter((item) => needsWork(item, state.settings) || item.status === "processing");
    return {
      done,
      doneCount: done.length,
      errorCount: state.items.filter((item) => item.status === "error").length,
      remaining: queued.length,
      isProcessing: state.started && queued.length > 0,
      originalBytes: done.reduce((sum, item) => sum + item.file.size, 0),
      outputBytes: done.reduce((sum, item) => sum + (item.output?.size ?? 0), 0),
    };
  }, [state.items, state.settings, state.started]);

  const selected = state.items.find((item) => item.id === state.selectedId) ?? null;

  return { state, selected, summary, ...actions };
}

export type ImageCompressorApi = ReturnType<typeof useImageCompressor>;
