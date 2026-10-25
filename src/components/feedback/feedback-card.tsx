"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { feedbackHref, siteConfig } from "@/config/site";
import { buttonClass } from "@/components/ui/button";

const card = "rounded-3xl border border-line bg-card px-5 py-8 text-center shadow-card sm:px-10 sm:py-10";

/** Opens the visitor's email app with their rating and message. Hidden until a feedback address is configured. */
export function FeedbackCard({ id: anchorId }: { id?: string }) {
  const id = useId();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!feedbackHref()) return null;

  return (
    <section id={anchorId} className={`${card} scroll-mt-6`} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="font-display text-[22px] font-semibold text-ink sm:text-[26px] md:text-[28px]">
        How was your experience?
      </h2>
      <p className="mt-2 text-base text-subtle md:text-lg">Your feedback helps us improve {siteConfig.name} for everyone.</p>

      <form
        className="mx-auto mt-6 max-w-[745px] text-left"
        onSubmit={(event) => {
          event.preventDefault();
          const body = `${rating ? `Rating: ${rating}/5\n\n` : ""}${message}`;
          const href = feedbackHref(`${siteConfig.name} feedback`, body);
          if (href) window.location.href = href;
          setSent(true);
        }}
      >
        <fieldset className="flex justify-center gap-3">
          <legend className="sr-only">Rate {siteConfig.name} from 1 to 5 stars</legend>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer rounded">
              <input
                type="radio"
                name={`${id}-rating`}
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="peer sr-only"
              />
              <span className="sr-only">
                {value} star{value > 1 ? "s" : ""}
              </span>
              <Star
                className={`size-9 rounded transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-accent ${
                  value <= rating ? "fill-star text-star" : "text-line-strong hover:text-star"
                }`}
                strokeWidth={1.25}
                aria-hidden
              />
            </label>
          ))}
        </fieldset>

        <label htmlFor={`${id}-message`} className="sr-only">
          Your message (optional)
        </label>
        <textarea
          id={`${id}-message`}
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Your Message (Optional)"
          className="mt-6 block w-full resize-y rounded-[10px] border border-line bg-card px-5 py-4 text-base text-body placeholder:text-faint focus:border-primary focus:outline-none"
        />
        <button type="submit" className={buttonClass("primary", "md", "mt-6")} disabled={!rating && !message.trim()}>
          Submit
        </button>
        {sent && (
          <p className="mt-3 text-sm text-subtle" role="status">
            Your email app should open with your feedback ready to send.
          </p>
        )}
      </form>
    </section>
  );
}
