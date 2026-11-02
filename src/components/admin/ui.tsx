import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { MobileMenuButton } from "./dashboard-shell";

/* Compact dashboard styling: 6px corners, 13–16px type, hairline borders. */

const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[6px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";
const buttonVariants = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "border border-line text-subtle hover:border-line-strong hover:text-ink",
  danger: "border border-line text-danger hover:border-danger hover:bg-danger/5",
  subtle: "text-subtle hover:bg-surface hover:text-ink",
} as const;
const buttonSizes = {
  md: "h-[38px] px-4 text-sm",
  sm: "h-[33px] px-3 text-xs",
  icon: "size-[33px] text-xs",
} as const;

export function dashButton(variant: keyof typeof buttonVariants = "primary", size: keyof typeof buttonSizes = "sm", extra = "") {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${extra}`;
}

const chipTones = {
  success: "border-success/30 bg-success/10 text-success",
  primary: "border-primary/40 bg-primary/10 text-accent",
  neutral: "border-line text-subtle",
} as const;

export function Chip({ tone = "neutral", children }: { tone?: keyof typeof chipTones; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${chipTones[tone]}`}>
      {children}
    </span>
  );
}

/** Top bar of the content panel: page title, optional subtitle, and actions on the right. */
export function PageHeader({ title, icon: Icon, subtitle, actions }: { title: string; icon?: LucideIcon; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex min-h-12 shrink-0 flex-wrap items-center gap-2.5 border-b border-line bg-card px-3.5 py-[5px] md:px-4">
      <MobileMenuButton />
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className="size-4 shrink-0 text-subtle" aria-hidden />}
        <h1 className="truncate text-base leading-tight font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && (
          <>
            <span className="text-line-strong" aria-hidden>
              ·
            </span>
            <span className="truncate text-[13px] text-subtle">{subtitle}</span>
          </>
        )}
      </div>
      {actions && <div className="ms-auto flex flex-wrap items-center justify-end gap-2">{actions}</div>}
    </header>
  );
}

/** Scrolling body of the content panel. */
export function PageBody({ children }: { children: ReactNode }) {
  return <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5 md:px-4 md:py-4">{children}</div>;
}

export function Card({ title, description, children, className = "" }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[6px] border border-line bg-card ${className}`}>
      {title && (
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-subtle">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[6px] border border-line bg-card p-3">
      <p className="text-[11px] font-medium tracking-wide text-subtle uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

/** Placeholder for the content panel while a page loads. */
export function PageSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true" aria-label="Loading">
      <div className="h-12 shrink-0 border-b border-line" />
      <div className="animate-pulse space-y-3 p-4">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[66px] rounded-[6px] bg-surface" />
          ))}
        </div>
        <div className="h-72 rounded-[6px] bg-surface" />
      </div>
    </div>
  );
}
