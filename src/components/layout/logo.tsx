import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

// Both files are 1792 × 377.
const RATIO = 1792 / 377;
const HEIGHTS = { md: 32, sm: 26 } as const;

/** The wordmark: dark lettering in light mode, white lettering in dark mode. */
export function LogoImage({ size = "md", className = "" }: { size?: keyof typeof HEIGHTS; className?: string }) {
  const height = HEIGHTS[size];
  const width = Math.round(height * RATIO);
  const shared = { width, height, style: { width: "auto" } } as const;
  const sizeClass = size === "md" ? "h-7 sm:h-8" : "h-[26px]";
  return (
    <>
      <Image src="/toolve-light.png" alt={siteConfig.name} {...shared} className={`${sizeClass} dark:hidden ${className}`} />
      <Image src="/toolve-dark.png" alt={siteConfig.name} {...shared} className={`${sizeClass} hidden dark:block ${className}`} />
    </>
  );
}

export function Logo({ size = "md", href = "/" }: { size?: keyof typeof HEIGHTS; href?: string }) {
  return (
    <Link href={href} className="inline-flex shrink-0 items-center rounded-[6px]" aria-label={`${siteConfig.name} home`}>
      <LogoImage size={size} />
    </Link>
  );
}
