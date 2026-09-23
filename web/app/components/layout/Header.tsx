"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";

const navLinks = [
  { name: "Home",         href: "/" },
  { name: "Features",     href: "/features" },
  { name: "How it works", href: "/how-it-works" },
  { name: "Roles",        href: "/roles" },
  { name: "Assessments",  href: "/assessments" },
  { name: "Analytics",    href: "/analytics" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* logo */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <img src="/Disha_AI_Logo.png" alt="Disha AI" className="h-full w-full object-contain" />
          </div>
          <div className="leading-none">
            <span className="text-[17px] font-bold tracking-tight text-gray-950 dark:text-white">
              Disha<span className="ml-0.5 text-blue-600 dark:text-blue-400">AI</span>
            </span>
            <p className="mt-0.5 hidden text-[9px] font-medium tracking-widest text-gray-400 dark:text-gray-600 sm:block">
              SKILL · LEARN · GROW
            </p>
          </div>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                  active
                    ? "text-blue-700 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                {link.name}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* right */}
        <div className="flex items-center gap-2">
          {/* gov branding */}
          <div className="hidden items-center gap-2.5 border-r border-gray-200 pr-4 dark:border-gray-700 xl:flex">
            <span className="text-base">🇮🇳</span>
            <div className="leading-tight">
              <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Ministry of Statistics</p>
              <p className="text-[9px] text-gray-400 dark:text-gray-600">Govt. of India</p>
            </div>
          </div>

          {/* theme toggle */}
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* CTA */}
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600 sm:inline-flex"
          >
            Sign in
          </Link>

          {/* hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`overflow-hidden border-t border-gray-100 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-950 lg:hidden ${
          open ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 pb-5 pt-3 sm:px-8">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
            <span className="text-lg">🇮🇳</span>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                Ministry of Statistics &amp; Programme Implementation
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-600">Government of India</p>
            </div>
          </div>

          <nav className="space-y-0.5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white dark:bg-blue-500"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
