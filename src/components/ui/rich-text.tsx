import Link from "next/link";
import { Fragment } from "react";

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

/** Renders `**bold**` and `[label](/href)` inside otherwise plain copy. */
export function RichText({ text }: { text: string }) {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith("**")) {
      return (
        <strong key={i} className="font-bold text-muted">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <Link key={i} href={link[2]} className="text-accent underline-offset-2 hover:underline">
          {link[1]}
        </Link>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
