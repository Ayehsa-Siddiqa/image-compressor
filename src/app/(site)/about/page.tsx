import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Prose } from "@/components/content/content-page";
import { siteConfig } from "@/config/site";
import { MAX_FILES } from "@/lib/compression/limits";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.name} is a free image compressor that shrinks JPG, PNG, WebP, AVIF, HEIC and other images right in your browser.`,
};

export default function AboutPage() {
  return (
    <ContentPage title={`About ${siteConfig.name}`} intro={siteConfig.tagline}>
      <Prose>
        <h2>What {siteConfig.name} does</h2>
        <p>
          {siteConfig.name} makes JPG, PNG, WebP, AVIF, HEIC, GIF, TIFF, BMP and SVG images smaller so they load faster, take up less storage and are easier to
          share or upload. You can compress up to {MAX_FILES} images at once, compare each result with the original, and download
          them one by one or together as a ZIP file.
        </p>

        <h2>Private by design</h2>
        <p>
          Compression runs entirely in your web browser, on your own device. Your images are never uploaded to a server, so
          nobody else can see them. When you close the page, they&apos;re gone.
        </p>

        <h2>Honest results</h2>
        <ul>
          <li>Images keep their dimensions and, by default, their format. Transparency is kept in PNG, WebP and AVIF.</li>
          <li>The same codecs trusted by professional tools (MozJPEG, libwebp, libavif and oxipng) give smaller files at the same visual quality.</li>
          <li>If an image can&apos;t be made any smaller, you get your original file back instead of a bigger one.</li>
          <li>The quality slider lets you choose the balance between file size and detail.</li>
        </ul>

        <h2>Free, with no account</h2>
        <p>
          You don&apos;t need to sign up to use {siteConfig.name}. Just <Link href="/">choose your images</Link> and start
          compressing. Want to learn more about image formats and settings? Read our{" "}
          <Link href="/blogs">image compression guides</Link>.
        </p>
      </Prose>
    </ContentPage>
  );
}
