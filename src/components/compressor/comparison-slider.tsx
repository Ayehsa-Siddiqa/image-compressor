"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import type { Rotation } from "@/lib/compression/types";

/** How much each press of the zoom buttons zooms in or out. */
const ZOOM_STEP = 1.5;

interface ComparisonSliderProps {
  originalUrl: string;
  compressedUrl: string;
  width: number;
  height: number;
  /** Rotation baked into the compressed image; the original is turned to match. */
  rotation: Rotation;
  name: string;
}

/** How close (in px) to the divider a press grabs it instead of zooming; wider for fingers. */
const LINE_REACH = { mouse: 24, touch: 36 };

type Drag = { mode: "divider" } | { mode: "pan"; startX: number; startY: number; x: number; y: number; moved: boolean };

/**
 * Original on the left, compressed on the right; drag the divider (or use the arrow keys) to move it.
 * Away from the divider, clicking zooms in on that spot and dragging pans; scrolling zooms around the pointer.
 */
export function ComparisonSlider({ originalUrl, compressedUrl, width, height, rotation, name }: ComparisonSliderProps) {
  const box = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [zoom, setZoom] = useState<number | null>(null);
  // Wheel zoom on top of the fitted size: `scale` 1 is fitted, x/y are the top-left offset as fractions of the frame.
  const [view, setView] = useState({ url: originalUrl, scale: 1, x: 0, y: 0 });
  // Showing a different image starts back at the fitted size.
  const { scale, x, y } = view.url === originalUrl ? view : { scale: 1, x: 0, y: 0 };
  // Allow at least 4x, and enough to reach 400% of the real pixels on large images.
  const maxScale = Math.max(4, zoom ? 4 / zoom : 4);

  // Keep landscape photos close to the design's wide frame without cropping portrait images to a sliver.
  const aspect = Math.min(2, Math.max(1, width / height));

  // A quarter-turned original fills a box with the frame's width and height swapped, then rotates into place.
  const turned = rotation % 180 !== 0;
  const originalStyle = {
    width: turned ? `${100 / aspect}%` : "100%",
    height: turned ? `${aspect * 100}%` : "100%",
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
  };

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

  /** Zooms to `target` (clamped to the allowed range) keeping the point at px/py (fractions of the frame) still. */
  const zoomAround = (target: number, px: number, py: number) => {
    const next = Math.min(maxScale, Math.max(1, target));
    // Keep the image covering the frame.
    const clamp = (offset: number) => Math.min(0, Math.max(1 - next, offset));
    setView({
      url: originalUrl,
      scale: next,
      x: clamp(px - (px - x) * (next / scale)),
      y: clamp(py - (py - y) * (next / scale)),
    });
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      const target = scale * Math.exp(-event.deltaY * 0.0015);
      // Already fully zoomed out (or in): let the page scroll as usual.
      if ((target < scale && scale <= 1) || (target > scale && scale >= maxScale)) return;
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAround(target, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    };
    // Registered natively because React's wheel listener is passive and can't stop the page scrolling.
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const drag = useRef<Drag | null>(null);
  const [cursor, setCursor] = useState("cursor-zoom-in");

  const pointer = (event: React.PointerEvent) => {
    const rect = box.current!.getBoundingClientRect();
    const reach = event.pointerType === "touch" ? LINE_REACH.touch : LINE_REACH.mouse;
    return {
      rect,
      px: (event.clientX - rect.left) / rect.width,
      py: (event.clientY - rect.top) / rect.height,
      onLine: Math.abs(event.clientX - (rect.left + (rect.width * position) / 100)) <= reach,
    };
  };
  const hoverCursor = (onLine: boolean) =>
    onLine ? "cursor-ew-resize" : scale >= maxScale ? "cursor-zoom-out" : "cursor-zoom-in";

  function onPointerDown(event: React.PointerEvent) {
    if (event.button !== 0) return;
    const { px, onLine } = pointer(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (onLine) {
      drag.current = { mode: "divider" };
      setPosition(Math.min(100, Math.max(0, px * 100)));
    } else {
      drag.current = { mode: "pan", startX: event.clientX, startY: event.clientY, x, y, moved: false };
    }
  }

  function onPointerMove(event: React.PointerEvent) {
    const { rect, px, onLine } = pointer(event);
    const current = drag.current;
    if (!current) return setCursor(hoverCursor(onLine));
    if (current.mode === "divider") return setPosition(Math.min(100, Math.max(0, px * 100)));
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    // A few pixels of wobble still counts as a click.
    if (!current.moved && Math.hypot(dx, dy) < 5) return;
    current.moved = true;
    if (scale <= 1) return;
    setCursor("cursor-grabbing");
    const clamp = (offset: number) => Math.min(0, Math.max(1 - scale, offset));
    setView({ url: originalUrl, scale, x: clamp(current.x + dx / rect.width), y: clamp(current.y + dy / rect.height) });
  }

  function onPointerUp(event: React.PointerEvent) {
    const current = drag.current;
    drag.current = null;
    const { px, py, onLine } = pointer(event);
    if (current?.mode === "pan" && !current.moved) {
      // Click to zoom in on that spot; at full zoom a click goes back to the fitted view.
      zoomAround(scale >= maxScale ? 1 : scale * ZOOM_STEP, px, py);
      setCursor(scale * ZOOM_STEP >= maxScale && scale < maxScale ? "cursor-zoom-out" : "cursor-zoom-in");
    } else {
      setCursor(hoverCursor(onLine));
    }
  }

  // The divider is positioned in the frame; the clip applies inside the zoomed layer.
  const clipLeft = Math.min(100, Math.max(0, (position - x * 100) / scale));

  return (
    <figure className="mx-0 mt-0">
      <div
        ref={box}
        className={`relative overflow-hidden rounded-3xl bg-checker select-none ${cursor}`}
        // Zoomed in, a finger drag pans the image; otherwise vertical swipes still scroll the page.
        style={{ aspectRatio: aspect, touchAction: scale > 1 ? "none" : "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <div
          className="absolute inset-0"
          style={{ transform: `translate(${x * 100}%, ${y * 100}%) scale(${scale})`, transformOrigin: "0 0" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL */}
          <img
            src={originalUrl}
            alt={`Original ${name}`}
            className="absolute top-1/2 left-1/2 object-contain"
            style={originalStyle}
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL */}
          <img
            src={compressedUrl}
            alt={`Compressed ${name}`}
            className="absolute inset-0 size-full object-contain"
            style={{ clipPath: `inset(0 0 0 ${clipLeft}%)` }}
            draggable={false}
          />
        </div>

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
          // Presses here mustn't reach the frame's zoom/pan handling.
          <div
            className="absolute bottom-4 left-4 z-10 flex cursor-default items-center gap-1 rounded-full bg-black/85 p-1 text-[13px] text-white"
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
          >
            <ZoomButton label="Zoom out" disabled={scale <= 1} onClick={() => zoomAround(scale / ZOOM_STEP, 0.5, 0.5)}>
              <Minus className="size-3.5" />
            </ZoomButton>
            <span className="px-1 tabular-nums" aria-live="polite">
              Zoom · {Math.max(1, Math.round(zoom * scale * 100))}%
            </span>
            <ZoomButton label="Zoom in" disabled={scale >= maxScale} onClick={() => zoomAround(scale * ZOOM_STEP, 0.5, 0.5)}>
              <Plus className="size-3.5" />
            </ZoomButton>
          </div>
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
          // Kept for keyboard and screen readers; pointer input is handled by the frame.
          className="pointer-events-none absolute inset-0 m-0 size-full appearance-none opacity-0"
        />
      </div>
      <figcaption className="sr-only">Before and after comparison of {name}</figcaption>
    </figure>
  );
}

function ZoomButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-6 place-items-center rounded-full transition-colors hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
