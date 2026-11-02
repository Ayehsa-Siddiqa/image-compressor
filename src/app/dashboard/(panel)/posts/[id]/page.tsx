import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostEditor } from "@/components/admin/post-editor";
import { PageSkeleton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { blocksToMarkdown } from "@/lib/blog/markdown";
import { getPostById } from "@/lib/blog/posts";

export const metadata: Metadata = { title: "Edit post" };

export default function EditPostPage({ params, searchParams }: PageProps<"/dashboard/posts/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditPost params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditPost({ params, searchParams }: PageProps<"/dashboard/posts/[id]">) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const post = await getPostById(id);
  if (!post) notFound();
  return <PostEditor post={post} initialBody={blocksToMarkdown(post.body)} created={query.created === "1"} />;
}
