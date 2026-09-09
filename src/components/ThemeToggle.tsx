"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "gkm-theme";

/** Fired on toggle so every mounted toggle re-reads the theme. */
const THEME_EVENT = "gkm-theme-change";

/**
 * Runs before first paint (see layout.tsx) so the page never flashes the
 * wrong theme. Kept as a string because it has to be inlined into the
 * document, ahead of React.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

function readTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * The theme lives in the DOM and the OS, not in React — so it's read
 * through useSyncExternalStore rather than mirrored into state.
 */
function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

export default function ThemeToggle() {
  // "unknown" on the server: the theme depends on a device preference the
  // server can't see, so both sides render a neutral glyph and the client
  // corrects it immediately after hydration.
  const theme = useSyncExternalStore<Theme | "unknown">(
    subscribe,
    readTheme,
    () => "unknown"
  );

  const toggle = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage — the choice just won't persist.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const isDark = theme === "dark";
  const label =
    theme === "unknown"
      ? "Switch colour theme"
      : `Switch to ${isDark ? "day" : "night"} theme`;

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-line-soft text-paper-faint transition-colors hover:border-line hover:text-glow"
    >
      <span aria-hidden="true" className="text-[0.9rem] leading-none">
        {theme === "unknown" ? "◐" : isDark ? "☾" : "☀"}
      </span>
    </button>
  );
}
