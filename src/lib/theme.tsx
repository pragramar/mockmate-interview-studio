import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "interview-coach-theme";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyThemeToDocument(theme: Theme) {
  if (typeof document === "undefined") return;
  const dark = theme === "dark" || (theme === "system" && getSystemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    setThemeState(readStoredTheme());
    setSystemDark(getSystemPrefersDark());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme, systemDark]);

  const value = useMemo<ThemeContextValue>(() => {
    const resolved: "light" | "dark" =
      theme === "dark" || (theme === "system" && systemDark) ? "dark" : "light";
    return {
      theme,
      resolvedTheme: resolved,
      setTheme: (next: Theme) => {
        setThemeState(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // Storage unavailable (private mode): theme still applies for this session.
        }
      },
    };
  }, [theme, systemDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
