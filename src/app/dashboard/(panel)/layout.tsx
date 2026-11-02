import { Suspense, type ReactNode } from "react";
import { DashboardShell } from "@/components/admin/dashboard-shell";
import { PageSkeleton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";

/** Signed-in dashboard pages: sidebar + content panel. (The login page sits outside this group.) */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Panel>{children}</Panel>
    </Suspense>
  );
}

async function Panel({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return <DashboardShell admin={admin}>{children}</DashboardShell>;
}

function ShellSkeleton() {
  return (
    <div className="flex h-dvh bg-surface">
      <div className="hidden w-[230px] shrink-0 animate-pulse space-y-2 p-2 sm:block">
        <div className="h-8 rounded-lg bg-line" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[34px] rounded-lg bg-line/60" />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col sm:py-2 sm:pe-2">
        <div className="flex min-h-0 flex-1 flex-col bg-card sm:rounded-[6px] sm:border sm:border-line">
          <PageSkeleton />
        </div>
      </div>
    </div>
  );
}
