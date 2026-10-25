import { Layers, Lock, ShieldCheck, Zap, type LucideIcon } from "lucide-react";
import { MAX_FILES } from "@/lib/compression/limits";

// The design's "Auto-Deleted In 1 Hr" and "Encrypted Upload" describe server uploads. Images never leave the
// browser here, so those two labels state what actually happens instead.
const highlights: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: "Never Uploaded" },
  { icon: Zap, label: "Results In Seconds" },
  { icon: Layers, label: `Batch Up To ${MAX_FILES} Files` },
  { icon: Lock, label: "Private By Design" },
];

export function FeatureHighlights() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6" aria-label="Highlights">
      {highlights.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-line bg-card px-3 py-5 text-center sm:py-6 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-primary/60 hover:shadow-card-active md:h-[131px] md:py-0"
        >
          <Icon className="size-[22px] text-accent sm:size-[26px]" strokeWidth={1.75} aria-hidden />
          <span className="text-[13px] text-subtle sm:text-[15px] md:text-base">{label}</span>
        </li>
      ))}
    </ul>
  );
}
