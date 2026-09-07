"use client";

import React from "react";
import { BarChart3, TrendingUp, Users, Award, CheckCircle2, AlertTriangle } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

export default function TrainerAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Trainer Curriculum & Evaluation Analytics
            </h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Psychometric item difficulty, question rejection rates, and pre vs post-training gains
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Assessment Participation</span>
          <p className="text-3xl font-black text-slate-900 mt-2">1,048</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">84% completion rate across cadre</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Average Score</span>
          <p className="text-3xl font-black text-blue-900 mt-2">71.2%</p>
          <p className="text-[11px] text-slate-500 mt-1">Passing threshold: 60%</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Question Rejection Rate</span>
          <p className="text-3xl font-black text-emerald-700 mt-2">3.8%</p>
          <p className="text-[11px] text-slate-500 mt-1">High AI generation accuracy</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Pre vs Post Score Lift</span>
          <p className="text-3xl font-black text-indigo-900 mt-2">+24.5 pts</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Measurable training ROI</p>
        </div>
      </div>

      {/* Pre vs Post Comparison Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Training Programme Effectiveness (Pre vs Post Training Scores)
          </h2>
          <p className="text-xs text-slate-500">
            Cadre performance comparison before and after completing NSSTA training modules
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>GIS Fundamentals for Official Statistics</span>
              <span className="text-emerald-700">Pre: 28% → Post: 74% (+46 pts)</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-slate-400" style={{ width: "28%" }} />
              <div className="h-full bg-emerald-500" style={{ width: "46%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Python for Survey Data Automation</span>
              <span className="text-emerald-700">Pre: 36% → Post: 71% (+35 pts)</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-slate-400" style={{ width: "36%" }} />
              <div className="h-full bg-emerald-500" style={{ width: "35%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Advanced Sampling & Variance Estimation</span>
              <span className="text-emerald-700">Pre: 58% → Post: 82% (+24 pts)</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-slate-400" style={{ width: "58%" }} />
              <div className="h-full bg-emerald-500" style={{ width: "24%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
