"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  Calendar,
  Filter,
  CheckCircle2,
  FileText,
  BarChart3,
} from "lucide-react";
import { DEMO_EMPLOYEE_COMPETENCIES } from "@/data/demo";
import { PrototypeBadge } from "@/components/ui/Badge";
import { HorizontalCompetencyBar } from "@/components/ui/HorizontalCompetencyBar";

export default function EmployeeProgressPage() {
  const [selectedRange, setSelectedRange] = useState<"90D" | "6M" | "1Y">("90D");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Growth & Progress Analytics
            </h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Auditable competency growth metrics, score progressions, and role benchmark compliance
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(["90D", "6M", "1Y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                selectedRange === range
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {range === "90D" ? "Last 90 Days" : range === "6M" ? "Last 6 Months" : "Last 1 Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Top Growth KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">
            90-Day Competency Index Growth
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900">+7.4%</span>
            <span className="text-xs font-bold text-emerald-600">On Track</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Average competency improved from 61% to 68%
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">
            Evaluations Cleared
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-blue-900">4 Assessments</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Average evaluation score: <strong>72.4%</strong>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">
            Cadre Target Distance
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-indigo-900">8% Remaining</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Current: 68% • Statistical Officer Standard: 76%
          </p>
        </div>
      </div>

      {/* Competency Score Distribution */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Current Competency vs Role Target Breakdown
          </h2>
          <p className="text-xs text-slate-500">
            Comparison against Subordinate Statistical Service benchmark standards
          </p>
        </div>

        <div className="space-y-4">
          {DEMO_EMPLOYEE_COMPETENCIES.map((comp) => (
            <HorizontalCompetencyBar
              key={comp.id}
              name={comp.name}
              current={comp.currentLevel}
              target={comp.roleTargetLevel}
            />
          ))}
        </div>
      </div>

      {/* Historical Milestones */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Official Competency Milestones
        </h2>
        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <p className="font-bold text-slate-900">Statistics & Official Metrics Target Achieved</p>
                <p className="text-slate-500">Score reached 75 / 80 after Advanced Evaluation</p>
              </div>
            </div>
            <span className="text-slate-400">20 May 2026</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <p className="font-bold text-slate-900">SQL Diagnostic Baseline Completed</p>
                <p className="text-slate-500">Scored 71% on census relational queries</p>
              </div>
            </div>
            <span className="text-slate-400">18 May 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
