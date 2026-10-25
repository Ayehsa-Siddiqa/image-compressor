"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { ACCEPT_ATTRIBUTE, SUPPORTED_LABEL } from "@/lib/compression/formats";
import { MAX_FILE_BYTES } from "@/lib/compression/limits";
import { formatBytes } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { useFileDrop } from "./use-file-drop";

const formats = "JPG · PNG · WebP · AVIF · GIF · HEIC · TIFF · BMP · SVG";

export function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { isDragging, dropProps } = useFileDrop(onFiles);

  return (
    <div
      {...dropProps}
      className={`flex flex-col items-center rounded-[20px] border-2 border-dashed px-5 py-9 text-center transition-colors duration-200 sm:px-6 sm:py-12 md:py-14 ${
        isDragging ? "border-primary bg-primary-soft/60" : "border-line-strong bg-card"
      }`}
    >
      <span className="grid size-14 place-items-center rounded-xl sm:size-16 bg-primary-soft text-accent" aria-hidden>
        <Upload className="size-6" strokeWidth={1.75} />
      </span>

      <button type="button" className={buttonClass("primary", "lg", "mt-6 sm:mt-8 sm:w-[200px]")} onClick={() => input.current?.click()}>
        Choose Images
      </button>
      <p className="mt-4 text-[15px] text-body sm:mt-5 sm:text-base">{isDragging ? "Drop Images To Add Them" : "Or Drag & Drop Images Here"}</p>
      <p className="mt-3 text-xs text-faint">
        <span aria-hidden>{formats}</span>
        <span className="sr-only">Supported: {SUPPORTED_LABEL}, up to {formatBytes(MAX_FILE_BYTES)} each</span>
      </p>

      <input
        ref={input}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose images to compress"
        onChange={(event) => {
          if (event.target.files?.length) onFiles(Array.from(event.target.files));
          event.target.value = "";
        }}
      />
    </div>
  );
}
