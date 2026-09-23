import React from "react";

interface HorizontalCompetencyBarProps {
  name: string;
  current: number;
  target: number;
  max?: number;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function HorizontalCompetencyBar({
  name,
  current,
  target,
  max = 100,
  showLabels = true,
  size = "md",
  className = "",
}: HorizontalCompetencyBarProps) {
  const currentPct = Math.min(100, Math.max(0, (current / max) * 100));
  const targetPct  = Math.min(100, Math.max(0, (target  / max) * 100));
  const met  = current >= target;
  const gap  = target - current;

  const barColor =
    met         ? "bg-emerald-500"
    : gap <= 10 ? "bg-blue-500"
    : gap <= 25 ? "bg-amber-400"
    : "bg-red-400";

  const heights: Record<"sm" | "md" | "lg", string> = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-500">
            <span>
              Score: <strong className="text-gray-900 dark:text-white">{current}</strong>/{max}
            </span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span>
              Target: <span className="font-semibold text-blue-700 dark:text-blue-400">{target}</span>
            </span>
            {met ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                Met
              </span>
            ) : (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-500 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30">
                −{gap}
              </span>
            )}
          </div>
        </div>
      )}

      <div className={`relative w-full overflow-visible rounded-full bg-gray-100 dark:bg-gray-800 ${heights[size]}`}>
        {/* fill */}
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${currentPct}%` }}
        />
        {/* target marker */}
        <div
          className="absolute bottom-0 top-0 w-0.5 bg-gray-400/60 dark:bg-gray-500/60"
          style={{ left: `${targetPct}%` }}
          title={`Target: ${target}%`}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1 text-[9px] font-semibold text-gray-500 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">
            {target}%
          </div>
        </div>
      </div>
    </div>
  );
}
