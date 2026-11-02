import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostEditor } from "@/components/admin/post-editor";
import { PageSkeleton } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { blocksToEditorContent } from "@/lib/blog/html";
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
  // Posts written before the rich text editor (e.g. the imported ones) are converted when opened.
  const legacy = post.contentHtml ? null : blocksToEditorContent(post.body);
  return (
    <PostEditor
      post={post}
      initialHtml={post.contentHtml ?? legacy!.html}
      initialFaq={post.faq ?? legacy?.faq ?? null}
      created={query.created === "1"}
    />
  );
}
