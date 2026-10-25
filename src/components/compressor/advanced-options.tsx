"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { compressImage } from "@/lib/compression/client";
import { OUTPUT_CHOICES, OUTPUT_FORMATS, resolveOutput, type OutputChoice, type OutputFormat } from "@/lib/compression/formats";
import type { ImageItem, Settings } from "@/lib/compression/use-image-compressor";
import { formatBytes } from "@/lib/format";

interface AdvancedOptionsProps {
  item: ImageItem;
  /** Settings currently applied to all images. */
  settings: Settings;
  busy: boolean;
  onApply: (settings: Settings) => void;
}

type Estimate = { key: string; size: number; format: OutputFormat } | { key: string; error: string };

export function AdvancedOptions({ item, settings, busy, onApply }: AdvancedOptionsProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [quality, setQuality] = useState(settings.quality);
  const [output, setOutput] = useState<OutputChoice>(settings.output);
  const [estimate, setEstimate] = useState<Estimate | null>(null);

  const isSvg = item.format === "svg";
  const key = `${item.id}:${quality}:${output}`;
  const current = item.output;
  // The already-compressed result answers the estimate when the draft matches the applied settings.
  const isKnown = !!current && current.settings.quality === quality && current.settings.output === output;
  const known = isKnown ? { size: current.encodedSize, format: current.format } : null;

  // Estimate by actually encoding the selected image with the draft settings (debounced, off the main thread).
  useEffect(() => {
    if (!open || isKnown) return;
    let stale = false;
    const timer = setTimeout(() => {
      compressImage({ file: item.file, format: item.format, quality, output, estimateOnly: true })
        .then(({ blob, format }) => !stale && setEstimate({ key, size: blob.size, format }))
        .catch((error: Error) => !stale && setEstimate({ key, error: error.message }));
    }, 400);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [open, isKnown, key, item.file, item.format, quality, output]);

  const result = known ?? (estimate?.key === key && "size" in estimate ? estimate : null);
  const failure = !known && estimate?.key === key && "error" in estimate ? estimate.error : null;
  const keepsFormat = result ? result.format === item.format : resolveOutput(item.format, output, false) === item.format;
  const larger = result !== null && result.size >= item.file.size;
  const changed = quality !== settings.quality || output !== settings.output;

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl border border-line bg-card px-4 py-3.5 text-[15px] text-accent transition-colors hover:bg-primary-soft/40 sm:px-5 sm:py-4 sm:text-base md:px-6"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setQuality(settings.quality);
          setOutput(settings.output);
          setOpen((value) => !value);
        }}
      >
        <ChevronDown className={`size-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
        Advanced Options
      </button>

      {open && (
        <div id={panelId} className="mt-2 space-y-5 rounded-xl border border-line bg-card px-5 pt-5 pb-4 md:px-6">
          <fieldset>
            <legend className="text-xl font-bold text-ink-2 sm:text-2xl">Format</legend>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5" role="radiogroup">
              {OUTPUT_CHOICES.map((choice) => {
                const selected = output === choice.value;
                return (
                  <label
                    key={choice.value}
                    title={choice.hint}
                    className={`flex cursor-pointer flex-col items-center rounded-lg border px-2 py-2 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                      selected ? "border-primary bg-primary-soft text-accent" : "border-line text-body hover:border-line-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${panelId}-format`}
                      value={choice.value}
                      checked={selected}
                      onChange={() => setOutput(choice.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-bold sm:text-[15px]">{choice.label}</span>
                    <span className="mt-0.5 hidden text-[11px] leading-tight text-faint sm:block">{choice.hint}</span>
                  </label>
                );
              })}
            </div>
            {isSvg && <p className="mt-2 text-sm text-faint">SVG files are optimised as vector graphics and always stay SVG.</p>}
          </fieldset>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="flex-1">
              <label htmlFor={`${panelId}-quality`} className="text-xl font-bold text-ink-2 sm:text-2xl">
                Quality
              </label>
              <div className="mt-3 flex justify-between text-sm text-subtle sm:text-base" aria-hidden>
                <span>{quality === 100 ? "100% · Lossless" : `${quality}%`}</span>
                <span>100%</span>
              </div>
              <input
                id={`${panelId}-quality`}
                type="range"
                min={1}
                max={100}
                value={quality}
                disabled={isSvg}
                onChange={(event) => setQuality(Number(event.target.value))}
                aria-valuetext={quality === 100 ? "100%, lossless" : `${quality}% quality`}
                className="quality-range mt-2 w-full disabled:opacity-50"
                style={{ "--fill": `${quality}%` } as React.CSSProperties}
              />
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-[15px] text-white transition-colors hover:bg-primary-hover disabled:opacity-50 sm:h-[54px] sm:px-6 sm:text-lg"
              disabled={busy || !changed}
              onClick={() => onApply({ quality, output })}
            >
              Apply
            </button>
          </div>
          <p className="-mt-2 text-sm text-faint">
            80% gives the best balance for most images. 100% is lossless: no visible or pixel change, with smaller savings.
          </p>

          <div className="flex items-center justify-between gap-4 border-t border-line pt-4 text-sm sm:text-base" aria-live="polite">
            <span className="text-subtle">Estimated output</span>
            <span className="text-right font-bold text-ink-2">
              {failure ? (
                <span className="font-normal text-danger">{failure}</span>
              ) : result === null ? (
                "Calculating…"
              ) : (
                `${formatBytes(result.size)} · ${OUTPUT_FORMATS[result.format].label}`
              )}
              {larger && keepsFormat && (
                <span className="block text-sm font-normal text-subtle">Not smaller than the original, so the original would be kept</span>
              )}
              {larger && !keepsFormat && (
                <span className="block text-sm font-normal text-subtle">Larger than the original after converting</span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
