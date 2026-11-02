"use server";

import { randomUUID } from "node:crypto";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { blogPosts as builtInPosts, type BlogImage } from "@/content/blogs";
import { MAX_IMAGE_BYTES } from "@/lib/blog/limits";
import { markdownToBlocks } from "@/lib/blog/markdown";
import { POSTS_TAG, toRow, type PostStatus } from "@/lib/blog/posts";
import type { FormState } from "@/lib/forms/types";
import { text, validateEmail, validateName, validateNewPassword } from "@/lib/forms/validation";
import { BLOG_IMAGES_BUCKET, getSupabase } from "@/lib/supabase";
import { dummyHashPromise, hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, requireAdmin } from "./session";

const NOT_CONFIGURED = "The database isn't connected yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see README).";
const UNIQUE_VIOLATION = "23505";

function database() {
  const db = getSupabase();
  if (!db) throw new Error(NOT_CONFIGURED);
  return db;
}

const hasErrors = (errors: Record<string, string | undefined>) => Object.values(errors).some(Boolean);

/* ---------- sign in / out ---------- */

type LoginField = "email" | "password";

export async function loginAdmin(_prev: FormState<LoginField>, formData: FormData): Promise<FormState<LoginField>> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fieldErrors = { email: validateEmail(email), password: password ? undefined : "Enter your password." };
  if (hasErrors(fieldErrors)) return { status: "error", fieldErrors, values: { email } };

  const db = getSupabase();
  if (!db) return { status: "error", message: NOT_CONFIGURED, values: { email } };

  const { data: admin } = await db.from("admin_users").select("id, password_hash").eq("email", email).maybeSingle();
  // Always run one hash check so a missing account takes as long as a wrong password.
  const valid = await verifyPassword(password, admin?.password_hash ?? (await dummyHashPromise));
  if (!admin || !valid) return { status: "error", message: "Incorrect email or password.", values: { email } };

  await createSession(admin.id);
  redirect("/dashboard");
}

export async function logoutAdmin() {
  await destroySession();
  redirect("/dashboard/login");
}

/* ---------- posts ---------- */

type PostField = "title" | "cardTitle" | "slug" | "description" | "publishedAt" | "heroImage" | "heroImageAlt" | "cardImage" | "body";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseImage(value: FormDataEntryValue | null): BlogImage | null {
  try {
    const image = JSON.parse(String(value ?? "")) as BlogImage;
    const validSrc = typeof image.src === "string" && (image.src.startsWith("https://") || image.src.startsWith("/"));
    const validSize = Number.isInteger(image.width) && image.width > 0 && Number.isInteger(image.height) && image.height > 0;
    return validSrc && validSize ? { src: image.src, width: image.width, height: image.height } : null;
  } catch {
    return null;
  }
}

export async function savePost(_prev: FormState<PostField>, formData: FormData): Promise<FormState<PostField>> {
  await requireAdmin();
  const id = text(formData, "id");
  const status: PostStatus = formData.get("status") === "published" ? "published" : "draft";
  const title = text(formData, "title");
  const cardTitle = text(formData, "cardTitle") || title;
  const slug = text(formData, "slug");
  const description = text(formData, "description");
  const publishedAt = text(formData, "publishedAt");
  const heroImage = parseImage(formData.get("heroImage"));
  const heroImageAlt = text(formData, "heroImageAlt");
  // The card falls back to the article's main image.
  const cardImage = parseImage(formData.get("cardImage")) ?? heroImage;
  const cardImageAlt = text(formData, "cardImageAlt") || heroImageAlt;
  const markdown = String(formData.get("body") ?? "");
  const { blocks, error: bodyError } = markdownToBlocks(markdown);

  const fieldErrors = {
    title: !title ? "Enter a title." : title.length > 200 ? "Keep the title under 200 characters." : undefined,
    cardTitle: cardTitle.length > 200 ? "Keep the card title under 200 characters." : undefined,
    slug: !SLUG.test(slug) ? "Use lowercase letters, numbers and single hyphens, e.g. how-to-compress-png." : undefined,
    description: !description
      ? "Enter a short description (shown in search results)."
      : description.length > 300
        ? "Keep the description under 300 characters."
        : undefined,
    publishedAt: Number.isNaN(Date.parse(publishedAt)) ? "Choose a date." : undefined,
    heroImage: heroImage ? undefined : "Upload the main image.",
    heroImageAlt: heroImageAlt ? undefined : "Describe the main image for people who can't see it.",
    body: bodyError ?? (blocks.length === 0 ? "Write the article." : undefined),
  };
  // Refill everything except the images (their pickers keep their own state).
  const values = { title, cardTitle: text(formData, "cardTitle"), slug, description, publishedAt, heroImageAlt, body: markdown };
  if (hasErrors(fieldErrors)) return { status: "error", fieldErrors, values, message: "Please fix the highlighted fields." };

  const row = {
    ...toRow({ slug, status, title, cardTitle, description, publishedAt, cardImage: cardImage!, cardImageAlt, heroImage: heroImage!, heroImageAlt, body: blocks }),
    updated_at: new Date().toISOString(),
  };
  const db = database();
  const result = id
    ? await db.from("blog_posts").update(row).eq("id", id).select("id").single()
    : await db.from("blog_posts").insert(row).select("id").single();
  if (result.error) {
    if (result.error.code === UNIQUE_VIOLATION) {
      return { status: "error", fieldErrors: { slug: "Another post already uses this URL slug." }, values };
    }
    return { status: "error", message: `Couldn't save: ${result.error.message}`, values };
  }

  updateTag(POSTS_TAG);
  if (!id) redirect(`/dashboard/posts/${result.data.id}?created=1`);
  return { status: "success", message: status === "published" ? "Saved and published." : "Saved as a draft.", values };
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const { error } = await database().from("blog_posts").delete().eq("id", id);
  if (error) return { error: `Couldn't delete: ${error.message}` };
  updateTag(POSTS_TAG);
  refresh();
  return {};
}

