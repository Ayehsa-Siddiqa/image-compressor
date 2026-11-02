import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading, AdminNav } from "@/components/admin/admin-nav";
import { PostEditor } from "@/components/admin/post-editor";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <NewPost />
    </Suspense>
  );
}

async function NewPost() {
  const admin = await requireAdmin();
  return (
    <div className="container-page">
      <AdminNav admin={admin} active="posts" />
      <h1 className="mb-6 font-display text-3xl font-bold text-ink sm:text-4xl">New post</h1>
      <PostEditor />
    </div>
  );
}
