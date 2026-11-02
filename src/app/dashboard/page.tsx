import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { AdminLoading, AdminNav } from "@/components/admin/admin-nav";
import { ImportPostsButton, PostActions } from "@/components/admin/post-actions";
import { buttonClass } from "@/components/ui/button";
import { formatPostDate } from "@/content/blogs";
import { requireAdmin } from "@/lib/admin/session";
import { listAllPosts } from "@/lib/blog/posts";

export const metadata: Metadata = { title: "Posts" };

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <PostsDashboard />
    </Suspense>
  );
}

async function PostsDashboard() {
  const admin = await requireAdmin();
  const posts = await listAllPosts();
  const published = posts.filter((post) => post.status === "published").length;

  return (
    <div className="container-page">
      <AdminNav admin={admin} active="posts" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Blog posts</h1>
          <p className="mt-1 text-subtle">
            {posts.length} {posts.length === 1 ? "post" : "posts"} · {published} published · {posts.length - published} draft
          </p>
        </div>
        <Link href="/dashboard/posts/new" className={buttonClass("primary")}>
          <Plus className="size-5" aria-hidden />
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line-strong bg-card px-6 py-12 text-center">
          <p className="text-lg text-ink-2">No posts yet.</p>
          <p className="mx-auto mt-2 max-w-[520px] text-subtle">
            The public blog is empty until you publish a post. Start from scratch, or import the 3 posts the site shipped with.
          </p>
          <div className="mt-6 flex justify-center">
            <ImportPostsButton />
          </div>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card shadow-card">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
              {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
              <img src={post.cardImage.src} alt="" className="hidden aspect-[410/259] w-28 shrink-0 rounded-lg object-cover sm:block" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/dashboard/posts/${post.id}`} className="text-lg font-bold text-ink-2 hover:text-accent">
                    {post.title}
                  </Link>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      post.status === "published" ? "bg-success-soft text-success" : "bg-surface text-subtle ring-1 ring-line"
                    }`}
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-subtle">
                  /blogs/{post.slug} · {formatPostDate(post.publishedAt)}
                </p>
              </div>
              <PostActions id={post.id} slug={post.slug} title={post.title} status={post.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
