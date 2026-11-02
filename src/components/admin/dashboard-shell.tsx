"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ExternalLink, FilePlus2, FileText, House, LogOut, Menu, Moon, PanelLeft, Sun, Users, X, Zap, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/config/site";
import { logoutAdmin } from "@/lib/admin/actions";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import type { Admin } from "@/lib/admin/session";
import { initials } from "./initials";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Highlighted for these paths. */
  match: (path: string) => boolean;
  external?: boolean;
}

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: "Content",
    items: [
      { href: "/dashboard", label: "Posts", icon: FileText, match: (p) => p === "/dashboard" || (p.startsWith("/dashboard/posts/") && p !== "/dashboard/posts/new") },
      { href: "/dashboard/posts/new", label: "New post", icon: FilePlus2, match: (p) => p === "/dashboard/posts/new" },
    ],
  },
  {
    label: "Settings",
    items: [{ href: "/dashboard/admins", label: "Admins", icon: Users, match: (p) => p.startsWith("/dashboard/admins") }],
  },
  {
    label: "Site",
    items: [
      { href: "/blogs", label: "View blog", icon: ExternalLink, match: () => false, external: true },
      { href: "/", label: "Home page", icon: House, match: () => false, external: true },
    ],
  },
];

const MobileSidebar = createContext<(open: boolean) => void>(() => {});

/** Opens the sidebar drawer on phones; hidden from 640px up, where the sidebar is always shown. */
export function MobileMenuButton() {
  const setOpen = useContext(MobileSidebar);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open menu"
      className="grid size-8 shrink-0 place-items-center rounded-lg text-subtle hover:bg-surface hover:text-ink sm:hidden"
    >
      <Menu className="size-[18px]" aria-hidden />
    </button>
  );
}

/** Sidebar on the page background with the current page in one framed panel beside it. */
export function DashboardShell({ admin, children }: { admin: Admin; children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // The drawer always shows the full sidebar.
  const narrow = collapsed && !mobileOpen;

  // Navigating closes the drawer.
  const [openedAt, setOpenedAt] = useState(pathname);
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <MobileSidebar.Provider value={setMobileOpen}>
      <div className="flex h-dvh bg-surface text-ink">
        {mobileOpen && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs sm:hidden" onClick={() => setMobileOpen(false)} aria-hidden />}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[80vw] max-w-[320px] flex-col bg-surface px-2 pt-2 pb-2 shadow-2xl transition-[translate,width] duration-300 sm:static sm:z-auto sm:max-w-none sm:translate-x-0 sm:shadow-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${collapsed ? "sm:w-[52px]" : "sm:w-[230px]"}`}
          aria-label="Dashboard"
        >
          <div className={`flex items-center ${narrow ? "flex-col gap-1" : "justify-between"}`}>
            <Link href="/dashboard" className="flex min-w-0 items-center rounded-lg px-1.5 py-1 hover:bg-card" title={siteConfig.name}>
              <span className="grid size-[25px] shrink-0 place-items-center rounded-full bg-primary text-white" aria-hidden>
                <Zap className="size-3.5" strokeWidth={2.25} />
              </span>
              {!narrow && <span className="ms-1.5 max-w-[120px] truncate text-[13px] font-semibold">{siteConfig.name}</span>}
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden size-8 place-items-center rounded-lg text-subtle opacity-70 hover:bg-card hover:opacity-100 sm:grid"
            >
              <PanelLeft className="size-[18px]" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid size-8 place-items-center rounded-lg text-subtle hover:bg-card sm:hidden"
            >
              <X className="size-[18px]" aria-hidden />
            </button>
          </div>

          <nav className="mt-1 flex-1 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.label}>
                {narrow ? (
                  <div className="pt-2" />
                ) : (
                  <p className="px-2.5 pt-4 pb-1 text-[11px] leading-4 font-medium tracking-wider text-subtle/70 uppercase">{section.label}</p>
                )}
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <SideItem item={item} active={item.match(pathname)} narrow={narrow} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className={`mt-2 flex items-center border-t border-line pt-2 ${narrow ? "flex-col gap-1" : "gap-1"}`}>
            <div className={`flex min-w-0 flex-1 items-center gap-2 px-1.5 py-1 ${narrow ? "justify-center" : ""}`} title={`${admin.name} · ${admin.email}`}>
              <span className="grid size-[25px] shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-bold text-accent">{initials(admin.name)}</span>
              {!narrow && (
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">{admin.name}</span>
                  <span className="block truncate text-[11px] text-subtle">{admin.email}</span>
                </span>
              )}
            </div>
            <ThemeButton />
            <form action={logoutAdmin}>
              <button type="submit" aria-label="Log out" title="Log out" className="grid size-8 place-items-center rounded-lg text-subtle hover:bg-card hover:text-danger">
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col sm:py-2 sm:pe-2">
          <main id="main" className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card sm:rounded-[6px] sm:border sm:border-line">
            {children}
          </main>
        </div>
      </div>
    </MobileSidebar.Provider>
  );
}

function SideItem({ item, active, narrow }: { item: NavItem; active: boolean; narrow: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      aria-current={active ? "page" : undefined}
      className={`group relative flex h-[34px] w-full items-center rounded-lg px-1 transition-colors ${
        active ? "bg-card text-ink" : "text-subtle hover:bg-card hover:text-ink"
      } ${narrow ? "justify-center" : ""}`}
    >
      {active && <span className="absolute left-0 h-[60%] w-[2px] rounded-r-md bg-primary" aria-hidden />}
      <span className="grid size-7 shrink-0 place-items-center">
        <Icon className={`size-4 ${active ? "text-primary" : ""}`} aria-hidden />
      </span>
      {narrow ? (
        <span className="pointer-events-none absolute left-full z-10 ml-2 rounded-md border border-line-strong bg-card px-3 py-2 text-xs font-medium whitespace-nowrap text-ink opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {item.label}
        </span>
      ) : (
        <span className={`truncate pl-1.5 text-[13px] ${active ? "font-medium" : "font-normal"}`}>{item.label}</span>
      )}
    </Link>
  );
}

function ThemeButton() {
  function toggle() {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }
  return (
    <button type="button" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode" className="grid size-8 place-items-center rounded-lg text-subtle hover:bg-card hover:text-ink">
      <Moon className="size-4 dark:hidden" aria-hidden />
      <Sun className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
