import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { MobileMenuButton } from "./dashboard-shell";

/* Dashboard styling: one framed content panel, 6px corners, hairline borders, the site's theme colours. */

const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[6px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50";
const buttonVariants = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  /** Header action: outlined, icon in the accent colour. */
  outline: "border border-line text-ink hover:border-primary hover:text-accent [&_svg]:text-accent",
  secondary: "border border-line text-subtle hover:border-line-strong hover:text-ink",
  danger: "border border-line text-danger hover:border-danger hover:bg-danger/5",
} as const;
const buttonSizes = {
  md: "h-10 px-4 text-sm",
  sm: "h-9 px-3 text-[13px]",
} as const;

export function dashButton(variant: keyof typeof buttonVariants = "primary", size: keyof typeof buttonSizes = "md", extra = "") {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${extra}`;
}

/** Square icon-only button, as in table rows and toolbars. */
export function iconButton(tone: "default" | "danger" | "active" = "default", extra = "") {
  const tones = {
    default: "text-subtle hover:bg-surface hover:text-ink",
    danger: "text-danger hover:bg-danger/10",
    active: "bg-primary-soft text-accent",
  };
  return `inline-grid size-9 shrink-0 place-items-center rounded-[6px] transition-colors disabled:pointer-events-none disabled:opacity-50 ${tones[tone]} ${extra}`;
}

const chipTones = {
  success: "border-success/40 text-success",
  primary: "border-primary/40 text-accent",
  neutral: "border-line-strong text-subtle",
} as const;

/** Outlined uppercase label, e.g. a post's status. */
export function Chip({ tone = "neutral", children }: { tone?: keyof typeof chipTones; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase ${chipTones[tone]}`}>
      {children}
    </span>
  );
}

/** Top bar of the content panel: icon + title on the left, actions on the right. */
export function PageHeader({ title, icon: Icon, subtitle, actions }: { title: string; icon?: LucideIcon; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex min-h-[60px] shrink-0 flex-wrap items-center gap-3 border-b border-line px-4 py-2.5 md:px-5">
      <MobileMenuButton />
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && <Icon className="size-5 shrink-0 text-ink" aria-hidden />}
        <h1 className="truncate text-xl leading-tight font-semibold text-ink">{title}</h1>
        {subtitle && <span className="hidden truncate text-sm text-subtle sm:inline">{subtitle}</span>}
      </div>
      {actions && <div className="ms-auto flex flex-wrap items-center justify-end gap-2">{actions}</div>}
    </header>
  );
}

/** Scrolling body of the content panel. */
export function PageBody({ children }: { children: ReactNode }) {
  return <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-5">{children}</div>;
}

export function Card({ title, description, children, className = "" }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[6px] border border-line bg-card ${className}`}>
      {title && (
        <div className="border-b border-line px-4 py-3.5">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-subtle">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Column headings of a dashboard table. */
export const tableHead = "bg-surface text-xs font-semibold tracking-wider text-subtle uppercase";

/** Placeholder for the content panel while a page loads. */
export function PageSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true" aria-label="Loading">
      <div className="h-[60px] shrink-0 border-b border-line" />
      <div className="animate-pulse space-y-4 px-4 py-5 md:px-5">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 w-28 rounded-[6px] bg-surface" />
          ))}
        </div>
        <div className="h-72 rounded-[6px] bg-surface" />
      </div>
    </div>
  );
}
