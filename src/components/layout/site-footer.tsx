import Link from "next/link";
import { siteConfig, withHref, type SocialNetwork } from "@/config/site";
import { LinkedinIcon, TwitterIcon } from "@/components/ui/brand-icons";
import { Logo } from "./logo";

const columns = siteConfig.footerNav
  .map((column) => ({ ...column, links: withHref(column.links) }))
  .filter((column) => column.links.length > 0);

const footerSocial: { network: SocialNetwork; label: string; Icon: typeof LinkedinIcon }[] = [
  { network: "linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { network: "x", label: "Twitter / X", Icon: TwitterIcon },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-page">
      <div className="container-page pt-12 pb-8 md:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-10 lg:grid-cols-[1fr_repeat(4,minmax(0,1fr))] lg:gap-8">
          <div className="col-span-2 max-w-[260px] sm:col-span-1 sm:max-w-[220px]">
            <Logo size="sm" />
            <p className="mt-4 text-[15px] leading-snug text-subtle">{siteConfig.tagline}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-display text-base font-semibold tracking-[0.08em] sm:text-lg text-ink-2 uppercase">{column.title}</h2>
              <ul className="mt-3 space-y-2 text-[15px] text-subtle sm:mt-4 sm:space-y-2.5 sm:text-base">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-colors hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-line-strong pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-subtle sm:text-[15px]">
            © {siteConfig.copyrightYear} {siteConfig.name}. All Rights Reserved.
          </p>
          <ul className="flex gap-3">
            {footerSocial.map(({ network, label, Icon }) => {
              const href = siteConfig.social[network];
              const iconClass = "grid size-9 place-items-center rounded-full border border-body text-body";
              return (
                <li key={network}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={`${iconClass} transition-colors hover:border-primary hover:text-accent`}
                    >
                      <Icon className="size-4" />
                    </a>
                  ) : (
                    // Shown as in the design; becomes a link once a profile URL is set in site config.
                    <span role="img" aria-label={label} title={label} className={iconClass}>
                      <Icon className="size-4" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}
