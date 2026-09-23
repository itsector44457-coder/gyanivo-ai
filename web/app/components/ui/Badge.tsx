import React from "react";

export type BadgeVariant =
  | "primary" | "secondary" | "success" | "warning"
  | "danger" | "info" | "critical" | "prototype" | "sample";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  primary:   "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30",
  secondary: "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700",
  success:   "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  warning:   "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
  danger:    "bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30",
  critical:  "bg-red-50 text-red-600 ring-red-200 font-semibold dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30",
  info:      "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/30",
  prototype: "bg-indigo-50 text-indigo-700 ring-indigo-200 font-mono text-[10px] dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/30",
  sample:    "bg-gray-50 text-gray-500 ring-gray-200 font-mono text-[10px] dark:bg-gray-800 dark:text-gray-500 dark:ring-gray-700",
};

const SIZE_STYLES: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function Badge({ children, variant = "primary", size = "sm", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ring-1 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}>
      {children}
    </span>
  );
}

export function PrototypeBadge({ label = "MoSPI Cadre Verified" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
      {label}
    </span>
  );
}

export function SampleCatalogueBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30">
      iGOT Karmayogi
    </span>
  );
}
