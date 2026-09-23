import React from "react";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "critical"
  | "prototype"
  | "sample";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  primary:   "bg-blue-50 text-blue-700 ring-blue-200",
  secondary: "bg-gray-100 text-gray-600 ring-gray-200",
  success:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning:   "bg-amber-50 text-amber-700 ring-amber-200",
  danger:    "bg-red-50 text-red-600 ring-red-200",
  critical:  "bg-red-50 text-red-600 ring-red-200 font-semibold",
  info:      "bg-sky-50 text-sky-700 ring-sky-200",
  prototype: "bg-indigo-50 text-indigo-700 ring-indigo-200 font-mono text-[10px]",
  sample:    "bg-gray-50 text-gray-500 ring-gray-200 font-mono text-[10px]",
};

const SIZE_STYLES: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function Badge({
  children,
  variant = "primary",
  size = "sm",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ring-1 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export function PrototypeBadge({ label = "MoSPI Cadre Verified" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {label}
    </span>
  );
}

export function SampleCatalogueBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">
      iGOT Karmayogi
    </span>
  );
}
