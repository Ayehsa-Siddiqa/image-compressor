export const THEME_STORAGE_KEY = "theme";

/**
 * Runs before first paint (inlined in <head>) so the page never flashes the wrong theme.
 * Uses the saved choice if there is one, otherwise the operating system setting.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
