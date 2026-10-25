"use client";

import { useRef, useState, type DragEvent } from "react";

/** Drag-and-drop handlers that ignore non-file drags and don't flicker when passing over child elements. */
export function useFileDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const depth = useRef(0);

  const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes("Files");

  return {
    isDragging,
    dropProps: {
      onDragEnter(event: DragEvent) {
        if (!hasFiles(event)) return;
        event.preventDefault();
        depth.current++;
        setIsDragging(true);
      },
      onDragOver(event: DragEvent) {
        if (!hasFiles(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      },
      onDragLeave(event: DragEvent) {
        if (!hasFiles(event)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setIsDragging(false);
      },
      onDrop(event: DragEvent) {
        if (!hasFiles(event)) return;
        event.preventDefault();
        depth.current = 0;
        setIsDragging(false);
        onFiles(Array.from(event.dataTransfer.files));
      },
    },
  };
}
