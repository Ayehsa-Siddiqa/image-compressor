import Link from "next/link";
import { Zap } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Logo({ size = "md" }: { size?: "md" | "sm" }) {
  const md = size === "md";
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-full" aria-label={`${siteConfig.name} home`}>
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-primary text-white ${md ? "size-9 sm:size-11" : "size-7"}`}
        aria-hidden
      >
        <Zap className={md ? "size-4 sm:size-5" : "size-3.5"} strokeWidth={2} />
      </span>
      <span className={`font-bold tracking-tight text-ink ${md ? "text-lg sm:text-[22px]" : "text-base"}`}>{siteConfig.name}</span>
    </Link>
  );
}
