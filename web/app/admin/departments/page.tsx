"use client";

import React from "react";
import { Users, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

const departments = [
  {
    code: "NSO",
    name: "National Statistical Office",
    employees: 412,
    avgScore: 71,
    criticalGaps: 38,
    completion: 82,
    topGap: "GIS & Spatial Statistics",
    color: "border-blue-200 bg-blue-50",
    scoreColor: "text-blue-700",
  },
  {
    code: "FOD",
    name: "Field Operations Division",
    employees: 318,
    avgScore: 62,
    criticalGaps: 54,
    completion: 74,
    topGap: "Digital Data Collection Tools",
    color: "border-orange-200 bg-orange-50",
    scoreColor: "text-orange-700",
  },
  {
    code: "SDRD",
    name: "Social Division & Research",
    employees: 187,
    avgScore: 69,
    criticalGaps: 28,
    completion: 80,
    topGap: "Advanced Statistical Methods",
    color: "border-purple-200 bg-purple-50",
    scoreColor: "text-purple-700",
  },
  {
    code: "ESD",
    name: "Economic Statistics Division",
    employees: 203,
    avgScore: 74,
    criticalGaps: 32,
    completion: 85,
    topGap: "Python / R Automation",
    color: "border-emerald-200 bg-emerald-50",
    scoreColor: "text-emerald-700",
  },
  {
    code: "CPD",
    name: "Capacity Planning Division",
    employees: 128,
    avgScore: 58,
    criticalGaps: 32,
    completion: 66,
    topGap: "SQL & Database Querying",
    color: "border-rose-200 bg-rose-50",
    scoreColor: "text-rose-700",
  },
];

export default function AdminDepartmentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Departments & Divisions</h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            MoSPI divisional competency overview — 5 divisions, 1,248 officers
          </p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <p className="text-2xl font-black text-slate-900">5</p>
          <p className="text-xs text-slate-500 font-semibold uppercase mt-1">Divisions</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <p className="text-2xl font-black text-slate-900">1,248</p>
          <p className="text-xs text-slate-500 font-semibold uppercase mt-1">Officers</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <p className="text-2xl font-black text-amber-700">67%</p>
          <p className="text-xs text-slate-500 font-semibold uppercase mt-1">Avg Score</p>
        </div>
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <div key={dept.code} className={`rounded-xl border-2 ${dept.color} p-5 space-y-4`}>
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-xs font-black px-2 py-0.5 rounded bg-white border border-current ${dept.scoreColor}`}>
                  {dept.code}
                </span>
                <p className="text-sm font-bold text-slate-800 mt-2">{dept.name}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black ${dept.scoreColor}`}>{dept.avgScore}%</p>
                <p className="text-[11px] text-slate-500">avg score</p>
              </div>
            </div>

            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${dept.avgScore >= 70 ? "bg-emerald-500" : dept.avgScore >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                style={{ width: `${dept.avgScore}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg p-2">
                <p className="text-sm font-black text-slate-900">{dept.employees}</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Officers</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-sm font-black text-red-600">{dept.criticalGaps}</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Gaps</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-sm font-black text-blue-700">{dept.completion}%</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Complete</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-2.5 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-500">Top Gap</p>
                <p className="text-xs font-semibold text-slate-800">{dept.topGap}</p>
              </div>
            </div>

            <button className="w-full text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center justify-center gap-1 py-1">
              View Division Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
