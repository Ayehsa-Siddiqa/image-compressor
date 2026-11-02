"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Download, Eye, EyeOff, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { deletePost, importBuiltInPosts, setPostStatus } from "@/lib/admin/actions";
import type { PostStatus } from "@/lib/blog/posts";
import { dashButton } from "./ui";

export function PostActions({ id, slug, title, status }: { id: string; slug: string; title: string; status: PostStatus }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const run = (action: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      setError((await action()).error);
    });

  return (
    <div className="flex flex-col items-start gap-1 md:items-end">
      <div className="flex flex-wrap gap-1.5">
        <Link href={`/dashboard/posts/${id}`} className={dashButton("secondary")}>
          <Pencil className="size-3.5 text-accent" aria-hidden />
          Edit
        </Link>
        <button
          type="button"
          className={dashButton("secondary")}
          disabled={pending}
          onClick={() => run(() => setPostStatus(id, status === "published" ? "draft" : "published"))}
        >
          {status === "published" ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
          {status === "published" ? "Unpublish" : "Publish"}
        </button>
        {status === "published" && (
          <Link href={`/blogs/${slug}`} target="_blank" className={dashButton("secondary", "icon")} aria-label={`View ${title}`} title="View on site">
            <Eye className="size-3.5" aria-hidden />
          </Link>
        )}
        <button
          type="button"
          className={dashButton("danger", "icon")}
          disabled={pending}
          aria-label={`Delete ${title}`}
          title="Delete"
          onClick={() => {
            if (confirm(`Delete “${title}”? This can't be undone.`)) run(() => deletePost(id));
          }}
        >
          {pending ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : <Trash2 className="size-3.5" aria-hidden />}
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
        className={dashButton("primary", "md")}
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
