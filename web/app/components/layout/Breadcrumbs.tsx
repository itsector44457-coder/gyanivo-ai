"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const capitalize = (s: string) =>
    s
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
      <Link
        href={`/${segments[0]}/dashboard`}
        className="flex items-center gap-1 hover:text-blue-700 transition"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sketu</span>
      </Link>

      {segments.map((seg, idx) => {
        const path = `/${segments.slice(0, idx + 1).join("/")}`;
        const isLast = idx === segments.length - 1;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-900 truncate max-w-[160px] sm:max-w-none">
                {capitalize(seg)}
              </span>
            ) : (
              <Link href={path} className="hover:text-blue-700 transition truncate">
                {capitalize(seg)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
