"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { ArrowLeft, FileText, ImagePlus, LoaderCircle, Save, X } from "lucide-react";
import { savePost } from "@/lib/admin/actions";
import { initialFormState } from "@/lib/forms/types";
import type { BlogImage, PostFaq } from "@/content/blogs";
import type { AdminPost } from "@/lib/blog/posts";
import { FormAlert, TextAreaField, TextField } from "@/components/forms/fields";
import { FaqEditor } from "./faq-editor";
import { RichTextEditor } from "./rich-text-editor";
import { SeoFields } from "./seo-fields";
import { Card, PageBody, PageHeader, dashButton, iconButton } from "./ui";
import { uploadImageFile } from "./upload-image";

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
  /** The article as editor HTML (older posts are converted on the server). */
  initialHtml?: string;
  initialFaq?: PostFaq | null;
  /** Just created: show a confirmation. */
  created?: boolean;
}

export function PostEditor({ post, initialHtml = "", initialFaq = null, created }: PostEditorProps) {
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
  const [description, setDescription] = useState(post?.description ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");

  return (
    <form action={formAction} noValidate className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="id" value={post?.id ?? ""} />

      <PageHeader
        title={post ? "Edit post" : "New post"}
        icon={FileText}
        subtitle={post ? post.title : undefined}
        actions={
          <>
            <Link href="/dashboard" className={iconButton("default", "size-10 border border-line")} aria-label="All posts" title="All posts">
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
            <select
              name="status"
              aria-label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
              className="h-10 rounded-[6px] border border-line bg-card px-3 text-sm font-medium text-ink focus:border-primary focus:outline-none"
            >
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
            </select>
            <button type="submit" className={dashButton("primary")} disabled={pending}>
              {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
              {pending ? "Saving…" : "Save"}
            </button>
          </>
        }
      />

      <PageBody>
        <FormAlert status={state.status} message={state.message} />

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4">
            <Card title="Post">
              <div className="space-y-5 p-4">
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
                  label="Summary"
                  name="description"
                  required
                  maxLength={300}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  hint="One or two sentences about the post. Also used as the meta description unless you set one under SEO."
                  error={errors.description}
                  className="min-h-[96px]"
                />
              </div>
            </Card>

            <Card title="Article">
              <div className="p-4">
                <RichTextEditor name="body" initialHtml={initialHtml} error={errors.body} />
                {errors.body && <p className="mt-1.5 text-sm text-danger">{errors.body}</p>}
              </div>
            </Card>

            <Card title="FAQ" description="Optional questions and answers shown after the article. Google can show them in search results.">
              <div className="p-4">
                <FaqEditor name="faq" initial={initialFaq} error={errors.faq} />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card title="Publishing">
              <div className="space-y-5 p-4">
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
            </Card>

            <Card title="Images">
              <div className="space-y-5 p-4">
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
            </Card>

            <Card title="SEO" description="How the post appears in Google and when shared.">
              <div className="p-4">
                <SeoFields
                  initial={post?.seo}
                  fallbackTitle={title}
                  fallbackDescription={description}
                  slug={slug}
                  errors={errors}
                  imagePicker={
                    <ImagePicker
                      name="seoImage"
                      label="Social share image"
                      optional
                      hint="Shown on WhatsApp, Facebook, X and LinkedIn. Uses the main image if empty. Best at 1200 × 630."
                      initial={post?.seo?.ogImage ?? undefined}
                    />
                  }
                />
              </div>
            </Card>
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
    setUploading(true);
    const result = await uploadImageFile(file);
    setUploading(false);
    if (result.image) setImage(result.image);
    else setUploadError(result.error);
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
        className={`relative grid aspect-[16/9] cursor-pointer place-items-center overflow-hidden rounded-[6px] border border-dashed bg-surface text-center text-sm text-subtle transition-colors hover:border-primary ${
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
