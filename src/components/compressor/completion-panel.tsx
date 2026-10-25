"use client";

import { useState } from "react";
import { Check, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { siteConfig, type SocialNetwork } from "@/config/site";
import { FeedbackCard } from "@/components/feedback/feedback-card";
import { socialMeta } from "@/components/ui/brand-icons";
import { buttonClass } from "@/components/ui/button";
import { formatBytes, savedPercent } from "@/lib/format";

interface CompletionPanelProps {
  imageCount: number;
  originalBytes: number;
  outputBytes: number;
  onRestart: () => void;
}

const card = "rounded-3xl border border-line bg-card px-5 py-8 text-center shadow-card sm:px-10 sm:py-10";

export function CompletionPanel({ imageCount, originalBytes, outputBytes, onRestart }: CompletionPanelProps) {
  const percent = savedPercent(originalBytes, outputBytes);
  const socials = (Object.keys(socialMeta) as SocialNetwork[]).filter((network) => siteConfig.social[network]);

  return (
    <div className="mx-auto max-w-[844px] space-y-6">
      <section className={card} aria-labelledby="done-heading">
        <span className="mx-auto grid size-16 place-items-center rounded-full border-[3px] sm:size-20 border-success" aria-hidden>
          <span className="grid size-11 place-items-center rounded-full bg-success-soft sm:size-14">
            <Check className="size-6 text-success" strokeWidth={2.25} />
          </span>
        </span>
        <h1 id="done-heading" className="mt-5 font-display text-[22px] font-semibold text-ink sm:mt-7 sm:text-[26px] md:text-[28px]">
          Thanks for using {siteConfig.name}!
        </h1>
        <p className="mt-2 text-base text-subtle md:text-lg">
          {imageCount === 1 ? "Your image was compressed successfully." : `Your ${imageCount} images were compressed successfully.`}
        </p>

        <ul className="mt-5 flex flex-wrap justify-center gap-2 text-xs sm:mt-6 sm:gap-3 sm:text-sm">
          <li className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 sm:px-4 sm:py-2 text-success">
            <Zap className="size-4" aria-hidden />
            {percent > 0 ? `Saved ${percent}%` : "Already optimized"}
          </li>
          <li className="inline-flex items-center rounded-full bg-surface px-3 py-1.5 sm:px-4 sm:py-2 text-body">
            {formatBytes(originalBytes)} → {formatBytes(outputBytes)}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 sm:px-4 sm:py-2 text-body">
            <ShieldCheck className="size-4 text-success" aria-hidden />
            Processed on your device
          </li>
        </ul>

        <button type="button" className={buttonClass("primary", "md", "mt-7")} onClick={onRestart}>
          <RotateCcw className="size-5" aria-hidden />
          Compress Another Image
        </button>
      </section>

      <FeedbackCard />

      <section className={card} aria-labelledby={socials.length ? "follow-heading" : undefined}>
        {socials.length > 0 && (
          <>
            <h2 id="follow-heading" className="font-display text-[26px] font-semibold text-ink">
              Follow us for updates
            </h2>
            <p className="mt-2 text-base text-subtle md:text-lg">Stay in the loop on new tools, tips, and features every week.</p>
            <ul className="mx-auto mt-6 flex max-w-[632px] flex-wrap justify-center gap-4">
              {socials.map((network) => {
                const { label, Icon } = socialMeta[network];
                return (
                  <li key={network} className="w-full sm:w-[calc((100%-32px)/3)]">
                    <a
                      href={siteConfig.social[network]!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 items-center gap-2.5 rounded-md border border-line bg-surface px-5 text-base text-body transition-colors hover:border-[#0a84ff] hover:bg-[#0a84ff] hover:text-white"
                    >
                      <Icon className="size-[18px]" />
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <ShareLine />
      </section>
    </div>
  );
}

function ShareLine() {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function share() {
    const url = window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ title: siteConfig.name, text: siteConfig.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch (error) {
      // Closing the share sheet isn't an error worth reporting.
      if ((error as DOMException)?.name !== "AbortError") setStatus("failed");
    }
  }

  return (
    <p className="mt-6 text-base text-body first:mt-0 md:text-lg">
      Loved {siteConfig.name}?{" "}
      <button type="button" onClick={share} className="font-bold text-body underline-offset-2 hover:text-accent hover:underline">
        Share it with a friend
      </button>{" "}
      — it&apos;s free for everyone.
      <span className="block text-sm text-success" aria-live="polite">
        {status === "copied" && "Link copied to your clipboard."}
        {status === "failed" && <span className="text-danger">Couldn&apos;t share automatically. Copy the address from your browser.</span>}
      </span>
    </p>
  );
}
