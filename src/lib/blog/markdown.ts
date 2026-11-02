import type { ArticleBlock } from "@/content/blogs";

/*
 * The admin editor writes article bodies as simple Markdown, stored as ArticleBlock[]:
 *
 *   ## Heading            → h2          ### Heading → h3
 *   - item                → list (consecutive lines)
 *   Plain lines           → paragraphs; a single line break keeps lines in one block,
 *                           a blank line starts a new block (more space above it)
 *   :::faq Title          → FAQ section; the line after the title is its subtitle,
 *   Subtitle                then Q:/A: pairs, closed by :::
 *   Q: Question?
 *   A: Answer.
 *   :::
 *
 * Inside text, **bold** and [label](/link) work as on the rest of the site.
 */

export function blocksToMarkdown(blocks: ArticleBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "h2":
          return `## ${block.text}`;
        case "h3":
          return `### ${block.text}`;
        case "paragraphs":
          return block.lines.join("\n");
        case "list":
          return block.items.map((item) => `- ${item}`).join("\n");
        case "faq":
          return [
            `:::faq ${block.title}`,
            ...(block.subtitle ? [block.subtitle] : []),
            ...block.items.flatMap((item) => [`Q: ${item.question}`, `A: ${item.answer}`]),
            ":::",
          ].join("\n");
      }
    })
    .join("\n\n");
}

export function markdownToBlocks(markdown: string): { blocks: ArticleBlock[]; error?: string } {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ArticleBlock[] = [];
  let current: Extract<ArticleBlock, { type: "paragraphs" | "list" }> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      current = null;
      continue;
    }

    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading) {
      current = null;
      blocks.push({ type: heading[1].length === 2 ? "h2" : "h3", text: heading[2] });
      continue;
    }

    if (line.startsWith(":::faq")) {
      current = null;
      const title = line.slice(6).trim();
      if (!title) return { blocks, error: `Line ${i + 1}: add a title after ":::faq".` };
      const start = i + 1;
      const end = lines.findIndex((other, j) => j > i && other.trim() === ":::");
      if (end === -1) return { blocks, error: `Line ${i + 1}: the FAQ section needs a closing ":::" line.` };
      const faq = parseFaq(lines.slice(start, end), start);
      if ("error" in faq) return { blocks, error: faq.error };
      blocks.push({ type: "faq", title, ...faq });
      i = end;
      continue;
    }

    const item = /^[-*]\s+(.+)$/.exec(line);
    if (item) {
      if (current?.type !== "list") blocks.push((current = { type: "list", items: [] }));
      current.items.push(item[1]);
      continue;
    }

    if (current?.type !== "paragraphs") blocks.push((current = { type: "paragraphs", lines: [] }));
    current.lines.push(line);
  }

  return { blocks };
}

function parseFaq(lines: string[], offset: number) {
  const subtitle: string[] = [];
  const items: { question: string; answer: string }[] = [];
  for (let j = 0; j < lines.length; j++) {
    const line = lines[j].trim();
    if (!line) continue;
    if (/^Q:/i.test(line)) items.push({ question: line.slice(2).trim(), answer: "" });
    else if (/^A:/i.test(line)) {
      const last = items.at(-1);
      if (!last || last.answer) return { error: `Line ${offset + j + 1}: every "A:" needs a "Q:" before it.` };
      last.answer = line.slice(2).trim();
    } else if (items.length === 0) subtitle.push(line);
    // A line after an answer continues it.
    else if (items.at(-1)!.answer) items.at(-1)!.answer += ` ${line}`;
    else return { error: `Line ${offset + j + 1}: put the answer on a line starting with "A:".` };
  }
  const unanswered = items.find((item) => !item.answer);
  if (unanswered) return { error: `The FAQ question "${unanswered.question}" has no answer.` };
  if (items.length === 0) return { error: "Add at least one Q:/A: pair to the FAQ section." };
  return { subtitle: subtitle.join(" "), items };
}
