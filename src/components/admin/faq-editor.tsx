"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { PostFaq } from "@/content/blogs";
import { dashButton, iconButton } from "./ui";

const input =
  "block w-full rounded-[6px] border border-line-strong bg-card px-3 text-sm text-ink placeholder:text-faint focus:border-primary focus:outline-none";

/** Questions and answers shown after the article (and given to Google as FAQ data). Submitted as JSON. */
export function FaqEditor({ name, initial, error }: { name: string; initial: PostFaq | null; error?: string }) {
  const [title, setTitle] = useState(initial?.title ?? "Frequently Asked Questions");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [items, setItems] = useState(initial?.items ?? []);

  const update = (index: number, patch: Partial<(typeof items)[number]>) =>
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index: number, by: number) =>
    setItems((current) => {
      const next = [...current];
      [next[index], next[index + by]] = [next[index + by]!, next[index]!];
      return next;
    });

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify({ title, subtitle, items })} />
      {items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[13px] font-semibold text-ink">
            Section title
            <input value={title} onChange={(event) => setTitle(event.target.value)} className={`${input} mt-1.5 h-10`} />
          </label>
          <label className="block text-[13px] font-semibold text-ink">
            Intro line <span className="font-normal text-faint">(optional)</span>
            <input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} className={`${input} mt-1.5 h-10`} />
          </label>
        </div>
      )}

      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="rounded-[6px] border border-line bg-surface/50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold tracking-wider text-subtle uppercase">Question {index + 1}</span>
              <div className="flex gap-0.5">
                <button type="button" className={iconButton("default", "size-8")} disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up" title="Move up">
                  <ArrowUp className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className={iconButton("default", "size-8")}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="Move down"
                  title="Move down"
                >
                  <ArrowDown className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className={iconButton("danger", "size-8")}
                  onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                  aria-label={`Remove question ${index + 1}`}
                  title="Remove"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <input
              value={item.question}
              onChange={(event) => update(index, { question: event.target.value })}
              placeholder="Question"
              aria-label={`Question ${index + 1}`}
              className={`${input} h-10 font-medium`}
            />
            <textarea
              value={item.answer}
              onChange={(event) => update(index, { answer: event.target.value })}
              placeholder="Answer"
              aria-label={`Answer to question ${index + 1}`}
              rows={3}
              className={`${input} mt-2 resize-y py-2 leading-relaxed`}
            />
          </li>
        ))}
      </ol>

      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="button" className={dashButton("outline", "sm")} onClick={() => setItems((current) => [...current, { question: "", answer: "" }])}>
        <Plus className="size-4" aria-hidden />
        {items.length === 0 ? "Add an FAQ section" : "Add question"}
      </button>
    </div>
  );
}
