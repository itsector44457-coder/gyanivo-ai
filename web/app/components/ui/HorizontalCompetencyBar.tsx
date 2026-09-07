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
  const currentPercent = Math.min(100, Math.max(0, (current / max) * 100));
  const targetPercent = Math.min(100, Math.max(0, (target / max) * 100));
  const isTargetMet = current >= target;

  // Status color
  const getBarColor = () => {
    if (isTargetMet) return "bg-emerald-600";
    if (target - current <= 10) return "bg-blue-600";
    if (target - current <= 25) return "bg-amber-500";
    return "bg-rose-500";
  };

  const heights = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="font-medium text-slate-800">{name}</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Score: <strong className="text-slate-900">{current}</strong> / {max}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">
              Target: <span className="font-semibold text-blue-700">{target}</span>
            </span>
            {target > current ? (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                -{target - current}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Target Met
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className={`relative w-full bg-slate-100 rounded-full overflow-visible ${heights[size]}`}>
        {/* Progress fill */}
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${currentPercent}%` }}
        />

        {/* Target marker indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10 -mt-1 -mb-1"
          style={{ left: `${targetPercent}%` }}
          title={`Role Target: ${target}%`}
        >
          <div className="absolute -top-3.5 -translate-x-1/2 text-[9px] font-bold text-slate-600 uppercase tracking-tighter bg-white/90 px-1 rounded shadow-xs border border-slate-200">
            Target
          </div>
        </div>
      </div>
    </div>
  );
}
