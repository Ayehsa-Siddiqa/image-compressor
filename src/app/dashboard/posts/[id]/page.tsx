import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminLoading, AdminNav } from "@/components/admin/admin-nav";
import { PostEditor } from "@/components/admin/post-editor";
import { requireAdmin } from "@/lib/admin/session";
import { blocksToMarkdown } from "@/lib/blog/markdown";
import { getPostById } from "@/lib/blog/posts";

export const metadata: Metadata = { title: "Edit post" };

// Post ids aren't known at build time, so the page (and the site header's current-path check) renders per request.
export const instant = false;

export default function EditPostPage({ params, searchParams }: PageProps<"/dashboard/posts/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditPost params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditPost({ params, searchParams }: PageProps<"/dashboard/posts/[id]">) {
  const admin = await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="container-page">
      <AdminNav admin={admin} active="posts" />
      <h1 className="mb-6 font-display text-3xl font-bold text-ink sm:text-4xl">Edit post</h1>
      <PostEditor post={post} initialBody={blocksToMarkdown(post.body)} created={query.created === "1"} />
    </div>
  );
}
