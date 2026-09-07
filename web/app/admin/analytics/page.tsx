"use client";

import React from "react";
import { TrendingUp, BarChart3, Users, Award } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

const deptScores = [
  { dept: "NSO", q1: 65, q2: 71, lift: 6 },
  { dept: "ESD", q1: 68, q2: 74, lift: 6 },
  { dept: "SDRD", q1: 63, q2: 69, lift: 6 },
  { dept: "FOD", q1: 55, q2: 62, lift: 7 },
  { dept: "CPD", q1: 52, q2: 58, lift: 6 },
];

const trainingROI = [
  { programme: "GIS Fundamentals", participants: 214, prePct: 28, postPct: 74, lift: 46 },
  { programme: "Python Automation", participants: 187, prePct: 36, postPct: 71, lift: 35 },
  { programme: "Advanced Sampling", participants: 302, prePct: 58, postPct: 82, lift: 24 },
  { programme: "Digital CAPI Tools", participants: 412, prePct: 44, postPct: 69, lift: 25 },
  { programme: "SQL for Analysts", participants: 276, prePct: 48, postPct: 74, lift: 26 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Analytics & Training ROI</h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">Departmental competency trends and training programme effectiveness for MoSPI leadership</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-2xs">
          <Users className="w-5 h-5 text-blue-700 mb-2" />
          <p className="text-xl font-black text-blue-900">1,248</p>
          <p className="text-xs text-blue-700 font-semibold">Officers Assessed</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-2xs">
          <TrendingUp className="w-5 h-5 text-emerald-700 mb-2" />
          <p className="text-xl font-black text-emerald-900">+6.4 pts</p>
          <p className="text-xs text-emerald-700 font-semibold">Avg Q1→Q2 Lift</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 shadow-2xs">
          <BarChart3 className="w-5 h-5 text-purple-700 mb-2" />
          <p className="text-xl font-black text-purple-900">+24.5 pts</p>
          <p className="text-xs text-purple-700 font-semibold">Avg Pre→Post Gain</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-2xs">
          <Award className="w-5 h-5 text-amber-700 mb-2" />
          <p className="text-xl font-black text-amber-900">76.3%</p>
          <p className="text-xs text-amber-700 font-semibold">Assessment Pass Rate</p>
        </div>
      </div>

      {/* Departmental Q1→Q2 comparison */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Departmental Competency: Q1 vs Q2 2026</h2>
        <div className="space-y-4">
          {deptScores.map((d) => (
            <div key={d.dept}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-800">{d.dept}</span>
                <span className="text-emerald-600 font-bold">+{d.lift} pts improvement</span>
              </div>
              <div className="flex gap-1 h-3">
                <div className="bg-slate-300 rounded-l-full" style={{ width: `${d.q1}%` }} title={`Q1: ${d.q1}%`} />
                <div className="bg-blue-500 rounded-r-full" style={{ width: `${d.lift}%` }} title={`Q2: ${d.q2}%`} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>Q1: {d.q1}%</span>
                <span>Q2: {d.q2}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
          <div className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-slate-300 inline-block" /> Q1 Baseline</div>
          <div className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-blue-500 inline-block" /> Q2 Improvement</div>
        </div>
      </div>

      {/* Training ROI */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Training Programme ROI — Pre vs Post Score Lift</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 text-xs font-bold text-slate-500 uppercase">Programme</th>
                <th className="text-right py-2 pr-4 text-xs font-bold text-slate-500 uppercase">Participants</th>
                <th className="text-right py-2 pr-4 text-xs font-bold text-slate-500 uppercase">Pre-Score</th>
                <th className="text-right py-2 pr-4 text-xs font-bold text-slate-500 uppercase">Post-Score</th>
                <th className="text-left py-2 text-xs font-bold text-slate-500 uppercase">Lift</th>
              </tr>
            </thead>
            <tbody>
              {trainingROI.map((r) => (
                <tr key={r.programme} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 pr-4 font-semibold text-slate-800">{r.programme}</td>
                  <td className="py-3 pr-4 text-right text-slate-600">{r.participants}</td>
                  <td className="py-3 pr-4 text-right text-slate-500">{r.prePct}%</td>
                  <td className="py-3 pr-4 text-right text-blue-700 font-bold">{r.postPct}%</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(r.lift / 50) * 100}%` }} />
                      </div>
                      <span className="text-xs font-black text-emerald-700">+{r.lift} pts</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
