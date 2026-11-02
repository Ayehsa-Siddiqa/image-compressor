"use client";

import Link from "next/link";
import { useActionState, useId, useMemo, useState } from "react";
import { ArrowLeft, FileText, ImagePlus, LoaderCircle, Save, X } from "lucide-react";
import { savePost, uploadBlogImage } from "@/lib/admin/actions";
import { MAX_IMAGE_BYTES } from "@/lib/blog/limits";
import { markdownToBlocks } from "@/lib/blog/markdown";
import { initialFormState } from "@/lib/forms/types";
import type { BlogImage } from "@/content/blogs";
import type { AdminPost } from "@/lib/blog/posts";
import { ArticleBody } from "@/components/blog/article-body";
import { FormAlert, TextAreaField, TextField } from "@/components/forms/fields";
import { PageBody, PageHeader, dashButton } from "./ui";

const slugify = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const today = () => new Date().toISOString().slice(0, 10);

interface PostEditorProps {
  post?: AdminPost;
  /** The post's body as editor Markdown (converted on the server). */
  initialBody?: string;
  /** Just created: show a confirmation. */
  created?: boolean;
}

export function PostEditor({ post, initialBody = "", created }: PostEditorProps) {
  const [state, formAction, pending] = useActionState(
    savePost,
    created ? { status: "success" as const, message: "Post created." } : initialFormState,
  );
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  // New posts follow the title until the slug is edited by hand; existing URLs never change on their own.
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const preview = useMemo(() => (tab === "preview" ? markdownToBlocks(body) : null), [tab, body]);

  return (
    <form action={formAction} noValidate className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="id" value={post?.id ?? ""} />

      <PageHeader
        title={post ? "Edit post" : "New post"}
        icon={FileText}
        subtitle={post ? post.title : undefined}
        actions={
          <>
            <Link href="/dashboard" className={dashButton("secondary", "icon")} aria-label="All posts" title="All posts">
              <ArrowLeft className="size-3.5" aria-hidden />
            </Link>
            <select
              name="status"
              aria-label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
              className="h-[33px] rounded-[6px] border border-line bg-card px-2 text-xs font-medium text-ink focus:border-primary focus:outline-none"
            >
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
            </select>
            <button type="submit" className={dashButton("primary")} disabled={pending}>
              {pending ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden /> : <Save className="size-3.5" aria-hidden />}
              {pending ? "Saving…" : "Save"}
            </button>
          </>
        }
      />

      <PageBody>
        <FormAlert status={state.status} message={state.message} />

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5 rounded-[6px] border border-line bg-card p-4">
            <TextField
              label="Title"
              name="title"
              required
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!slugTouched) setSlug(slugify(event.target.value));
              }}
              error={errors.title}
            />
            <TextField
              label="URL slug"
              name="slug"
              required
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              hint={`Address: /blogs/${slug || "…"}`}
              error={errors.slug}
            />
            <TextAreaField
              label="Description"
              name="description"
              required
              maxLength={300}
              defaultValue={values.description ?? post?.description}
              hint="One or two sentences. Shown in search results and link previews."
              error={errors.description}
              className="min-h-[96px]"
            />

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink-2 sm:text-[15px]" id="body-label">
                  Article
                </span>
                <div className="flex rounded-lg border border-line p-0.5 text-sm" role="tablist" aria-label="Article editor">
                  {(["write", "preview"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={tab === value}
                      onClick={() => setTab(value)}
                      className={`rounded-md px-3 py-1 capitalize ${tab === value ? "bg-primary-soft font-bold text-accent" : "text-body"}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              {/* The textarea stays mounted (hidden in preview) so its value is always submitted. */}
              <textarea
                name="body"
                aria-labelledby="body-label"
                aria-invalid={errors.body ? true : undefined}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                hidden={tab === "preview"}
                spellCheck
                className={`block min-h-[460px] w-full resize-y rounded-[10px] border bg-card px-4 py-3 font-mono text-sm leading-relaxed text-ink-2 focus:border-primary focus:shadow-[0_0_0_3px_rgb(37_99_235/0.15)] focus:outline-none ${
                  errors.body ? "border-danger" : "border-line-strong"
                }`}
                placeholder={"Intro paragraph…\n\n## A section heading\n\nSome text with **bold** and a [link](/blogs).\n\n- A list item\n- Another item"}
              />
              {tab === "preview" && preview && (
                <div className="min-h-[460px] rounded-[10px] border border-line-strong bg-card px-5 py-4">
                  {preview.error ? (
                    <p className="text-danger">{preview.error}</p>
                  ) : preview.blocks.length === 0 ? (
                    <p className="text-faint">Nothing to preview yet.</p>
                  ) : (
                    <ArticleBody blocks={preview.blocks} />
                  )}
                </div>
              )}
              {errors.body && <p className="mt-1.5 text-sm text-danger">{errors.body}</p>}
              <details className="mt-3 text-sm text-subtle">
                <summary className="cursor-pointer text-accent">Formatting help</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    <code>## Heading</code> for a section, <code>### Heading</code> for a sub-heading
                  </li>
                  <li>Lines next to each other form one paragraph group; leave a blank line to add space before the next one</li>
                  <li>
                    <code>- item</code> on consecutive lines makes a bulleted list
                  </li>
                  <li>
                    <code>**bold**</code> and <code>[link text](/blogs/some-post)</code> inside any text
                  </li>
                  <li>
                    FAQ: <code>:::faq Title</code>, then a subtitle line, then <code>Q: …</code> / <code>A: …</code> pairs, and a closing <code>:::</code>
                  </li>
                </ul>
              </details>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-5 rounded-[6px] border border-line bg-card p-4">
              <TextField
                label="Publish date"
                name="publishedAt"
                type="date"
                required
                defaultValue={values.publishedAt ?? post?.publishedAt ?? today()}
                error={errors.publishedAt}
              />
              <TextField
                label="Card title"
                name="cardTitle"
                optional
                defaultValue={values.cardTitle ?? (post && post.cardTitle !== post.title ? post.cardTitle : "")}
                hint="Shorter title for blog cards. Uses the title if empty."
                error={errors.cardTitle}
              />
            </div>

            <div className="space-y-5 rounded-[6px] border border-line bg-card p-4">
              <ImagePicker name="heroImage" label="Main image" initial={post?.heroImage} error={errors.heroImage} />
              <TextField
                label="Main image description"
                name="heroImageAlt"
                required
                defaultValue={values.heroImageAlt ?? post?.heroImageAlt}
                hint="Alt text: what the image shows."
                error={errors.heroImageAlt}
              />
              <ImagePicker
                name="cardImage"
                label="Card image"
                optional
                hint="Shown on blog cards. Uses the main image if empty."
                initial={post && post.cardImage.src !== post.heroImage.src ? post.cardImage : undefined}
              />
              <input type="hidden" name="cardImageAlt" value={post?.cardImageAlt ?? ""} />
            </div>
          </div>
        </div>
      </PageBody>
    </form>
  );
}

interface ImagePickerProps {
  name: string;
  label: string;
  initial?: BlogImage;
  optional?: boolean;
  hint?: string;
  error?: string;
}

/** Uploads the chosen image straight away and submits its stored URL and size with the form. */
function ImagePicker({ name, label, initial, optional, hint, error }: ImagePickerProps) {
  const id = useId();
  const [image, setImage] = useState<BlogImage | null>(initial ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const message = uploadError ?? error;

  async function upload(file: File) {
    setUploadError(undefined);
    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Images can be up to 4 MB. Compress it on the home page first.");
      return;
    }
    setUploading(true);
    try {
      const { width, height } = await measure(file);
      const data = new FormData();
      data.set("file", file);
      data.set("width", String(width));
      data.set("height", String(height));
      const result = await uploadBlogImage(data);
      if (result.image) setImage(result.image);
      else setUploadError(result.error);
    } catch {
      setUploadError("Couldn't read this image. Try a JPG, PNG or WebP.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-ink-2 sm:text-[15px]">
          {label}
          {optional && <span className="ml-1 font-normal text-faint">(optional)</span>}
        </span>
        {image && optional && (
          <button type="button" onClick={() => setImage(null)} className="inline-flex items-center gap-1 text-sm text-subtle hover:text-danger">
            <X className="size-3.5" aria-hidden />
            Remove
          </button>
        )}
      </div>
      <input type="hidden" name={name} value={image ? JSON.stringify(image) : ""} />
      <label
        htmlFor={id}
        className={`relative grid aspect-[16/9] cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed bg-surface text-center text-sm text-subtle transition-colors hover:border-primary ${
          message ? "border-danger" : "border-line-strong"
        }`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview of an uploaded image
          <img src={image.src} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 p-4">
            <ImagePlus className="size-6" aria-hidden />
            Choose an image (max 4 MB)
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 grid place-items-center bg-black/50 text-white">
            <LoaderCircle className="size-6 animate-spin" aria-label="Uploading" />
          </span>
        )}
      </label>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="sr-only"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      {image && !uploading && (
        <p className="mt-1.5 text-sm text-faint">
          {image.width} × {image.height} px · click to replace
        </p>
      )}
      {message ? <p className="mt-1.5 text-sm text-danger">{message}</p> : hint && !image && <p className="mt-1.5 text-sm text-faint">{hint}</p>}
    </div>
  );
}

function measure(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  return img
    .decode()
    .then(() => ({ width: img.naturalWidth, height: img.naturalHeight }))
    .finally(() => URL.revokeObjectURL(url));
}
