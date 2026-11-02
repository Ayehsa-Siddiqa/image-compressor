import { GuidesSection } from "@/components/blog/guides-section";
import { CompressorExperience } from "@/components/compressor/compressor-experience";
import { FaqSection } from "@/components/home/faq-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { PrivacySection } from "@/components/home/privacy-section";

export default function HomePage() {
  return (
    <CompressorExperience afterDownload={<GuidesSection tone="surface" />}>
      <HowItWorks />
      <PrivacySection />
      <FaqSection />
      <GuidesSection />
    </CompressorExperience>
  );
}
