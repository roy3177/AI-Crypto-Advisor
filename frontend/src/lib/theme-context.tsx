"use client";

import { Moon, Sun } from "lucide-react";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "crypto_advisor_theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

/**
 * A tiny inline script that runs before React hydrates, so the page never
 * flashes the wrong theme while JavaScript loads (the same class it sets
 * here is what ThemeProvider reads and keeps in sync afterward).
 */
export function ThemeScript() {
  const script = `
    try {
      var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
      var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (dark) document.documentElement.classList.add("dark");
    } catch (e) {}
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

function readInitialTheme(): Theme {
  // The inline ThemeScript already set this class before hydration --
  // reading it back here (instead of defaulting to "light" and correcting
  // in an effect) avoids a flash of the wrong theme on first paint.
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme just won't persist across reloads in this session.
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

const noSubscription = () => () => {};

/**
 * True once the component is running on the client. `useSyncExternalStore`
 * (rather than a `useEffect` + `setState` "mounted" flag) is the primitive
 * React provides specifically for values that are allowed to differ
 * between the server-rendered HTML and the client's first render --
 * it deliberately opts this read out of hydration-mismatch checking
 * instead of tripping one.
 */
function useIsClient() {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  // The server always renders as if theme === "light" (it has no access to
  // the client's localStorage/media-query preference), but `theme` itself
  // is already correct on the client's very first render -- ThemeScript
  // sets the "dark" class before hydration, and `readInitialTheme` reads
  // it straight back. That mismatch between what the server rendered and
  // what the client would render is a real, if harmless, hydration error.
  // `useIsClient` keeps the first client render identical to the
  // server's, then swaps to the real icon a tick later.
  const isClient = useIsClient();
  const showMoon = !isClient || theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border bg-surface text-muted transition-colors hover:text-foreground hover:bg-accent-soft ${className}`}
    >
      {showMoon ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
