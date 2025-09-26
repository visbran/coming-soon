"use client";

import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import data from "../../../data/data";

function Header() {
  const { sitename, sitetagline, siteurl } = data;
  return (
    <header className="w-full max-w-5xl">
      <div className="flex justify-end py-4">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <a
          className="flex flex-col place-items-center gap-2 text-balance"
          href={siteurl}
          rel="noopener noreferrer"
        >
          <h1 className="text-2xl font-semibold uppercase tracking-wide text-sky-500 dark:text-sky-300 lg:text-4xl">
            {sitename}
          </h1>
          <p className="m-2 text-xl text-slate-800 dark:text-slate-100">
            {sitetagline}
          </p>
        </a>
      </div>
    </header>
  );
}

export default Header;
