"use client";

import React from "react";
import Link from "next/link";
import { FileSpreadsheet, Plus, Sparkles, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { DEMO_ASSESSMENTS } from "@/data/demo";
import { Badge, PrototypeBadge } from "@/components/ui/Badge";

export default function TrainerAssessmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Cadre Assessments
            </h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Manage scheduled diagnostic tests, adaptive practice evaluations, and post-training benchmarks
          </p>
        </div>

        <Link
          href="/trainer/assessment-builder"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-900 transition"
        >
          <Plus className="h-4 w-4" />
          Create New Assessment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEMO_ASSESSMENTS.map((a) => (
          <div
            key={a.id}
            className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                  {a.type}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Published
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{a.title}</h3>
              <p className="text-xs text-slate-500">
                Target Competency: <strong className="text-slate-800">{a.competency}</strong>
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                <span>{a.questionCount} Questions</span>
                <span>•</span>
                <span>{a.durationMinutes} Mins</span>
                <span>•</span>
                <span className="text-blue-700 font-semibold">{a.isAdaptive ? "Adaptive AI" : "Fixed Form"}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Participation: <strong>142 Officers</strong>
              </span>
              <button
                onClick={() => alert(`Viewing participation analytics for ${a.title}`)}
                className="text-xs font-bold text-blue-700 hover:text-blue-900"
              >
                View Analytics →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
