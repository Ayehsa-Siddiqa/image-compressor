"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** Horizontal scroll-snap carousel. Dots only appear when the cards don't all fit. */
export function CardCarousel({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const total = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setPages(total);
    setPage(atEnd ? total - 1 : Math.min(total - 1, Math.round(el.scrollLeft / el.clientWidth)));
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [measure]);

  const goTo = (index: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <ul
        ref={track}
        aria-label={label}
        className="-mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pt-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Children.toArray(children).map((child, i) => (
          <li key={i} className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)]">
            {child}
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2" role="group" aria-label={`${label} pages`}>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show page ${i + 1} of ${pages}`}
              aria-current={i === page ? "true" : undefined}
              className={`rounded-full transition-all ${
                i === page ? "size-2.5 bg-primary ring-2 ring-primary/25 ring-offset-1 ring-offset-page" : "size-2 bg-line-strong hover:bg-faint"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
