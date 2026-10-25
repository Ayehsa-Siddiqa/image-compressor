import { Star } from "lucide-react";
import { siteConfig } from "@/config/site";

export function RatingBadge() {
  const { value, outOf, count } = siteConfig.rating;
  const full = Math.floor(value);
  return (
    <p
      className="mx-auto flex w-fit items-center gap-2 rounded-full border border-line bg-card px-4 py-2.5 shadow-card sm:gap-3 sm:px-5 sm:py-3 md:px-6 md:py-3.5"
      aria-label={`Rated ${value} out of ${outOf} from ${count.toLocaleString("en-US")} ratings`}
    >
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: outOf }, (_, i) => (
          <Star
            key={i}
            className={`size-4 sm:size-5 md:size-[22px] ${i < full ? "fill-star text-star" : "text-star"}`}
            strokeWidth={1.75}
          />
        ))}
      </span>
      <span className="text-sm text-body sm:text-base md:text-lg" aria-hidden>
        {value} /{outOf} - ({count.toLocaleString("en-US")})
      </span>
    </p>
  );
}
