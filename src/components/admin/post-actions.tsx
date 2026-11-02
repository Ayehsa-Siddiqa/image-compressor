"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Download, ExternalLink, Eye, EyeOff, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { deletePost, importBuiltInPosts, setPostStatus } from "@/lib/admin/actions";
import type { PostStatus } from "@/lib/blog/posts";
import { dashButton, iconButton } from "./ui";

export function PostActions({ id, slug, title, status }: { id: string; slug: string; title: string; status: PostStatus }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const published = status === "published";

  const run = (action: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      setError((await action()).error);
    });

  return (
    <div className="flex flex-col items-start gap-1 md:items-end">
      <div className="flex items-center gap-1">
        <Link href={`/dashboard/posts/${id}`} className={iconButton()} aria-label={`Edit ${title}`} title="Edit">
          <Pencil className="size-[18px]" aria-hidden />
        </Link>
        <button
          type="button"
          className={iconButton()}
          disabled={pending}
          aria-label={`${published ? "Unpublish" : "Publish"} ${title}`}
          title={published ? "Unpublish (hide from the blog)" : "Publish"}
          onClick={() => run(() => setPostStatus(id, published ? "draft" : "published"))}
        >
          {published ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
        </button>
        {published ? (
          <Link href={`/blogs/${slug}`} target="_blank" className={iconButton()} aria-label={`View ${title} on the site`} title="View on site">
            <ExternalLink className="size-[18px]" aria-hidden />
          </Link>
        ) : (
          <span className={iconButton("default", "pointer-events-none opacity-30")} aria-hidden>
            <ExternalLink className="size-[18px]" />
          </span>
        )}
        <button
          type="button"
          className={iconButton("danger")}
          disabled={pending}
          aria-label={`Delete ${title}`}
          title="Delete"
          onClick={() => {
            if (confirm(`Delete “${title}”? This can't be undone.`)) run(() => deletePost(id));
          }}
        >
          {pending ? <LoaderCircle className="size-[18px] animate-spin" aria-hidden /> : <Trash2 className="size-[18px]" aria-hidden />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ImportPostsButton() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  return (
    <div>
      <button
        type="button"
        className={dashButton("primary")}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError((await importBuiltInPosts()).error);
          })
        }
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Download className="size-4" aria-hidden />}
        Import the 3 existing posts
      </button>
      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
