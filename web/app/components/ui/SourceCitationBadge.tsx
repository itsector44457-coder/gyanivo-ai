import React from "react";
import { FileText, BookmarkCheck } from "lucide-react";

interface SourceCitationBadgeProps {
  document: string;
  page?: number;
  chunkId?: string;
  confidence?: number;
  onClick?: () => void;
  className?: string;
}

export function SourceCitationBadge({
  document,
  page,
  chunkId,
  confidence,
  onClick,
  className = "",
}: SourceCitationBadgeProps) {
  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-wrap items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 ${
        onClick ? "cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-1 font-medium text-slate-900">
        <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
        <span className="truncate max-w-[200px]">{document}</span>
      </div>

      {page && (
        <span className="rounded bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200 shadow-2xs">
          Page {page}
        </span>
      )}

      {chunkId && (
        <span className="font-mono text-[10px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
          {chunkId}
        </span>
      )}

      {confidence !== undefined && (
        <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          <BookmarkCheck className="h-3 w-3" />
          {Math.round(confidence * 100)}% match
        </span>
      )}
    </div>
  );
}
