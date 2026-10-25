"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ComparisonSliderProps {
  originalUrl: string;
  compressedUrl: string;
  width: number;
  height: number;
  name: string;
}

/** Original on the left, compressed on the right; drag (or use the arrow keys) to move the divider. */
export function ComparisonSlider({ originalUrl, compressedUrl, width, height, name }: ComparisonSliderProps) {
  const box = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [zoom, setZoom] = useState<number | null>(null);

  // Keep landscape photos close to the design's wide frame without cropping portrait images to a sliver.
  const aspect = Math.min(2, Math.max(1, width / height));

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setZoom(Math.min(w / width, h / height));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  return (
    <figure className="mx-0 mt-0">
      <div
        ref={box}
        className="relative overflow-hidden rounded-3xl bg-checker select-none"
        style={{ aspectRatio: aspect }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL */}
        <img src={originalUrl} alt={`Original ${name}`} className="absolute inset-0 size-full object-contain" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL */}
        <img
          src={compressedUrl}
          alt={`Compressed ${name}`}
          className="absolute inset-0 size-full object-contain"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
          draggable={false}
        />

        <div className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white" style={{ left: `${position}%` }} aria-hidden>
          <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-primary shadow-[0_4px_14px_rgb(0_0_0/0.25)]">
            <span className="flex">
              <ChevronLeft className="-mr-1 size-5" strokeWidth={2.25} />
              <ChevronRight className="-ml-1 size-5" strokeWidth={2.25} />
            </span>
          </span>
        </div>

        <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-black/75 px-3 py-1 text-xs text-white" aria-hidden>
          Original
        </span>
        <span className="pointer-events-none absolute top-4 right-4 rounded-full bg-black/75 px-3 py-1 text-xs text-white" aria-hidden>
          Compressed
        </span>
        {zoom !== null && (
          <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/85 px-3 py-1 text-[13px] text-white">
            Zoom · {Math.max(1, Math.round(zoom * 100))}%
          </span>
        )}

        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Comparison divider: left shows the original, right shows the compressed image"
          aria-valuetext={`${Math.round(position)}% original`}
          className="absolute inset-0 m-0 size-full cursor-ew-resize appearance-none opacity-0"
        />
      </div>
      <figcaption className="sr-only">Before and after comparison of {name}</figcaption>
    </figure>
  );
}
