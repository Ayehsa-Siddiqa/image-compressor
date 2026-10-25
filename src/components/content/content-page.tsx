import type { ReactNode } from "react";

interface ContentPageProps {
  title: string;
  intro?: string;
  updated?: string;
  children: ReactNode;
}

/** Layout for simple text pages (About, Privacy, Terms, Cookies, Contact) in the site's hero style. */
export function ContentPage({ title, intro, updated, children }: ContentPageProps) {
  return (
    <section className="bg-hero pt-10 pb-14 sm:pt-14 sm:pb-20 md:pt-16 md:pb-28">
      <div className="container-page">
        <header className="mx-auto max-w-[900px] text-center">
          <h1 className="font-display text-[28px] leading-[1.15] font-bold text-ink sm:text-[40px] lg:text-[56px] lg:leading-[1.18]">
            {title}
          </h1>
          {intro && <p className="mx-auto mt-3 max-w-[640px] text-[15px] text-muted sm:mt-4 sm:text-base md:text-lg">{intro}</p>}
          {updated && <p className="mt-3 text-sm text-faint">Last updated {updated}</p>}
        </header>
        <div className="mx-auto mt-8 max-w-[844px] space-y-5 sm:mt-10 sm:space-y-6 md:mt-12">{children}</div>
      </div>
    </section>
  );
}

/** A card of readable body copy with styled headings, paragraphs, lists and links. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-card px-5 py-7 text-[15px] leading-[1.6] text-subtle shadow-card sm:px-8 sm:py-8 sm:text-base md:px-10 md:py-10 md:text-lg [&_a]:text-accent [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_h2:first-child]:mt-0 md:[&_h2]:text-[28px] [&_li]:mt-1.5 [&_p+p]:mt-4 [&_strong]:text-body [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  );
}
