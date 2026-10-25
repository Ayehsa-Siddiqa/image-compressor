import { Info } from "lucide-react";
import { INPUT_FORMATS, OUTPUT_FORMATS } from "@/lib/compression/formats";
import type { CompressedOutput, ImageItem } from "@/lib/compression/use-image-compressor";
import { formatBytes, savedPercent } from "@/lib/format";

export function SizeSummary({ item, output }: { item: ImageItem; output: CompressedOutput }) {
  const percent = savedPercent(item.file.size, output.size);
  const grewBy = output.size > item.file.size ? Math.ceil(((output.size - item.file.size) / item.file.size) * 100) : 0;
  const inputLabel = INPUT_FORMATS[item.format].label;
  const outputLabel = OUTPUT_FORMATS[output.format].label;
  const details = [item.file.name, item.width && item.height ? `${item.width} × ${item.height}` : null, inputLabel]
    .filter(Boolean)
    .join(" · ");
  const resultTitle = output.converted ? `Converted to ${outputLabel}` : "Compressed";

  return (
    <div className="space-y-3">
      <dl className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="min-w-0 rounded-xl border border-line bg-card px-4 py-3.5 sm:px-5 sm:py-4">
          <dt className="text-sm text-subtle sm:text-base">Original</dt>
          <dd className="mt-1 text-xl font-bold text-ink-2 sm:text-2xl">{formatBytes(item.file.size)}</dd>
          <dd className="mt-1 truncate text-sm text-faint" title={details}>
            {details}
          </dd>
        </div>

        {output.reduced ? (
          <div className="min-w-0 rounded-xl border border-success-line bg-success-soft px-4 py-3.5 sm:px-5 sm:py-4">
            <dt className="text-sm text-success sm:text-base">{resultTitle}</dt>
            <dd className="mt-1 text-xl font-bold text-success sm:text-2xl">{formatBytes(output.size)}</dd>
            <dd className="mt-1 text-sm text-success/80">
              {percent === 0 ? "Less than 1% smaller" : `${percent}% smaller`} · {outputLabel}
            </dd>
          </div>
        ) : output.converted ? (
          <div className="min-w-0 rounded-xl border border-line bg-surface px-4 py-3.5 sm:px-5 sm:py-4">
            <dt className="text-sm text-subtle sm:text-base">{resultTitle}</dt>
            <dd className="mt-1 text-xl font-bold text-ink-2 sm:text-2xl">{formatBytes(output.size)}</dd>
            <dd className="mt-1 text-sm text-subtle">
              {grewBy > 0 ? `${grewBy}% larger than the ${inputLabel}. Try another format or a lower quality.` : "Same size as the original."}
            </dd>
          </div>
        ) : (
          <div className="min-w-0 rounded-xl border border-line bg-surface px-4 py-3.5 sm:px-5 sm:py-4">
            <dt className="text-sm text-subtle sm:text-base">Compressed</dt>
            <dd className="mt-1 text-xl font-bold text-ink-2 sm:text-2xl">{formatBytes(output.size)}</dd>
            <dd className="mt-1 text-sm text-subtle">
              {item.format === "svg"
                ? "This SVG is already optimised, so the original is kept."
                : `Can't be compressed further at ${output.settings.quality}% quality, so the original is kept (re-encoding gave ${formatBytes(output.encodedSize)}).`}
            </dd>
          </div>
        )}
      </dl>

      {output.notes.map((note) => (
        <p key={note} className="flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-subtle">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          {note}
        </p>
      ))}
    </div>
  );
}
