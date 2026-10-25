"use client";

import { useEffect, type ReactNode } from "react";
import { useImageCompressor } from "@/lib/compression/use-image-compressor";
import { FeatureHighlights } from "@/components/home/feature-highlights";
import { RatingBadge } from "@/components/ui/rating-badge";
import { CompletionPanel } from "./completion-panel";
import { Compressor } from "./compressor";

interface CompressorExperienceProps {
  /** Server-rendered sections shown under the tool (How it works, privacy, FAQ…). */
  children: ReactNode;
  /** Server-rendered guides section shown after the user has downloaded their images. */
  afterDownload: ReactNode;
}

/**
 * Owns the compressor state for the home page. After "Download All" the page switches to the
 * thank-you view from the design's Review frame; "Compress Another Image" brings the tool back.
 */
export function CompressorExperience({ children, afterDownload }: CompressorExperienceProps) {
  const api = useImageCompressor();
  const { finished } = api.state;

  useEffect(() => {
    if (finished) window.scrollTo({ top: 0 });
  }, [finished]);

  if (finished) {
    return (
      <>
        <section className="bg-hero py-14 md:py-16">
          <div className="container-page">
            <CompletionPanel
              imageCount={api.summary.doneCount}
              originalBytes={api.summary.originalBytes}
              outputBytes={api.summary.outputBytes}
              onRestart={api.clear}
            />
          </div>
        </section>
        {afterDownload}
      </>
    );
  }

  return (
    <>
      <section id="compress" aria-labelledby="hero-heading" className="bg-hero pt-10 pb-14 sm:pt-12 sm:pb-16 md:pt-16 md:pb-24">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <h1 id="hero-heading" className="font-display text-[30px] leading-[1.15] font-bold text-ink sm:text-5xl lg:text-[56px] lg:leading-[1.18]">
              Compress Images
              <br />
              Without Losing Quality
            </h1>
            <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-[1.45] text-muted sm:mt-5 sm:text-base md:text-lg">
              Reduce JPG, PNG, WebP, And AVIF File Size In Seconds While Maintaining Excellent Image Quality. Fast, Secure, Free.
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-[1000px] sm:mt-8">
            <Compressor api={api} />
          </div>

          <div className="mt-10 sm:mt-12">
            <RatingBadge />
          </div>
          <div className="mt-10 sm:mt-16 md:mt-20">
            <FeatureHighlights />
          </div>
        </div>
      </section>
      {children}
    </>
  );
}
