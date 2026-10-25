import type { ReactNode } from "react";

/** Centered card used by the Login and Sign Up pages, on the site's hero background. */
export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <section className="bg-hero px-4 py-10 sm:px-5 sm:py-14 md:py-20">
      <div className="mx-auto max-w-[480px]">
        <div className="rounded-3xl border border-line bg-card px-5 py-8 shadow-card sm:px-10 sm:py-10">
          <header className="text-center">
            <h1 className="font-display text-[26px] leading-tight font-bold text-ink sm:text-[30px] md:text-4xl">{title}</h1>
            <p className="mt-2 text-[15px] text-muted sm:text-base">{subtitle}</p>
          </header>
          <div className="mt-6 sm:mt-8">{children}</div>
        </div>
        <p className="mt-6 text-center text-[15px] text-muted">{footer}</p>
      </div>
    </section>
  );
}
