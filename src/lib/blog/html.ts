import type { ArticleBlock, PostFaq } from "@/content/blogs";

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The site's inline syntax (`**bold**`, `[label](/href)`) as HTML. */
function inlineHtml(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

/**
 * Converts a post saved as blocks (the built-in posts) into editor HTML and a separate FAQ,
 * so it opens in the rich text editor. The page looks the same once saved.
 */
export function blocksToEditorContent(blocks: ArticleBlock[]): { html: string; faq: PostFaq | null } {
  let faq: PostFaq | null = null;
  const html = blocks
    .map((block) => {
      switch (block.type) {
        case "h2":
          return `<h2>${escapeHtml(block.text)}</h2>`;
        case "h3":
          return `<h3>${escapeHtml(block.text)}</h3>`;
        case "paragraphs":
          return block.lines.map((line) => `<p>${inlineHtml(line)}</p>`).join("");
        case "list":
          return `<ul>${block.items.map((item) => `<li><p>${inlineHtml(item)}</p></li>`).join("")}</ul>`;
        case "faq":
          faq ??= { title: block.title, subtitle: block.subtitle, items: block.items };
          return "";
      }
    })
    .join("");
  return { html, faq };
}

/** Text content of an HTML string, for "is the article empty?" checks and descriptions. */
export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
