import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Prose } from "@/components/content/content-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `${siteConfig.name} doesn't use cookies. Learn what is stored on your device and why.`,
};

export default function CookiesPage() {
  return (
    <ContentPage title="Cookie Policy" intro={`${siteConfig.name} doesn't use cookies.`} updated="October 25, 2026">
      <Prose>
        <h2>No cookies</h2>
        <p>
          {siteConfig.name} doesn&apos;t set cookies, and there are no tracking, analytics or advertising cookies from other
          companies either. You don&apos;t need to accept anything to use the compressor.
        </p>

        <h2>What is stored on your device</h2>
        <p>
          If you switch between light and dark mode, your choice is saved in your browser&apos;s <strong>local storage</strong>{" "}
          under the name <strong>theme</strong>. The site uses it only to show the theme you picked next time. It is never sent
          to a server.
        </p>
        <p>
          You can remove it at any time by clearing this site&apos;s data in your browser settings. The site then follows your
          device&apos;s light or dark setting again.
        </p>

        <h2>Your images</h2>
        <p>
          Images you compress are held only in your browser&apos;s memory while the page is open. They aren&apos;t saved in
          cookies or storage. Read more in our <Link href="/privacy">privacy policy</Link>.
        </p>
      </Prose>
    </ContentPage>
  );
}
