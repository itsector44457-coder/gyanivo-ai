"use client";

import React from "react";
import { Users, TrendingUp, AlertTriangle, BookOpen, BarChart3, Award, ArrowUpRight, Building2 } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

const kpiCards = [
  { label: "Total Employees", value: "1,248", icon: Users, color: "text-blue-700", bg: "bg-blue-50", delta: "+12 this month" },
  { label: "Avg Competency Score", value: "67%", icon: Award, color: "text-emerald-700", bg: "bg-emerald-50", delta: "+3pts from Q1" },
  { label: "Critical Skill Gaps", value: "184", icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50", delta: "Across 5 departments" },
  { label: "Training Completion", value: "78%", icon: BookOpen, color: "text-indigo-700", bg: "bg-indigo-50", delta: "Target: 85%" },
];

const departments = [
  { name: "NSO", fullName: "National Statistical Office", employees: 412, avgScore: 71, gaps: 38, completion: 82 },
  { name: "FOD", fullName: "Field Operations Division", employees: 318, avgScore: 62, gaps: 54, completion: 74 },
  { name: "SDRD", fullName: "Social Div. & Research", employees: 187, avgScore: 69, gaps: 28, completion: 80 },
  { name: "ESD", fullName: "Economic Statistics Division", employees: 203, avgScore: 74, gaps: 32, completion: 85 },
  { name: "CPD", fullName: "Capacity Planning Division", employees: 128, avgScore: 58, gaps: 32, completion: 66 },
];

const commonGaps = [
  { competency: "GIS & Spatial Statistics", affected: 340, severity: "Critical" },
  { competency: "Python / R for Data", affected: 287, severity: "Critical" },
  { competency: "SQL & Database Querying", affected: 214, severity: "High" },
  { competency: "Digital Governance Tools", affected: 198, severity: "High" },
  { competency: "Advanced Sampling Methods", affected: 156, severity: "Medium" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Command Centre</h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ministry of Statistics & Programme Implementation — Competency Intelligence Overview
          </p>
        </div>
        <div className="text-xs text-slate-400 border border-slate-200 rounded-lg px-3 py-2 bg-white">
          Last refreshed: 25 Aug 2026, 09:00 IST
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex gap-4 items-start">
              <div className={`${card.bg} rounded-lg p-2.5`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
                <p className={`text-2xl font-black mt-1 ${card.color}`}>{card.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{card.delta}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Competency Comparison */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Department Competency Comparison
            </h2>
            <p className="text-xs text-slate-500">Average competency score vs. training completion rate by division</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 text-xs font-bold text-slate-500 uppercase">Division</th>
                <th className="text-right py-2 pr-4 text-xs font-bold text-slate-500 uppercase">Officers</th>
                <th className="text-left py-2 pr-4 text-xs font-bold text-slate-500 uppercase w-40">Avg Score</th>
                <th className="text-left py-2 pr-4 text-xs font-bold text-slate-500 uppercase w-40">Completion</th>
                <th className="text-right py-2 text-xs font-bold text-slate-500 uppercase">Gaps</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.name} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 pr-4">
                    <p className="font-bold text-slate-900">{d.name}</p>
                    <p className="text-[11px] text-slate-400">{d.fullName}</p>
                  </td>
                  <td className="py-3 pr-4 text-right text-slate-600">{d.employees}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.avgScore >= 70 ? "bg-emerald-500" : d.avgScore >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${d.avgScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{d.avgScore}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.completion >= 80 ? "bg-blue-500" : "bg-orange-400"}`}
                          style={{ width: `${d.completion}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{d.completion}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d.gaps > 40 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                      {d.gaps}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Organisation-Wide Critical Gaps
          </h2>
          <div className="space-y-3">
            {commonGaps.map((g) => (
              <div key={g.competency} className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{g.competency}</p>
                  <p className="text-xs text-slate-400">{g.affected} officers affected</p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${g.severity === "Critical" ? "bg-red-50 text-red-700" : g.severity === "High" ? "bg-amber-50 text-amber-700" : "bg-yellow-50 text-yellow-700"}`}>
                  {g.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Training Effectiveness (Q2 2026)
          </h2>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-800">Average Pre→Post Score Lift</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">+24.5 pts</p>
              <p className="text-xs text-emerald-600">Across 312 completed training cycles</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs font-bold text-blue-800">iGOT Courses Completed</p>
              <p className="text-2xl font-black text-blue-700 mt-1">2,847</p>
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">VERIFIED</span>
                MoSPI NSSTA & iGOT aligned modules
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-800">Assessment Pass Rate</p>
              <p className="text-2xl font-black text-slate-700 mt-1">76.3%</p>
              <p className="text-xs text-slate-500">Diagnostic + post-training assessments combined</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
