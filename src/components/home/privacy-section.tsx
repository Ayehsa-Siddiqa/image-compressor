import { Clock, Eye, Lock, UserCheck, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

// Titles and layout follow the design. The design copy described uploads to a server (auto-deletion after
// 60 minutes, TLS/AES-256 storage); this app never uploads images, so the text describes local processing.
const points: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Clock,
    title: "Nothing To Delete",
    text: "Your Images Never Reach A Server. Everything Is Processed In Your Browser And Cleared When You Close The Page.",
  },
  {
    icon: Lock,
    title: "Never Uploaded",
    text: "No File Transfers Take Place. Compressed Images Exist Only On Your Device Until You Download Them.",
  },
  {
    icon: Eye,
    title: "Private Processing",
    text: "Your Images Are Processed Locally On Your Device. No Staff, No AI Model, No Third Party Ever Views Your Files.",
  },
  {
    icon: UserCheck,
    title: "No Registration Required",
    text: "Compress Images Without Creating An Account. No Tracking And No Cookies.",
  },
];

export function PrivacySection() {
  return (
    <section id="features" aria-labelledby="privacy-heading" className="scroll-mt-4 bg-glow py-12 sm:py-16 md:py-24">
      <div className="container-page">
        <SectionHeading
          id="privacy-heading"
          eyebrow="Privacy First"
          title="Your Files Are Safe With Us"
          subtitle="We Take Privacy Seriously. Your Images Stay Yours Always."
        />
        <ul className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2 lg:gap-6">
          {points.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex gap-4 rounded-xl border border-line bg-card p-4 shadow-card sm:p-5 transition-[border-color,box-shadow] duration-200 hover:border-primary/60 hover:shadow-card-active md:gap-5 md:px-6 md:py-7"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full sm:size-[60px] bg-primary-soft text-accent" aria-hidden>
                <Icon className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="font-sans text-lg font-bold sm:text-[20px] text-ink-2">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.5] text-subtle sm:mt-2 sm:text-base">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
