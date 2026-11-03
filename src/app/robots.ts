import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

/** /robots.txt: everything public may be crawled; the admin dashboard may not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
