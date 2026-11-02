import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FileText, Plus } from "lucide-react";
import { PostsBrowser } from "@/components/admin/posts-browser";
import { PageBody, PageHeader, PageSkeleton, dashButton } from "@/components/admin/ui";
import { formatPostDate } from "@/content/blogs";
import { requireAdmin } from "@/lib/admin/session";
import { listAllPosts } from "@/lib/blog/posts";

export const metadata: Metadata = { title: "Posts" };

export default function PostsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Posts />
    </Suspense>
  );
}

async function Posts() {
  await requireAdmin();
  const posts = await listAllPosts();

  return (
    <>
      <PageHeader
        title="Blog posts"
        icon={FileText}
        actions={
          <Link href="/dashboard/posts/new" className={dashButton("outline")}>
            <Plus className="size-[18px]" aria-hidden />
            New post
          </Link>
        }
      />
      <PageBody>
        <PostsBrowser
          posts={posts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            status: post.status,
            publishedLabel: formatPostDate(post.publishedAt),
            updatedLabel: formatPostDate(post.updatedAt.slice(0, 10)),
            image: post.cardImage,
          }))}
        />
      </PageBody>
    </>
  );
}
