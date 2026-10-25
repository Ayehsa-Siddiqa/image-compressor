import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Prose } from "@/components/content/content-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles your images and data: images are compressed in your browser and never uploaded.`,
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      intro="Your images stay on your device. Here's exactly what happens when you use the compressor."
      updated="October 25, 2026"
    >
      <Prose>
        <h2>Your images are never uploaded</h2>
        <p>
          {siteConfig.name} compresses images inside your web browser using your device&apos;s own processing power. The files
          you choose are read only by the page on your device. They are not sent to our servers or to anyone else, and we
          can&apos;t see them.
        </p>
        <p>
          Compressed images exist only in your browser&apos;s memory until you download them. Closing or reloading the page
          removes them.
        </p>

        <h2>Information we don&apos;t collect</h2>
        <ul>
          <li>We don&apos;t ask for your name, email address or any account details to use the compressor.</li>
          <li>We don&apos;t use analytics, advertising or tracking tools.</li>
          <li>We don&apos;t sell or share personal information.</li>
        </ul>

        <h2>Information your browser sends</h2>
        <p>
          Like any website, loading {siteConfig.name} means your browser requests pages from the server that hosts it. That
          server may keep standard technical logs, such as IP address, browser type and the pages requested, for security and
          reliability. These logs never include your images.
        </p>

        <h2>Messages you send us</h2>
        <p>
          If you use the <Link href="/contact">contact form</Link>, we receive the name, email address, topic and message you
          enter. We use them only to reply to you and to improve {siteConfig.name}.
        </p>

        <h2>Accounts</h2>
        <p>
          You never need an account to compress images. If you choose to create one, we store your name, email address and a
          securely hashed version of your password, never the password itself, so you can sign in.
        </p>

        <h2>Settings stored on your device</h2>
        <p>
          If you switch between light and dark mode, that choice is saved in your browser&apos;s local storage so the site
          remembers it. It stays on your device. See our <Link href="/cookies">cookie policy</Link> for details.
        </p>

        <h2>Changes to this policy</h2>
        <p>If we change how {siteConfig.name} handles data, we&apos;ll update this page and the date at the top.</p>
      </Prose>
    </ContentPage>
  );
}
