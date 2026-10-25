"use client";

import type { ImageItem } from "@/lib/compression/use-image-compressor";
import { ImageTile } from "./image-tile";

interface ImageGridProps {
  items: ImageItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReplace: (id: string) => void;
  onRemove: (id: string) => void;
  onDimensions: (id: string, width: number, height: number) => void;
}

const MAX_ROWS = 2;
const DESKTOP_COLUMNS = 5;

export function ImageGrid({ items, selectedId, ...handlers }: ImageGridProps) {
  // At most two rows, filled left to right. Extra images add columns, and the grid scrolls sideways.
  const columns = Math.max(Math.ceil(items.length / MAX_ROWS), Math.min(items.length, DESKTOP_COLUMNS));

  return (
    <div className="rounded-2xl border border-line bg-card p-2 shadow-card md:p-2.5">
      <ul
        aria-label="Selected images"
        tabIndex={0}
        className="tile-scroll grid gap-2.5 overflow-x-auto p-1 [--per-view:2] [--tile:calc((100%-(var(--per-view)-1)*10px)/var(--per-view))] min-[480px]:[--per-view:3] sm:[--per-view:4] md:[--per-view:5]"
        style={{ gridTemplateColumns: `repeat(${columns}, var(--tile))` }}
      >
        {items.map((item) => (
          <ImageTile key={item.id} item={item} selected={item.id === selectedId} {...handlers} />
        ))}
      </ul>
    </div>
  );
}
