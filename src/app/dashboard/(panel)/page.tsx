import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, FileText, Plus } from "lucide-react";
import { ImportPostsButton, PostActions } from "@/components/admin/post-actions";
import { Card, Chip, PageBody, PageHeader, PageSkeleton, StatTile, dashButton } from "@/components/admin/ui";
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
  const published = posts.filter((post) => post.status === "published").length;

  return (
    <>
      <PageHeader
        title="Blog posts"
        icon={FileText}
        subtitle={`${posts.length} ${posts.length === 1 ? "post" : "posts"}`}
        actions={
          <>
            <Link href="/blogs" target="_blank" className={dashButton("secondary", "sm", "hidden sm:inline-flex")}>
              <ExternalLink className="size-3.5 text-accent" aria-hidden />
              View blog
            </Link>
            <Link href="/dashboard/posts/new" className={dashButton("primary", "sm")}>
              <Plus className="size-3.5" aria-hidden />
              New post
            </Link>
          </>
        }
      />
      <PageBody>
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Total" value={posts.length} />
          <StatTile label="Published" value={published} />
          <StatTile label="Drafts" value={posts.length - published} />
        </div>

        {posts.length === 0 ? (
          <Card className="mt-4 px-6 py-12 text-center">
            <p className="text-[15px] font-semibold text-ink">No posts yet</p>
            <p className="mx-auto mt-1 max-w-[460px] text-[13px] text-subtle">
              The public blog is empty until you publish a post. Start from scratch, or import the 3 posts the site shipped with.
            </p>
            <div className="mt-5 flex justify-center">
              <ImportPostsButton />
            </div>
          </Card>
        ) : (
          <Card className="mt-4 overflow-hidden">
            <div className="hidden grid-cols-[minmax(0,1fr)_110px_120px_auto] gap-4 border-b border-line bg-surface px-4 py-2.5 text-[11px] font-medium tracking-wide text-subtle uppercase md:grid">
              <span>Post</span>
              <span>Status</span>
              <span>Date</span>
              <span className="text-right">Actions</span>
            </div>
            <ul className="divide-y divide-line">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="grid gap-3 px-4 py-3 transition-colors hover:bg-surface/60 md:grid-cols-[minmax(0,1fr)_110px_120px_auto] md:items-center md:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
                    <img src={post.cardImage.src} alt="" className="aspect-[410/259] w-16 shrink-0 rounded-[4px] border border-line object-cover" />
                    <div className="min-w-0">
                      <Link href={`/dashboard/posts/${post.id}`} className="block truncate text-sm font-medium text-ink hover:text-accent">
                        {post.title}
                      </Link>
                      <p className="truncate text-xs text-subtle">/blogs/{post.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:block">
                    <Chip tone={post.status === "published" ? "success" : "neutral"}>{post.status === "published" ? "Published" : "Draft"}</Chip>
                    <span className="text-xs text-subtle md:hidden">{formatPostDate(post.publishedAt)}</span>
                  </div>
                  <span className="hidden text-[13px] text-subtle md:block">{formatPostDate(post.publishedAt)}</span>
                  <PostActions id={post.id} slug={post.slug} title={post.title} status={post.status} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </PageBody>
    </>
  );
}
