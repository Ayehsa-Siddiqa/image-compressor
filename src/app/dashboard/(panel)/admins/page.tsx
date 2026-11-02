import type { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { AddAdminForm, RemoveAdminButton } from "@/components/admin/admin-accounts";
import { initials } from "@/components/admin/initials";
import { Card, Chip, PageBody, PageHeader, PageSkeleton, tableHead } from "@/components/admin/ui";
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

const columns = "md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(100px,0.7fr)_100px]";

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
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-fit overflow-hidden rounded-[6px] border border-line">
            <div className={`hidden gap-4 px-5 py-4 md:grid ${columns} ${tableHead}`}>
              <span>Admin</span>
              <span>Email</span>
              <span>Added</span>
              <span>Actions</span>
            </div>
            <ul className="divide-y divide-line">
              {admins.map((admin) => (
                <li key={admin.id} className={`grid gap-2 px-5 py-4 md:items-center md:gap-4 ${columns}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-white">{initials(admin.name)}</span>
                    <span className="truncate text-base font-semibold text-ink">{admin.name}</span>
                    {admin.id === me.id && <Chip tone="primary">You</Chip>}
                  </div>
                  <span className="truncate text-[15px] text-body">{admin.email}</span>
                  <span className="text-[15px] text-body">{formatPostDate(admin.created_at.slice(0, 10))}</span>
                  <div>{admin.id !== me.id && <RemoveAdminButton id={admin.id} name={admin.name} />}</div>
                </li>
              ))}
            </ul>
          </div>

          <Card title="Add an admin" description="They can sign in at /dashboard. Share the password privately." className="h-fit">
            <div className="p-4">
              <AddAdminForm />
            </div>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
