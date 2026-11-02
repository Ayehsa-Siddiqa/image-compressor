import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s · Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/dashboard">) {
  return <div className="min-h-[60vh] bg-surface py-8 sm:py-10">{children}</div>;
}
