"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Images, LoaderCircle } from "lucide-react";
import type { ImageCompressorApi } from "@/lib/compression/use-image-compressor";
import { formatBytes, formatDuration, savedPercent } from "@/lib/format";

const plural = (count: number) => `${count} ${count === 1 ? "image" : "images"}`;

type Run = ImageCompressorApi["state"]["run"];

interface BatchStatusProps {
  started: boolean;
  total: number;
  summary: ImageCompressorApi["summary"];
  run: Run;
}

/** Sticky bar above the grid: how many images there are, how far compression has got and how long it's taking. */
export function BatchStatus({ started, total, summary, run }: BatchStatusProps) {
  const now = useNow(!!run && !run.endedAt);
  const finished = total - summary.remaining;
  const percent = total > 0 ? Math.round((finished / total) * 100) : 0;
  const saved = summary.originalBytes - summary.outputBytes;
  const savedPct = savedPercent(summary.originalBytes, summary.outputBytes);

  const elapsed = run ? Math.max(0, (run.endedAt ?? now) - run.startedAt) : 0;
  // Average time per finished image so far, times what's left (several images run at once, so this already accounts for that).
  const left = run && !run.endedAt && run.completed > 0 ? (elapsed / run.completed) * summary.remaining : null;

  let icon = <Images className="size-5 shrink-0 text-accent" aria-hidden />;
  let title = `${plural(total)} ready to compress`;
  let detail: string | null = null;
  let timing: string | null = null;

  if (started && summary.isProcessing) {
    icon = <LoaderCircle className="size-5 shrink-0 animate-spin text-accent" aria-hidden />;
    title = `Compressing ${plural(total)}…`;
    detail = `${finished} of ${total} done`;
    if (run) timing = `${formatDuration(elapsed)} elapsed${left !== null ? ` · about ${formatDuration(left)} left` : ""}`;
  } else if (started && summary.doneCount > 0) {
    icon = <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />;
    title = summary.errorCount > 0 ? `${summary.doneCount} of ${plural(total)} compressed` : `All ${plural(total)} compressed`;
    detail = saved > 0 ? `Saved ${formatBytes(saved)} (${savedPct}%)` : "No further savings";
    if (run?.endedAt) timing = `Took ${formatDuration(elapsed)}`;
  } else if (started && summary.errorCount > 0) {
    icon = <AlertTriangle className="size-5 shrink-0 text-danger" aria-hidden />;
    title = `${plural(total)} couldn't be compressed`;
  }

  return (
    <div className="sticky top-3 z-20 rounded-xl border border-line bg-card/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <p className="flex min-w-0 flex-1 items-center gap-2 font-bold text-ink-2">
          {icon}
          <span className="truncate">{title}</span>
        </p>
        {detail && <p className="text-sm text-subtle">{detail}</p>}
        {timing && (
          <p className="flex items-center gap-1.5 text-sm tabular-nums text-subtle">
            <Clock className="size-4" aria-hidden />
            {timing}
          </p>
        )}
        {started && <p className="text-sm font-bold tabular-nums text-accent">{percent}%</p>}
      </div>
      {started && (
        <div
          className="mt-2.5 h-2 overflow-hidden rounded-full bg-primary-soft"
          role="progressbar"
          aria-label="Compression progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={finished}
          aria-valuetext={`${finished} of ${total} images done`}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${summary.isProcessing ? "bg-primary" : "bg-success"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

/** Current time, refreshed a few times a second while `running`. */
function useNow(running: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, [running]);
  return now;
}
