import type { ArticleBlock } from "@/content/blogs";
import { FaqList } from "@/components/ui/faq-list";
import { RichText } from "@/components/ui/rich-text";

const h2 = "mt-12 font-display text-[24px] leading-[1.15] font-bold text-ink first:mt-0 sm:text-4xl md:mt-16 md:text-[48px]";

export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="text-[15px] leading-[1.5] text-subtle sm:text-base sm:leading-[1.4] md:text-lg">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className={h2}>
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-6 font-sans text-lg leading-tight font-bold text-ink-2 sm:text-xl md:text-2xl">
                {block.text}
              </h3>
            );
          case "paragraphs":
            return (
              <div key={i} className="mt-4 [h3+&]:mt-2">
                {block.lines.map((line) => (
                  <p key={line}>
                    <RichText text={line} />
                  </p>
                ))}
              </div>
            );
          case "list":
            return (
              <ul key={i} className="mt-4 list-disc space-y-0.5 pl-6 marker:text-subtle">
                {block.items.map((item) => (
                  <li key={item}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            );
          case "faq":
            return (
              <section key={i} aria-labelledby={`faq-${i}`}>
                <h2 id={`faq-${i}`} className={h2}>
                  {block.title}
                </h2>
                <p className="mt-4">{block.subtitle}</p>
                <FaqList items={block.items} className="mt-10" />
              </section>
            );
        }
      })}
    </div>
  );
}
