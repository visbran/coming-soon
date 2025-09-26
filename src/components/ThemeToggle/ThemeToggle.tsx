"use client";

import * as React from "react";
import { ArrowPathIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";

import { resolveThemeForNow, useAutoTheme } from "@/app/theme-provider";

const iconClasses = "h-5 w-5";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { autoThemeEnabled, disableAutoTheme, enableAutoTheme } = useAutoTheme();

  const handleToggle = () => {
    disableAutoTheme();
    const currentTheme = resolvedTheme ?? resolveThemeForNow();
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const handleRestoreAuto = () => {
    enableAutoTheme();
    setTheme(resolveThemeForNow());
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded-full border border-slate-300 bg-white/70 p-2 text-slate-700 shadow-sm transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-slate-500"
        onClick={handleToggle}
        aria-pressed={(resolvedTheme ?? resolveThemeForNow()) === "dark"}
        aria-label="Basculer le thème"
      >
        {(resolvedTheme ?? resolveThemeForNow()) === "dark" ? (
          <SunIcon className={iconClasses} />
        ) : (
          <MoonIcon className={iconClasses} />
        )}
      </button>
      {!autoThemeEnabled && (
        <button
          type="button"
          className="flex items-center gap-1 rounded-full border border-slate-300 bg-white/70 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-slate-500"
          onClick={handleRestoreAuto}
        >
          <ArrowPathIcon className={iconClasses} />
          Auto
        </button>
      )}
    </div>
  );
}
