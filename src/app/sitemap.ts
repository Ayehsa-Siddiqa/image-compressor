import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog/posts";
import { absoluteUrl } from "@/lib/site-url";

const pages: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/blogs", priority: 0.8, changeFrequency: "daily" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
];

/** /sitemap.xml: every public page and published post, so search engines find new posts quickly. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Posts hidden from search engines, or whose main copy lives elsewhere, are left out.
  const posts = (await getPublishedPosts()).filter((post) => !post.seo?.noindex && !post.seo?.canonical);
  return [
    ...pages.map((page) => ({ url: absoluteUrl(page.path), priority: page.priority, changeFrequency: page.changeFrequency })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/blogs/${post.slug}`),
      lastModified: post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [absoluteUrl(post.heroImage.src)],
    })),
  ];
}
