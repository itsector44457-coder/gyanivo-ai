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

export function Badge({
  children,
  variant = "primary",
  size = "sm",
  className = "",
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    critical: "bg-red-50 text-red-700 border-red-200 font-semibold",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    prototype: "bg-indigo-50 text-indigo-700 border-indigo-200 font-mono tracking-wide text-[10px] uppercase font-semibold",
    sample: "bg-slate-100 text-slate-600 border-slate-300 font-mono tracking-wide text-[10px] uppercase font-medium",
  };

  const sizeStyles: Record<"sm" | "md" | "lg", string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export function PrototypeBadge({ label = "PROTOTYPE DEMO DATA" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-300 bg-slate-100 text-[11px] font-semibold text-slate-700 tracking-wider">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-pulse"></span>
      {label}
    </span>
  );
}

export function SampleCatalogueBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-800 tracking-wide uppercase">
      SAMPLE CATALOGUE
    </span>
  );
}
