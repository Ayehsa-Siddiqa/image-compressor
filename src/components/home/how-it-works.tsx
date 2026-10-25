import { Download, SlidersHorizontal, Upload, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Upload,
    title: "Upload Images",
    text: "Drag & Drop Or Click To Select Up To 100 Images At Once From Any Device.",
  },
  {
    icon: SlidersHorizontal,
    title: "Choose Level",
    text: "Use The Recommended Setting Or Fine-Tune Quality With The Advanced Slider.",
  },
  {
    icon: Download,
    title: "Download Results",
    text: "Preview The Before/After Comparison, Then Download Compressed Files Instantly.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-4 bg-surface py-12 sm:py-16 md:py-24">
      <div className="container-page">
        <SectionHeading id="how-heading" eyebrow="Simple Process" title="How It Works" subtitle="Three Steps. No Learning Curve." />
        <ol className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-3 lg:gap-14">
          {steps.map(({ icon: Icon, title, text }, i) => {
            const featured = i === 0;
            return (
              <li
                key={title}
                className={`flex flex-col items-center rounded-xl px-5 py-7 text-center sm:px-6 sm:py-8 transition-shadow duration-200 md:min-h-[259px] ${
                  featured
                    ? "bg-primary text-white shadow-[0_12px_30px_rgb(37_99_235/0.25)]"
                    : "border border-line bg-card shadow-card hover:shadow-[0_12px_30px_rgb(17_17_17/0.06)]"
                }`}
              >
                <span
                  className={`grid size-[60px] place-items-center rounded-[10px] ${featured ? "bg-white/10" : "bg-primary-soft text-accent"}`}
                  aria-hidden
                >
                  <Icon className="size-6" strokeWidth={1.75} />
                </span>
                <span className={`mt-5 text-base ${featured ? "text-white" : "text-subtle"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={`mt-1 font-sans text-xl font-bold sm:text-[24px] ${featured ? "text-white" : "text-ink-2"}`}>{title}</h3>
                <p className={`mt-3 max-w-[300px] text-[15px] leading-[1.45] sm:text-base ${featured ? "text-white" : "text-subtle"}`}>{text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
