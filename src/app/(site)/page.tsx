import type { Metadata } from "next";
import { GuidesSection } from "@/components/blog/guides-section";
import { CompressorExperience } from "@/components/compressor/compressor-experience";
import { FaqSection } from "@/components/home/faq-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { PrivacySection } from "@/components/home/privacy-section";
import { siteConfig } from "@/config/site";
import { homeFaq } from "@/content/faq";
import { jsonLd, organizationLd, shareImage } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  // The full title, without the "| Toolve" suffix other pages get.
  title: { absolute: siteConfig.title },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    images: [shareImage],
  },
};

/** Tells search engines this is a free web app (eligible for rich results), who runs it, and the FAQ answers. */
const structuredData = jsonLd([
  {
    "@context": "https://schema.org",
    "@graph": [
      organizationLd(),
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: absoluteUrl("/"),
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": absoluteUrl("/#organization") },
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        name: `${siteConfig.name} Image Compressor`,
        url: absoluteUrl("/"),
        description: siteConfig.description,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any (runs in the web browser)",
        browserRequirements: "Requires JavaScript and WebAssembly",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "Compress JPG, PNG, WebP, AVIF and HEIC images",
          "Convert between image formats",
          "Batch compression with ZIP download",
          "Before and after comparison",
          "Images are processed on your device and never uploaded",
        ],
        publisher: { "@id": absoluteUrl("/#organization") },
      },
      {
        "@type": "FAQPage",
        mainEntity: homeFaq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
      },
    ],
  },
]);

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <CompressorExperience afterDownload={<GuidesSection tone="surface" />}>
        <HowItWorks />
        <PrivacySection />
        <FaqSection />
        <GuidesSection />
      </CompressorExperience>
    </>
  );
}
