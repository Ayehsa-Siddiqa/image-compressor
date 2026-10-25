"use client";

import { memo, useState } from "react";
import { AlertTriangle, LoaderCircle, RotateCw, X } from "lucide-react";
import { INPUT_FORMATS, OUTPUT_FORMATS } from "@/lib/compression/formats";
import type { ImageItem } from "@/lib/compression/use-image-compressor";
import { downloadName, formatBytes, savedPercent } from "@/lib/format";

interface ImageTileProps {
  item: ImageItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onReplace: (id: string) => void;
  onRemove: (id: string) => void;
  onDimensions: (id: string, width: number, height: number) => void;
}

export const ImageTile = memo(function ImageTile({ item, selected, onSelect, onReplace, onRemove, onDimensions }: ImageTileProps) {
  const name = item.file.name;
  const format = INPUT_FORMATS[item.format].label;
  const { status, output } = item;
  const percent = output ? savedPercent(item.file.size, output.size) : 0;
  const grewBy = output && output.size > item.file.size ? Math.ceil(((output.size - item.file.size) / item.file.size) * 100) : 0;
  const src = item.originalPreviewUrl ?? item.previewUrl;
  // Some originals (e.g. HEIC outside Safari) can't be shown until the compressor has decoded them.
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const broken = brokenSrc === src;
  // Pending tiles reveal their overlay on hover/focus/selection; finished tiles always show their result.
  const persistent = status !== "pending" || broken;

  return (
    <li
      className={`group relative aspect-square overflow-hidden rounded-[10px] bg-checker ring-offset-2 ring-offset-card transition-shadow duration-150 ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        aria-pressed={selected}
        aria-label={`Preview ${name}`}
        className="absolute inset-0 rounded-[10px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL, nothing for next/image to optimise */}
        <img
          key={src}
          src={src}
          alt=""
          decoding="async"
          draggable={false}
          className="size-full object-cover"
          onLoad={(event) => onDimensions(item.id, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
          // Unreadable files would otherwise show the browser's broken-image icon.
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
            setBrokenSrc(src);
          }}
        />
      </button>

      <div
        className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 p-2 text-white transition-opacity duration-150 ${
          persistent || selected ? "opacity-100" : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
        }`}
      >
        {status === "pending" && <span className="text-lg font-bold tracking-wide sm:text-2xl md:text-[28px]">{format}</span>}

        {status === "processing" && (
          <>
            <LoaderCircle className="size-7 animate-spin" aria-hidden />
            <span className="text-sm">Compressing…</span>
          </>
        )}

        {status === "done" && output && (
          <>
            <span className="text-xl font-bold sm:text-2xl md:text-[30px]" aria-hidden>
              {output.reduced ? (percent === 0 ? "-<1%" : `-${percent}%`) : grewBy > 0 ? `+${grewBy}%` : "0%"}
            </span>
            {output.converted ? (
              <span className="-mt-1 text-center text-[11px] leading-tight sm:text-xs">
                {format} → {OUTPUT_FORMATS[output.format].label}
              </span>
            ) : (
              !output.reduced && <span className="-mt-1 text-center text-[11px] leading-tight sm:text-xs">Already optimized</span>
            )}
            <a
              href={output.url}
              download={downloadName(name, { ...output, extension: OUTPUT_FORMATS[output.format].extension })}
              className="pointer-events-auto mt-1 inline-flex h-7 items-center rounded-full bg-primary px-3.5 text-xs sm:h-[30px] sm:px-5 sm:text-[13px] text-white transition-colors hover:bg-primary-hover"
              aria-label={`Download ${name} as ${OUTPUT_FORMATS[output.format].label} (${formatBytes(output.size)}${output.reduced ? `, ${percent}% smaller` : output.converted ? "" : ", original kept"})`}
            >
              Download
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <AlertTriangle className="size-7 text-[#ffb4b0]" aria-hidden />
            <span className="text-center text-xs leading-tight" title={item.error}>
              Couldn&apos;t compress
            </span>
          </>
        )}
      </div>

      <div
        className={`absolute top-2 right-2 flex gap-1.5 transition-opacity duration-150 ${
          persistent || selected ? "opacity-100" : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
        }`}
      >
        <IconButton label={`Replace ${name}`} onClick={() => onReplace(item.id)} disabled={status === "processing"}>
          <RotateCw className="size-3.5" />
        </IconButton>
        <IconButton label={`Remove ${name}`} onClick={() => onRemove(item.id)}>
          <X className="size-4" />
        </IconButton>
      </div>
    </li>
  );
});

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-6 place-items-center rounded bg-white text-black shadow-sm transition-colors hover:bg-primary-soft disabled:opacity-50"
    >
      {children}
    </button>
  );
}
