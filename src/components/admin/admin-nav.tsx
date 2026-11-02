import Link from "next/link";
import { ExternalLink, FileText, LogOut, Users } from "lucide-react";
import { logoutAdmin } from "@/lib/admin/actions";
import type { Admin } from "@/lib/admin/session";

const links = [
  { href: "/dashboard", label: "Posts", icon: FileText, key: "posts" },
  { href: "/dashboard/admins", label: "Admins", icon: Users, key: "admins" },
] as const;

export function AdminNav({ admin, active }: { admin: Admin; active: (typeof links)[number]["key"] }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-card p-2 shadow-card sm:mb-8">
      <nav aria-label="Dashboard" className="flex flex-wrap gap-1">
        {links.map(({ href, label, icon: Icon, key }) => (
          <Link
            key={key}
            href={href}
            aria-current={active === key ? "page" : undefined}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[15px] transition-colors ${
              active === key ? "bg-primary-soft font-bold text-accent" : "text-body hover:bg-surface"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        ))}
        <Link href="/blogs" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[15px] text-body hover:bg-surface">
          <ExternalLink className="size-4" aria-hidden />
          View blog
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-3 pl-2">
        <span className="hidden text-sm text-subtle sm:inline" title={admin.email}>
          {admin.name}
        </span>
        <form action={logoutAdmin}>
          <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[15px] text-body hover:bg-surface">
            <LogOut className="size-4" aria-hidden />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

/** Placeholder while the dashboard checks the session and loads data. */
export function AdminLoading() {
  return (
    <div className="container-page animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-14 rounded-2xl bg-line" />
      <div className="mt-8 h-64 rounded-2xl bg-line" />
    </div>
  );
}
