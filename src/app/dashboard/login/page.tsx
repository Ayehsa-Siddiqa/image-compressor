import type { Metadata } from "next";
import Link from "next/link";
import { LogoImage } from "@/components/layout/logo";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { siteConfig } from "@/config/site";
import { isDatabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = { title: "Sign in" };

export default function DashboardLoginPage() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-surface px-4 py-10">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoImage />
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-ink">Sign in to {siteConfig.name}</h1>
          <p className="mt-0.5 text-[13px] text-subtle">Blog dashboard</p>
        </div>
        <div className="rounded-[10px] border border-line bg-card p-5 shadow-card sm:p-6">
          <AdminLoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-subtle">
          {isDatabaseConfigured() ? "Need access? Ask an existing admin to add you." : "Connect the database first: see “Admin dashboard” in the README."}
        </p>
        <p className="mt-2 text-center text-xs">
          <Link href="/" className="text-accent hover:underline">
            ← Back to {siteConfig.name}
          </Link>
        </p>
      </div>
    </main>
  );
}
