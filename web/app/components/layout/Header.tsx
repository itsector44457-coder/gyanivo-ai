"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Menu,
  X,
  ShieldCheck,
  QrCode,
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Roles", href: "/roles" },
  { name: "Assessments", href: "/assessments" },
  { name: "Analytics", href: "/analytics" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ================= TOP SIH BAR ================= */}
      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[11px] text-slate-600 sm:text-xs">
            <ShieldCheck className="h-4 w-4 text-blue-600" />

            <span className="font-semibold text-blue-700">
              SIH26101
            </span>

            <span className="hidden text-slate-300 sm:inline">|</span>

            <span className="hidden sm:inline">
              AI for India&apos;s Official Statistical System
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <Link
              href="/qr"
              className="inline-flex items-center gap-1.5 rounded-md bg-white border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 hover:bg-blue-50 transition shadow-2xs"
            >
              <QrCode className="h-3 w-3 text-blue-600" />
              <span>Mobile QR</span>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Smart India Hackathon
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1450px] items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* ================= LOGO ================= */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-blue-500/10 transition duration-300 group-hover:scale-105 group-hover:shadow-blue-500/20">
              <img
                src="/Disha_AI_Logo.png"
                alt="Disha AI Logo"
                className="h-full w-full object-contain p-0.5"
              />
            </div>

            <div className="leading-none">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-[22px]">
                  Disha
                  <span className="ml-1 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    AI
                  </span>
                </span>
              </div>

              <p className="mt-1 hidden text-[9px] font-medium tracking-[0.06em] text-slate-500 sm:block">
                SKILL • LEARN • GROW
              </p>
            </div>
          </Link>

          {/* ================= DESKTOP NAV ================= */}
          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
                  }`}
                >
                  {link.name}

                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-blue-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ================= RIGHT SIDE ================= */}
          <div className="flex items-center gap-3">
            
            {/* Government Branding */}
            <div className="hidden items-center gap-3 border-r border-slate-200 pr-4 lg:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
                <span className="text-lg">🇮🇳</span>
              </div>

              <div className="leading-tight">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-800">
                  Ministry of Statistics
                </p>
                <p className="text-[9px] text-slate-500">
                  & Programme Implementation
                </p>
                <p className="mt-0.5 text-[9px] font-medium text-blue-600">
                  Government of India
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/login"
              className="group hidden items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 sm:flex"
            >
              Get Started

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 xl:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        <div
          className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 xl:hidden ${
            mobileMenuOpen
              ? "max-h-[650px] opacity-100"
              : "max-h-0 border-transparent opacity-0"
          }`}
        >
          <div className="mx-auto max-w-[1450px] px-4 py-5 sm:px-6">
            
            {/* Mobile Government Info */}
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                🇮🇳
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Ministry of Statistics & Programme Implementation
                </p>

                <p className="mt-1 text-[11px] text-blue-600">
                  Government of India
                </p>
              </div>
            </div>

            {/* Mobile Links */}
            <nav className="grid gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {link.name}

                    {active && (
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile CTA */}
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
