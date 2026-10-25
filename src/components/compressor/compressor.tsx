"use client";

import { useCallback, useRef, useState } from "react";
import { AlertCircle, Download, LoaderCircle, Plus, Shrink, X } from "lucide-react";
import { ACCEPT_ATTRIBUTE, OUTPUT_FORMATS } from "@/lib/compression/formats";
import type { ImageCompressorApi } from "@/lib/compression/use-image-compressor";
import { downloadBlob, zipFiles } from "@/lib/download";
import { downloadName } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { AdvancedOptions } from "./advanced-options";
import { ComparisonSlider } from "./comparison-slider";
import { DropZone } from "./drop-zone";
import { ImageGrid } from "./image-grid";
import { SizeSummary } from "./size-summary";
import { useFileDrop } from "./use-file-drop";

export function Compressor({ api }: { api: ImageCompressorApi }) {
  const { state, selected, summary } = api;
  const addInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const { isDragging, dropProps } = useFileDrop(api.addFiles);

  const requestReplace = useCallback((id: string) => {
    replaceTarget.current = id;
    replaceInput.current?.click();
  }, []);

  async function downloadAll() {
    const files = summary.done.map((item) => ({
      name: downloadName(item.file.name, { ...item.output!, extension: OUTPUT_FORMATS[item.output!.format].extension }),
      blob: item.output!.blob,
    }));
    setZipError(null);
    if (files.length === 1) {
      downloadBlob(files[0].blob, files[0].name);
      api.finish();
      return;
    }
    setZipping(true);
    try {
      downloadBlob(await zipFiles(files), "squishly-compressed-images.zip");
      api.finish();
    } catch {
      setZipError("Couldn't create the ZIP file — your browser may be low on memory. Try downloading images one at a time.");
    } finally {
      setZipping(false);
    }
  }

  const errors = state.items.filter((item) => item.status === "error");
  const processed = summary.doneCount + summary.errorCount;
  const total = state.items.length;

  return (
    <div className="space-y-6">
      {state.items.length === 0 ? (
        <DropZone onFiles={api.addFiles} />
      ) : (
        <div {...dropProps} className="relative space-y-6">
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-2xl border-2 border-dashed border-primary bg-primary-soft/80 text-lg text-accent">
              Drop Images To Add Them
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <button type="button" className={buttonClass("primary")} onClick={() => addInput.current?.click()}>
              <Plus className="size-5" aria-hidden />
              Add More
            </button>
            <button type="button" className={buttonClass("danger")} onClick={api.clear}>
              <X className="size-5" aria-hidden />
              Clear
            </button>
          </div>

          <ImageGrid
            items={state.items}
            selectedId={state.selectedId}
            onSelect={api.select}
            onReplace={requestReplace}
            onRemove={api.removeItem}
            onDimensions={api.setDimensions}
          />

          <div className="flex flex-col items-center gap-3" aria-live="polite">
            {!state.started ? (
              <button type="button" className={buttonClass("primary")} onClick={api.start}>
                <Shrink className="size-5" aria-hidden />
                Compress
              </button>
            ) : summary.isProcessing ? (
              <>
                <button type="button" className={buttonClass("primary")} disabled>
                  <LoaderCircle className="size-5 animate-spin" aria-hidden />
                  Compressing {Math.min(processed + 1, total)} of {total}…
                </button>
                <div
                  className="h-1.5 w-56 overflow-hidden rounded-full bg-primary-soft"
                  role="progressbar"
                  aria-label="Compression progress"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={processed}
                >
                  <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${(processed / total) * 100}%` }} />
                </div>
              </>
            ) : summary.doneCount > 0 ? (
              <button type="button" className={buttonClass("primary")} onClick={downloadAll} disabled={zipping}>
                {zipping ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Download className="size-5" aria-hidden />}
                {zipping ? "Preparing ZIP…" : summary.doneCount === 1 ? "Download" : "Download All"}
              </button>
            ) : null}
            {zipError && <p className="text-sm text-danger" role="alert">{zipError}</p>}
          </div>

          {errors.length > 0 && (
            <div className="rounded-xl border border-[#f5c2c0] bg-[#fdf2f2] px-5 py-4 text-sm text-[#9b2c28] dark:border-[#5c2422] dark:bg-[#2a1314] dark:text-[#f3a9a5]" role="alert">
              <p className="flex items-center gap-2 font-bold">
                <AlertCircle className="size-4" aria-hidden />
                {errors.length === 1 ? "1 image couldn't be compressed" : `${errors.length} images couldn't be compressed`}
              </p>
              <ul className="mt-2 space-y-1">
                {errors.map((item) => (
                  <li key={item.id}>
                    <span className="font-bold">{item.file.name}:</span> {item.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selected?.output && selected.width && selected.height && (
            <div className="space-y-6">
              <SizeSummary item={selected} output={selected.output} />
              <ComparisonSlider
                originalUrl={selected.originalPreviewUrl ?? selected.previewUrl}
                compressedUrl={selected.output.url}
                width={selected.width}
                height={selected.height}
                name={selected.file.name}
              />
              <AdvancedOptions
                key={selected.id}
                item={selected}
                settings={state.settings}
                busy={summary.isProcessing}
                onApply={api.applySettings}
              />
            </div>
          )}
        </div>
      )}

      {state.notices.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-[#f3d9a4] bg-[#fffaf0] px-5 py-4 text-sm text-[#7a5300] dark:border-[#5a4214] dark:bg-[#271d0a] dark:text-[#f1cf8b]" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <ul className="flex-1 space-y-1">
            {state.notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
          <button type="button" onClick={api.dismissNotices} aria-label="Dismiss" className="rounded p-0.5 hover:bg-black/5">
            <X className="size-4" />
          </button>
        </div>
      )}

      <input
        ref={addInput}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label="Add more images"
        onChange={(event) => {
          if (event.target.files?.length) api.addFiles(Array.from(event.target.files));
          event.target.value = "";
        }}
      />
      <input
        ref={replaceInput}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        tabIndex={-1}
        aria-label="Replace image"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && replaceTarget.current) api.replaceFile(replaceTarget.current, file);
          replaceTarget.current = null;
          event.target.value = "";
        }}
      />
    </div>
  );
}
