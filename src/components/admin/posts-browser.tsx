"use client";

import Link from "next/link";
import { useState } from "react";
import { FileCheck2, FilePen, Files, LayoutGrid, List, Search, X } from "lucide-react";
import type { BlogImage } from "@/content/blogs";
import type { PostStatus } from "@/lib/blog/posts";
import { ImportPostsButton, PostActions } from "./post-actions";
import { Chip, iconButton, tableHead } from "./ui";

export interface PostSummary {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  /** Already formatted for display. */
  publishedLabel: string;
  updatedLabel: string;
  image: BlogImage;
}

const tabs = [
  { key: "all", label: "All posts", icon: Files },
  { key: "published", label: "Published", icon: FileCheck2 },
  { key: "draft", label: "Drafts", icon: FilePen },
] as const;

type Tab = (typeof tabs)[number]["key"];

/** Posts list with status tabs, search and a table/grid switch. */
export function PostsBrowser({ posts }: { posts: PostSummary[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const shown = posts.filter(
    (post) => (tab === "all" || post.status === tab) && (!needle || post.title.toLowerCase().includes(needle) || post.slug.includes(needle)),
  );
  const count = (key: Tab) => (key === "all" ? posts.length : posts.filter((post) => post.status === key).length);

  if (posts.length === 0) {
    return (
      <div className="rounded-[6px] border border-dashed border-line-strong px-6 py-14 text-center">
        <p className="text-base font-semibold text-ink">No posts yet</p>
        <p className="mx-auto mt-1 max-w-[460px] text-sm text-subtle">
          The public blog is empty until you publish a post. Start from scratch, or import the 3 posts the site shipped with.
        </p>
        <div className="mt-6 flex justify-center">
          <ImportPostsButton />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter posts">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`inline-flex h-10 items-center gap-2 rounded-[6px] px-4 text-sm font-semibold transition-colors ${
                tab === key ? "bg-primary text-white" : "bg-surface text-ink hover:bg-line"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
              <span className={`text-xs ${tab === key ? "text-white/80" : "text-subtle"}`}>{count(key)}</span>
            </button>
          ))}
        </div>

        <div className="ms-auto flex items-center gap-2">
          {searching ? (
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-accent" aria-hidden />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Escape" && (setQuery(""), setSearching(false))}
                placeholder="Search posts…"
                aria-label="Search posts"
                className="h-10 w-52 rounded-[6px] border border-line bg-card ps-9 pe-9 text-sm text-ink placeholder:text-faint focus:border-primary focus:outline-none sm:w-64"
              />
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearching(false);
                }}
                aria-label="Close search"
                className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded text-subtle hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setSearching(true)} aria-label="Search posts" title="Search" className={iconButton("default", "size-10 border border-line text-accent")}>
              <Search className="size-[18px]" aria-hidden />
            </button>
          )}
          <div className="flex rounded-[6px] border border-line p-0.5" role="group" aria-label="Layout">
            {(
              [
                ["list", List, "Table view"],
                ["grid", LayoutGrid, "Card view"],
              ] as const
            ).map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                aria-pressed={view === value}
                aria-label={label}
                title={label}
                className={iconButton(view === value ? "active" : "default", "size-[34px]")}
              >
                <Icon className="size-[18px]" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-[6px] border border-line px-4 py-10 text-center text-sm text-subtle">No posts match.</p>
      ) : view === "list" ? (
        <PostsTable posts={shown} />
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((post) => (
            <li key={post.id} className="flex flex-col overflow-hidden rounded-[8px] border border-line bg-card">
              <Link href={`/dashboard/posts/${post.id}`} tabIndex={-1} aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img src={post.image.src} alt="" className="aspect-[410/230] w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/dashboard/posts/${post.id}`} className="text-[15px] leading-snug font-semibold text-ink hover:text-accent">
                    {post.title}
                  </Link>
                  <StatusChip status={post.status} />
                </div>
                <p className="text-[13px] text-subtle">
                  {post.publishedLabel} · updated {post.updatedLabel}
                </p>
                <div className="mt-auto border-t border-line pt-3">
                  <PostActions id={post.id} slug={post.slug} title={post.title} status={post.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const columns = "md:grid-cols-[minmax(0,2.2fr)_minmax(110px,0.8fr)_minmax(110px,0.8fr)_minmax(110px,0.8fr)_auto]";

function PostsTable({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-[6px] border border-line">
      <div className={`hidden gap-4 px-5 py-4 md:grid ${columns} ${tableHead}`}>
        <span>Post</span>
        <span>Status</span>
        <span>Published</span>
        <span>Updated</span>
        <span className="w-[156px]">Actions</span>
      </div>
      <ul className="divide-y divide-line">
        {posts.map((post) => (
          <li key={post.id} className={`grid gap-3 px-5 py-4 transition-colors hover:bg-surface/50 md:items-center md:gap-4 ${columns}`}>
            <div className="flex min-w-0 items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
              <img src={post.image.src} alt="" className="size-12 shrink-0 rounded-[8px] border border-line object-cover" />
              <div className="min-w-0">
                <Link href={`/dashboard/posts/${post.id}`} className="block truncate text-base font-semibold text-ink hover:text-accent">
                  {post.title}
                </Link>
                <p className="truncate text-[13px] text-subtle">/blogs/{post.slug}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 md:block">
              <StatusChip status={post.status} />
              <span className="text-[13px] text-subtle md:hidden">{post.publishedLabel}</span>
            </div>
            <span className="hidden text-[15px] text-body md:block">{post.publishedLabel}</span>
            <span className="hidden text-[15px] text-body md:block">{post.updatedLabel}</span>
            <PostActions id={post.id} slug={post.slug} title={post.title} status={post.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusChip({ status }: { status: PostStatus }) {
  return <Chip tone={status === "published" ? "success" : "neutral"}>{status === "published" ? "Published" : "Draft"}</Chip>;
}
