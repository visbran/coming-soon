"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

const DAY_START_HOUR = 6;
const NIGHT_START_HOUR = 18;
const AUTO_THEME_STORAGE_KEY = "lmf-auto-theme";

export const resolveThemeForNow = (now: Date = new Date()) => {
  const hour = now.getHours();
  return hour >= NIGHT_START_HOUR || hour < DAY_START_HOUR ? "dark" : "light";
};

type AutoThemeContextValue = {
  autoThemeEnabled: boolean;
  disableAutoTheme: () => void;
  enableAutoTheme: () => void;
};

const AutoThemeContext = React.createContext<AutoThemeContextValue | undefined>(
  undefined
);

export const useAutoTheme = () => {
  const context = React.useContext(AutoThemeContext);
  if (!context) {
    throw new Error("useAutoTheme must be used within ThemeProvider");
  }
  return context;
};

function TimeOfDayThemeSync({
  children,
  autoThemeEnabled,
}: {
  children: React.ReactNode;
  autoThemeEnabled: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  const applyThemeFromClock = React.useCallback(() => {
    if (!autoThemeEnabled) {
      return;
    }
    const desiredTheme = resolveThemeForNow();
    if (resolvedTheme !== desiredTheme) {
      setTheme(desiredTheme);
    }
  }, [autoThemeEnabled, resolvedTheme, setTheme]);

  React.useEffect(() => {
    applyThemeFromClock();
    if (!autoThemeEnabled) {
      return undefined;
    }
    const intervalId = window.setInterval(applyThemeFromClock, 15 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [applyThemeFromClock, autoThemeEnabled]);

  return <>{children}</>;
}

export function ThemeProvider({
  children,
  enableSystem,
  defaultTheme,
  storageKey,
  ...restProps
}: ThemeProviderProps) {
  const [autoThemeEnabled, setAutoThemeEnabled] = React.useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    try {
      const stored = window.localStorage.getItem(AUTO_THEME_STORAGE_KEY);
      if (stored === null) {
        return true;
      }
      return stored === "true";
    } catch {
      return true;
    }
  });

  const [autoTheme, setAutoTheme] = React.useState<"light" | "dark" | undefined>(() =>
    typeof window === "undefined" ? undefined : resolveThemeForNow()
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(
        AUTO_THEME_STORAGE_KEY,
        autoThemeEnabled ? "true" : "false"
      );
    } catch {
      // storage unavailable (e.g. private browsing); ignore
    }
  }, [autoThemeEnabled]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!autoThemeEnabled) {
      setAutoTheme(undefined);
      return;
    }

    const updateTheme = () => setAutoTheme(resolveThemeForNow());
    updateTheme();
    const intervalId = window.setInterval(updateTheme, 15 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [autoThemeEnabled]);

  const contextValue = React.useMemo(
    () => ({
      autoThemeEnabled,
      disableAutoTheme: () => setAutoThemeEnabled(false),
      enableAutoTheme: () => setAutoThemeEnabled(true),
    }),
    [autoThemeEnabled]
  );

  const forcedTheme = autoThemeEnabled ? autoTheme : undefined;
  const effectiveEnableSystem = autoThemeEnabled ? false : enableSystem ?? true;
  const effectiveDefaultTheme = defaultTheme ?? "system";
  const effectiveStorageKey = storageKey ?? "lmf-theme";

  return (
    <NextThemesProvider
      {...restProps}
      enableSystem={effectiveEnableSystem}
      defaultTheme={effectiveDefaultTheme}
      storageKey={effectiveStorageKey}
      forcedTheme={forcedTheme}
    >
      <AutoThemeContext.Provider value={contextValue}>
        <TimeOfDayThemeSync autoThemeEnabled={autoThemeEnabled}>
          {children}
        </TimeOfDayThemeSync>
      </AutoThemeContext.Provider>
    </NextThemesProvider>
  );
}
