"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

export function ThemeToggle() {
  function toggle() {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }

  // Both icons are rendered and CSS picks one, so server and client markup always match.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="grid size-11 place-items-center rounded-full text-body transition-colors hover:bg-surface hover:text-accent"
    >
      <Moon className="size-5 dark:hidden" aria-hidden />
      <Sun className="hidden size-5 dark:block" aria-hidden />
    </button>
  );
}
