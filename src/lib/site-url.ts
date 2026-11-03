/**
 * The site's public address, used for canonical links, the sitemap and social previews.
 * Set NEXT_PUBLIC_SITE_URL (e.g. https://toolve.com) once you have your own domain; until then Vercel's
 * production address is used.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");

/** Turns a path like "/blogs/x" (or an already absolute URL) into a full URL. */
export const absoluteUrl = (path: string) => (/^https?:\/\//i.test(path) ? path : `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`);
