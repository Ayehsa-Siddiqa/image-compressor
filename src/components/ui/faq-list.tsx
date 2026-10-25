import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/content/faq";

/** Native <details> accordion: keyboard accessible and works without JavaScript. The first item starts open, as in the design. */
export function FaqList({ items, className = "" }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {items.map((item, index) => (
        <details
          key={item.question}
          open={index === 0}
          className="group rounded-xl border border-line bg-card transition-shadow open:shadow-card"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-3.5 font-sans text-[15px] text-ink-2 sm:px-5 sm:py-[18px] sm:text-[17px] md:px-6 md:text-xl [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown
              className="size-5 shrink-0 text-faint transition-transform duration-200 group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="-mt-1 px-4 pb-4 text-sm leading-relaxed text-subtle sm:px-5 sm:pb-5 sm:text-[15px] md:px-6 md:text-base">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
