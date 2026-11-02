import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Prose } from "@/components/content/content-page";
import { ContactForm } from "@/components/forms/contact-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Questions, ideas or suggestions for ${siteConfig.name}? Send us a message.`,
};

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact Us"
      intro={`Have a question or an idea to make ${siteConfig.name} better? We'd love to hear from you.`}
    >
      <ContactForm id="feedback" />

      <Prose>
        <h2>Looking for a quick answer?</h2>
        <ul>
          <li>
            See the <Link href="/#faq">frequently asked questions</Link> about formats, file sizes and quality.
          </li>
          <li>
            Read our <Link href="/blogs">image compression guides</Link> for tips on choosing formats and settings.
          </li>
          <li>
            Learn how your images stay private in our <Link href="/privacy">privacy policy</Link>.
          </li>
        </ul>
      </Prose>
    </ContentPage>
  );
}
