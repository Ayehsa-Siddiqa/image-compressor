"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight, Menu, X } from "lucide-react";
import { siteConfig, withHref, type SiteLink } from "@/config/site";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const navLinks = withHref(siteConfig.mainNav);
const { login, signUp } = siteConfig.account;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.includes("#") || href.startsWith("mailto:")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Login / Sign Up: a real link once a URL is configured, otherwise shown as in the design without an action. */
function AccountLink({
  link,
  className,
  children,
  onClick,
}: {
  link: SiteLink;
  className: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  if (link.href) {
    return (
      <Link href={link.href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className} aria-disabled="true" title="Accounts are coming soon">
      {children}
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const linkClass = (href: string) =>
    `transition-colors hover:text-accent ${isActive(pathname, href) ? "text-accent" : "text-body"}`;

  // While the sidebar is open: lock page scroll, close on Escape, and keep focus inside it.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const trigger = menuButton.current;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="bg-header-glow relative z-30 border-b-[0.8px] border-header-line">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-base">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={linkClass(link.href)}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-4">
          <ThemeToggle />
          <AccountLink link={login} className="hidden text-base text-body transition-colors hover:text-accent sm:inline">
            {login.label}
          </AccountLink>
          <AccountLink
            link={signUp}
            className="hidden h-11 items-center rounded-full bg-primary px-5 text-base text-white transition-colors hover:bg-primary-hover sm:inline-flex md:h-12 md:px-6"
          >
            {signUp.label}
          </AccountLink>
          <button
            ref={menuButton}
            type="button"
            className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6" />
          </button>
        </div>
      </div>

      {/* Mobile / tablet sidebar: full viewport height, slides in from the right. */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={close}
        />
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          inert={!open}
          className={`absolute inset-y-0 right-0 flex h-dvh w-[86%] max-w-[340px] flex-col bg-card transition-[transform,box-shadow] duration-300 ease-out ${
            open ? "translate-x-0 shadow-[-12px_0_40px_rgb(0_0_0/0.18)]" : "translate-x-full shadow-none"
          }`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <Logo size="sm" />
            <button
              ref={closeButton}
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 text-[15px] transition-colors hover:bg-surface ${
                        active ? "bg-primary-soft font-bold text-accent" : "text-body"
                      }`}
                    >
                      {link.label}
                      <ChevronRight className="size-4 text-faint" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="shrink-0 space-y-3 border-t border-line p-5">
            <AccountLink
              link={login}
              onClick={close}
              className="flex h-11 w-full items-center justify-center rounded-full border border-line-strong text-[15px] text-body transition-colors hover:border-primary hover:text-accent"
            >
              {login.label}
            </AccountLink>
            <AccountLink
              link={signUp}
              onClick={close}
              className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-[15px] text-white transition-colors hover:bg-primary-hover"
            >
              {signUp.label}
            </AccountLink>
          </div>
        </div>
      </div>
    </header>
  );
}
