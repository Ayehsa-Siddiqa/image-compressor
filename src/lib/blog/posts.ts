import "server-only";
import { cacheTag } from "next/cache";
import { blogPosts as builtInPosts, type ArticleBlock, type BlogImage, type BlogPost, type PostFaq, type PostSeo } from "@/content/blogs";
import { getSupabase } from "@/lib/supabase";

/** Cache tag for everything the public site shows from the blog; the dashboard expires it on every change. */
export const POSTS_TAG = "blog-posts";

export type PostStatus = "draft" | "published";

export interface AdminPost extends BlogPost {
  id: string;
  status: PostStatus;
  updatedAt: string;
}

interface PostRow {
  id: string;
  slug: string;
  status: PostStatus;
  title: string;
  card_title: string;
  description: string;
  published_at: string;
  card_image: BlogImage;
  card_image_alt: string;
  hero_image: BlogImage;
  hero_image_alt: string;
  body: ArticleBlock[];
  content_html: string | null;
  faq: PostFaq | null;
  seo: PostSeo | null;
  updated_at: string;
}

function toPost(row: PostRow): AdminPost {
  return {
    id: row.id,
    status: row.status,
    updatedAt: row.updated_at,
    slug: row.slug,
    title: row.title,
    cardTitle: row.card_title,
    description: row.description,
    publishedAt: row.published_at,
    cardImage: row.card_image,
    cardImageAlt: row.card_image_alt,
    heroImage: row.hero_image,
    heroImageAlt: row.hero_image_alt,
    body: row.body,
    // Missing until supabase/migrations/002_rich_text_and_seo.sql has been run.
    contentHtml: row.content_html ?? null,
    faq: row.faq ?? null,
    seo: row.seo ?? {},
  };
}

export function toRow(post: BlogPost & { status: PostStatus }): Omit<PostRow, "id" | "updated_at"> {
  return {
    slug: post.slug,
    status: post.status,
    title: post.title,
    card_title: post.cardTitle,
    description: post.description,
    published_at: post.publishedAt,
    card_image: post.cardImage,
    card_image_alt: post.cardImageAlt,
    hero_image: post.heroImage,
    hero_image_alt: post.heroImageAlt,
    body: post.body,
    content_html: post.contentHtml ?? null,
    faq: post.faq ?? null,
    seo: post.seo ?? {},
  };
}

/** Published posts, newest first. Without a database, the built-in posts. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  const db = getSupabase();
  if (!db) return builtInPosts;
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .returns<PostRow[]>();
  if (error) throw new Error(`Couldn't load blog posts: ${error.message}`);
  return data.map(toPost);
}

export async function getPublishedPost(slug: string): Promise<BlogPost | undefined> {
  return (await getPublishedPosts()).find((post) => post.slug === slug);
}

/* ---------- dashboard (never cached: always the latest, drafts included) ---------- */

export async function listAllPosts(): Promise<AdminPost[]> {
  const db = getSupabase();
  if (!db) return [];
  const { data, error } = await db.from("blog_posts").select("*").order("published_at", { ascending: false }).returns<PostRow[]>();
  if (error) throw new Error(`Couldn't load blog posts: ${error.message}`);
  return data.map(toPost);
}

export async function getPostById(id: string): Promise<AdminPost | null> {
  const db = getSupabase();
  if (!db || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db.from("blog_posts").select("*").eq("id", id).maybeSingle<PostRow>();
  if (error) throw new Error(`Couldn't load the post: ${error.message}`);
  return data && toPost(data);
}
