import { homeFaq } from "@/content/faq";
import { FaqList } from "@/components/ui/faq-list";
import { SectionHeading } from "@/components/ui/section-heading";

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-4 bg-surface py-12 sm:py-16 md:py-24">
      <div className="container-page">
        <SectionHeading
          id="faq-heading"
          eyebrow="FAQ's"
          title="Frequently Asked Questions"
          subtitle="We Take Privacy Seriously. Your Images Stay Yours Always."
        />
        <FaqList items={homeFaq} className="mx-auto mt-8 max-w-[842px] sm:mt-12" />
      </div>
    </section>
  );
}
