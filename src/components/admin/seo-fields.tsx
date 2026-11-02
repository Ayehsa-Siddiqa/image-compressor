"use client";

import { useState, type ReactNode } from "react";
import type { PostSeo } from "@/content/blogs";
import { siteConfig } from "@/config/site";

const input =
  "block w-full rounded-[6px] border bg-card px-3 text-sm text-ink placeholder:text-faint focus:border-primary focus:outline-none";

type SeoField = "seoTitle" | "seoDescription" | "seoKeywords" | "seoCanonical";

interface SeoFieldsProps {
  initial?: PostSeo;
  /** The post's own title, summary and address, used when the SEO fields are left empty. */
  fallbackTitle: string;
  fallbackDescription: string;
  slug: string;
  errors: Partial<Record<SeoField, string>>;
  /** Picker for the social share image (rendered by the editor so it can reuse its image picker). */
  imagePicker: ReactNode;
}

/** Search and social settings for one post, with a live Google result preview. */
export function SeoFields({ initial, fallbackTitle, fallbackDescription, slug, errors, imagePicker }: SeoFieldsProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  // Controlled so a failed save (which resets the form) keeps what was typed.
  const [keywords, setKeywords] = useState(initial?.keywords?.join(", ") ?? "");
  const [canonical, setCanonical] = useState(initial?.canonical ?? "");
  const [noindex, setNoindex] = useState(Boolean(initial?.noindex));
  const shownTitle = `${title || fallbackTitle || "Post title"} | ${siteConfig.name}`;
  const shownDescription = description || fallbackDescription || "The meta description appears here.";

  return (
    <div className="space-y-4">
      <div className="rounded-[6px] border border-line bg-surface/50 p-4" aria-label="Google preview">
        <p className="text-[11px] font-semibold tracking-wider text-subtle uppercase">Google preview</p>
        <p className="mt-2 truncate text-xs text-subtle">
          {siteConfig.name.toLowerCase()} › blogs › {slug || "…"}
        </p>
        <p className="mt-0.5 line-clamp-1 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{shownTitle}</p>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-body">{shownDescription}</p>
      </div>

      <Field label="SEO title" hint="Shown as the blue link in Google. Leave empty to use the post title." count={title.length} ideal={60} error={errors.seoTitle}>
        {(id, describedBy) => (
          <input
            id={id}
            name="seoTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={fallbackTitle}
            aria-describedby={describedBy}
            className={`${input} h-10 ${errors.seoTitle ? "border-danger" : "border-line-strong"}`}
          />
        )}
      </Field>

      <Field label="Meta description" hint="The grey text under the link. Leave empty to use the summary." count={description.length} ideal={155} error={errors.seoDescription}>
        {(id, describedBy) => (
          <textarea
            id={id}
            name="seoDescription"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={fallbackDescription}
            rows={3}
            aria-describedby={describedBy}
            className={`${input} resize-y py-2 leading-relaxed ${errors.seoDescription ? "border-danger" : "border-line-strong"}`}
          />
        )}
      </Field>

      <Field label="Focus keywords" hint="Comma separated, e.g. compress png, reduce image size." error={errors.seoKeywords}>
        {(id, describedBy) => (
          <input
            id={id}
            name="seoKeywords"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            aria-describedby={describedBy}
            className={`${input} h-10 ${errors.seoKeywords ? "border-danger" : "border-line-strong"}`}
          />
        )}
      </Field>

      <Field label="Canonical URL" hint="Only if this article was first published elsewhere. Otherwise leave empty." error={errors.seoCanonical}>
        {(id, describedBy) => (
          <input
            id={id}
            name="seoCanonical"
            type="url"
            value={canonical}
            onChange={(event) => setCanonical(event.target.value)}
            placeholder="https://"
            aria-describedby={describedBy}
            className={`${input} h-10 ${errors.seoCanonical ? "border-danger" : "border-line-strong"}`}
          />
        )}
      </Field>

      {imagePicker}

      <label className="flex items-start gap-3 rounded-[6px] border border-line p-3">
        <input type="checkbox" name="seoNoindex" checked={noindex} onChange={(event) => setNoindex(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-primary" />
        <span className="text-sm">
          <span className="font-semibold text-ink">Hide from search engines</span>
          <span className="block text-[13px] text-subtle">Adds “noindex”: the post stays on the blog but Google won&apos;t list it.</span>
        </span>
      </label>
    </div>
  );
}

function Field({
  label,
  hint,
  count,
  ideal,
  error,
  children,
}: {
  label: string;
  hint: string;
  count?: number;
  ideal?: number;
  error?: string;
  children: (id: string, describedBy: string) => ReactNode;
}) {
  const id = `seo-${label.toLowerCase().replace(/\W+/g, "-")}`;
  const over = ideal !== undefined && count !== undefined && count > ideal;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink">
          {label}
        </label>
        {ideal !== undefined && (
          <span className={`text-xs tabular-nums ${over ? "font-semibold text-[#b45309]" : "text-faint"}`}>
            {count} / {ideal}
          </span>
        )}
      </div>
      {children(id, `${id}-hint`)}
      <p id={`${id}-hint`} className={`mt-1.5 text-[13px] ${error ? "text-danger" : "text-faint"}`}>
        {error ?? hint}
      </p>
    </div>
  );
}
