"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Download, Eye, EyeOff, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { deletePost, importBuiltInPosts, setPostStatus } from "@/lib/admin/actions";
import type { PostStatus } from "@/lib/blog/posts";
import { buttonClass } from "@/components/ui/button";

export const smallButton =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm text-body transition-colors hover:bg-surface disabled:opacity-50";

export function PostActions({ id, slug, title, status }: { id: string; slug: string; title: string; status: PostStatus }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const run = (action: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      setError((await action()).error);
    });

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Link href={`/dashboard/posts/${id}`} className={smallButton}>
          <Pencil className="size-3.5" aria-hidden />
          Edit
        </Link>
        {status === "published" && (
          <Link href={`/blogs/${slug}`} target="_blank" className={smallButton}>
            <Eye className="size-3.5" aria-hidden />
            View
          </Link>
        )}
        <button
          type="button"
          className={smallButton}
          disabled={pending}
          onClick={() => run(() => setPostStatus(id, status === "published" ? "draft" : "published"))}
        >
          {status === "published" ? <EyeOff className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
          {status === "published" ? "Unpublish" : "Publish"}
        </button>
        <button
          type="button"
          className={`${smallButton} text-danger hover:border-danger`}
          disabled={pending}
          aria-label={`Delete ${title}`}
          onClick={() => {
            if (confirm(`Delete “${title}”? This can't be undone.`)) run(() => deletePost(id));
          }}
        >
          {pending ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : <Trash2 className="size-3.5" aria-hidden />}
          Delete
        </button>
      </div>
      {error && (
        <p className="text-sm text-danger" role="alert">
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
        className={buttonClass("primary")}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError((await importBuiltInPosts()).error);
          })
        }
      >
        {pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Download className="size-5" aria-hidden />}
        Import the 3 existing posts
      </button>
      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
