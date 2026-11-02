import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";

// Rendered straight inside the root layout (outside the (site) group), so it brings the site's header and footer.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="bg-hero py-24 text-center md:py-32">
          <div className="container-page">
            <p className="text-sm font-bold tracking-[0.18em] text-accent uppercase">404</p>
            <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl md:text-[56px]">Page not found</h1>
            <p className="mt-4 text-lg text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
            <Link href="/" className={buttonClass("primary", "md", "mt-8")}>
              Compress Images
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
