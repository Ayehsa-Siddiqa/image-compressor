import type { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { AddAdminForm, RemoveAdminButton } from "@/components/admin/admin-accounts";
import { initials } from "@/components/admin/initials";
import { Card, Chip, PageBody, PageHeader, PageSkeleton } from "@/components/admin/ui";
import { formatPostDate } from "@/content/blogs";
import { requireAdmin } from "@/lib/admin/session";
import { getSupabase } from "@/lib/supabase";

export const metadata: Metadata = { title: "Admins" };

export default function AdminsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
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
    <>
      <PageHeader title="Admins" icon={Users} subtitle={`${admins.length} with access`} />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card title="People with access" description="Everyone here can sign in at /dashboard and edit every post." className="h-fit overflow-hidden">
            <ul className="divide-y divide-line">
              {admins.map((admin) => (
                <li key={admin.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-accent">{initials(admin.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium text-ink">
                      {admin.name}
                      {admin.id === me.id && <Chip tone="primary">You</Chip>}
                    </p>
                    <p className="truncate text-xs text-subtle">
                      {admin.email} · added {formatPostDate(admin.created_at.slice(0, 10))}
                    </p>
                  </div>
                  {admin.id !== me.id && <RemoveAdminButton id={admin.id} name={admin.name} />}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Add an admin" description="Share the password with them privately." className="h-fit">
            <div className="p-4">
              <AddAdminForm />
            </div>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