export async function setPostStatus(id: string, status: PostStatus): Promise<{ error?: string }> {
  await requireAdmin();
  const { error } = await database().from("blog_posts").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: `Couldn't update: ${error.message}` };
  updateTag(POSTS_TAG);
  refresh();
  return {};
}

/** Copies the posts that ship with the site into the database, skipping slugs that already exist. */
export async function importBuiltInPosts(): Promise<{ error?: string }> {
  await requireAdmin();
  const rows = builtInPosts.map((post) =>
    toRow({
      ...post,
      status: "published",
      // Bundled images keep working from /_next/static; only the fields the database stores are kept.
      cardImage: { src: post.cardImage.src, width: post.cardImage.width, height: post.cardImage.height },
      heroImage: { src: post.heroImage.src, width: post.heroImage.width, height: post.heroImage.height },
    }),
  );
  const { error } = await database().from("blog_posts").upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
  if (error) return { error: `Couldn't import: ${error.message}` };
  updateTag(POSTS_TAG);
  refresh();
  return {};
}

/* ---------- images ---------- */

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" };

export async function uploadBlogImage(formData: FormData): Promise<{ image?: BlogImage; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  const width = Number(formData.get("width"));
  const height = Number(formData.get("height"));
  if (!(file instanceof File) || !IMAGE_TYPES[file.type]) return { error: "Choose a JPG, PNG, WebP, AVIF or GIF image." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Images can be up to 4 MB. Compress it on the home page first." };
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) return { error: "Couldn't read the image size." };

  const storage = database().storage.from(BLOG_IMAGES_BUCKET);
  const path = `posts/${randomUUID()}.${IMAGE_TYPES[file.type]}`;
  const { error } = await storage.upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) return { error: `Upload failed: ${error.message}` };
  return { image: { src: storage.getPublicUrl(path).data.publicUrl, width, height } };
}

/* ---------- admin accounts ---------- */

type AdminField = "name" | "email" | "password";

export async function createAdminAccount(_prev: FormState<AdminField>, formData: FormData): Promise<FormState<AdminField>> {
  await requireAdmin();
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fieldErrors = { name: validateName(name), email: validateEmail(email), password: validateNewPassword(password) };
  if (hasErrors(fieldErrors)) return { status: "error", fieldErrors, values: { name, email } };

  const { error } = await database().from("admin_users").insert({ name, email, password_hash: await hashPassword(password) });
  if (error) {
    if (error.code === UNIQUE_VIOLATION) return { status: "error", fieldErrors: { email: "There's already an admin with this email." }, values: { name, email } };
    return { status: "error", message: `Couldn't add the admin: ${error.message}`, values: { name, email } };
  }
  refresh();
  return { status: "success", message: `${name} can now sign in at /dashboard.` };
}

export async function deleteAdminAccount(id: string): Promise<{ error?: string }> {
  const me = await requireAdmin();
  if (id === me.id) return { error: "You can't remove your own account." };
  const { error } = await database().from("admin_users").delete().eq("id", id);
  if (error) return { error: `Couldn't remove: ${error.message}` };
  refresh();
  return {};
}
