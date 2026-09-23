"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "How it works", href: "/how-it-works" },
  { name: "Roles", href: "/roles" },
  { name: "Assessments", href: "/assessments" },
  { name: "Analytics", href: "/analytics" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* ── Logo ── */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <img
              src="/Disha_AI_Logo.png"
              alt="Disha AI"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="leading-none">
            <span className="text-[17px] font-bold tracking-tight text-gray-950">
              Disha
              <span className="ml-0.5 text-blue-600">AI</span>
            </span>
            <p className="mt-0.5 hidden text-[9px] font-medium tracking-widest text-gray-400 sm:block">
              SKILL · LEARN · GROW
            </p>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                  active
                    ? "text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.name}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right side ── */}
        <div className="flex items-center gap-3">

          {/* Gov branding — desktop only */}
          <div className="hidden items-center gap-2.5 border-r border-gray-200 pr-4 xl:flex">
            <span className="text-base">🇮🇳</span>
            <div className="leading-tight">
              <p className="text-[10px] font-semibold text-gray-700">
                Ministry of Statistics
              </p>
              <p className="text-[9px] text-gray-400">
                Govt. of India
              </p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] sm:inline-flex"
          >
            Sign in
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={`overflow-hidden border-t border-gray-100 bg-white transition-all duration-200 lg:hidden ${
          open ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 pb-5 pt-3 sm:px-8">

          {/* gov strip */}
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-lg">🇮🇳</span>
            <div>
              <p className="text-xs font-semibold text-gray-800">
                Ministry of Statistics &amp; Programme Implementation
              </p>
              <p className="text-[11px] text-gray-400">Government of India</p>
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
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
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
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
