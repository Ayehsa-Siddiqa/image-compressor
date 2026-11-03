import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Metadata for a regular page: its own title, description and canonical address, repeated for
 * Facebook / WhatsApp / LinkedIn (Open Graph) and X so shared links show this page, not the home page.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const shareTitle = `${title} | ${siteConfig.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: siteConfig.name, locale: "en_US", title: shareTitle, description, url: path, images: [shareImage] },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: [shareImage] },
  };
}

/**
 * The site-wide preview card (app/opengraph-image.tsx). Pages that set their own Open Graph text must
 * list it again, or Next.js drops it.
 */
export const shareImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Toolve – free online image compressor for JPG, PNG, WebP, AVIF and HEIC",
  type: "image/png",
};

/** Serialises structured data for a <script type="application/ld+json">, escaping "<" so text can't close the tag. */
export function jsonLd(data: object | object[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Who publishes the site, with its logo and social profiles (shared by every page's structured data). */
export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: siteConfig.name,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl("/toolve-light.png"), width: 1792, height: 377 },
    sameAs: Object.values(siteConfig.social).filter((href): href is string => Boolean(href)),
  };
}
