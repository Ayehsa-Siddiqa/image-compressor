import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading, AdminNav } from "@/components/admin/admin-nav";
import { AddAdminForm, RemoveAdminButton } from "@/components/admin/admin-accounts";
import { formatPostDate } from "@/content/blogs";
import { requireAdmin } from "@/lib/admin/session";
import { getSupabase } from "@/lib/supabase";

export const metadata: Metadata = { title: "Admins" };

export default function AdminsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Admins />
    </Suspense>
  );
}

async function Admins() {
  const me = await requireAdmin();
  const { data: admins, error } = await getSupabase()!
    .from("admin_users")
    .select("id, name, email, created_at")
    .order("created_at")
    .returns<{ id: string; name: string; email: string; created_at: string }[]>();
  if (error) throw new Error(`Couldn't load admins: ${error.message}`);

  return (
    <div className="container-page">
      <AdminNav admin={me} active="admins" />
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Admins</h1>
      <p className="mt-1 text-subtle">Everyone here can sign in at /dashboard and edit every post.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ul className="h-fit divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card shadow-card">
          {admins.map((admin) => (
            <li key={admin.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink-2">
                  {admin.name}
                  {admin.id === me.id && <span className="ml-2 text-sm font-normal text-subtle">(you)</span>}
                </p>
                <p className="truncate text-sm text-subtle">
                  {admin.email} · added {formatPostDate(admin.created_at.slice(0, 10))}
                </p>
              </div>
              {admin.id !== me.id && <RemoveAdminButton id={admin.id} name={admin.name} />}
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6">
          <h2 className="text-xl font-bold text-ink-2">Add an admin</h2>
          <p className="mt-1 mb-5 text-sm text-subtle">Share the password with them privately.</p>
          <AddAdminForm />
        </div>
      </div>
    </div>
  );
}
