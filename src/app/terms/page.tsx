import type { Metadata } from "next";
import { ContentPage, Prose } from "@/components/content/content-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms that apply when you use ${siteConfig.name}'s free image compressor.`,
};

export default function TermsPage() {
  return (
    <ContentPage title="Terms of Use" intro={`Please read these terms before using ${siteConfig.name}.`} updated="October 25, 2026">
      <Prose>
        <h2>Using {siteConfig.name}</h2>
        <p>
          {siteConfig.name} is a free tool for compressing images in your web browser. By using it, you agree to these terms. If
          you don&apos;t agree, please don&apos;t use the site.
        </p>

        <h2>Your images</h2>
        <p>
          You keep all rights to the images you compress. Because images are processed on your device and never uploaded, we
          don&apos;t receive, store or claim any rights to them. Only compress images you have the right to use.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Don&apos;t use the site for anything unlawful.</li>
          <li>Don&apos;t try to disrupt, overload or interfere with the site or the servers that host it.</li>
          <li>Don&apos;t copy or resell the site as your own service.</li>
        </ul>

        <h2>No warranty</h2>
        <p>
          {siteConfig.name} is provided &quot;as is&quot;, without warranties of any kind. Compression results depend on each image
          and your browser. Always keep a copy of your original files, and check compressed images before you rely on them.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the extent permitted by law, we aren&apos;t liable for any loss or damage from using, or being unable to use, the
          site. That includes lost or damaged files.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms or change the site at any time. Updated terms take effect when they are posted on this page.
        </p>
      </Prose>
    </ContentPage>
  );
}
