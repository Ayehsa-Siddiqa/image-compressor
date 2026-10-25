import type { ReactNode } from "react";

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
}

export function SectionHeading({ id, eyebrow, title, subtitle, align = "center", as: Tag = "h2" }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : ""}>
      {eyebrow && (
        <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-accent uppercase md:text-xs">{eyebrow}</p>
      )}
      <Tag id={id} className="font-display text-[28px] leading-[1.15] font-bold text-ink sm:text-[40px] lg:text-[56px] lg:leading-[1.18]">
        {title}
      </Tag>
      {subtitle && <p className="mt-3 text-[15px] text-muted sm:mt-4 sm:text-base md:text-lg">{subtitle}</p>}
    </div>
  );
}
