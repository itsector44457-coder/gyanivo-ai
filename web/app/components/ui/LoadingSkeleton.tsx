import React from "react";

export function LoadingSkeleton({
  lines = 3,
  height = "h-4",
  className = "",
}: {
  lines?: number;
  height?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-slate-200 rounded-md`}
          style={{ width: `${100 - index * 15}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 animate-pulse shadow-xs">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-8 bg-slate-200 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
  );
}
