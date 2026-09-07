"use client";

import React, { useState } from "react";
import { AlertTriangle, Filter } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

const orgGaps = [
  { competency: "GIS & Spatial Statistics", domain: "Technical", critical: 340, high: 112, medium: 88, depts: ["NSO", "FOD", "SDRD"] },
  { competency: "Python / R Programming", domain: "Technical", critical: 287, high: 142, medium: 98, depts: ["NSO", "ESD", "SDRD"] },
  { competency: "SQL & Database Querying", domain: "Technical", critical: 214, high: 168, medium: 120, depts: ["FOD", "CPD"] },
  { competency: "Digital Governance Tools", domain: "Digital Governance", critical: 198, high: 205, medium: 145, depts: ["FOD", "CPD", "NSO"] },
  { competency: "Field Data Collection (CAPI)", domain: "Digital Governance", critical: 175, high: 120, medium: 88, depts: ["FOD"] },
  { competency: "Advanced Sampling Methods", domain: "Statistical", critical: 156, high: 188, medium: 132, depts: ["NSO", "SDRD", "ESD"] },
  { competency: "Data Analysis & Visualization", domain: "Statistical", critical: 98, high: 215, medium: 178, depts: ["CPD", "ESD"] },
  { competency: "Research & Report Writing", domain: "Behavioural", critical: 56, high: 128, medium: 204, depts: ["FOD", "CPD"] },
];

const domainColors: Record<string, string> = {
  Technical: "bg-blue-50 text-blue-700",
  "Digital Governance": "bg-purple-50 text-purple-700",
  Statistical: "bg-emerald-50 text-emerald-700",
  Behavioural: "bg-amber-50 text-amber-700",
};

export default function AdminSkillGapsPage() {
  const [filter, setFilter] = useState("All");
  const domains = ["All", "Technical", "Statistical", "Digital Governance", "Behavioural"];

  const filtered = orgGaps.filter((g) => filter === "All" || g.domain === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Organisation Skill Gap Analysis</h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">Distribution of skill gaps across 1,248 officers in MoSPI divisions</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-2xl font-black text-red-700">184</p>
          <p className="text-xs font-bold text-red-600 uppercase mt-1">Critical Gaps</p>
          <p className="text-[11px] text-red-500">Score &lt;40% vs target</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-black text-amber-700">478</p>
          <p className="text-xs font-bold text-amber-600 uppercase mt-1">High Gaps</p>
          <p className="text-[11px] text-amber-500">40–59% vs target</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="text-2xl font-black text-yellow-700">586</p>
          <p className="text-xs font-bold text-yellow-600 uppercase mt-1">Medium Gaps</p>
          <p className="text-[11px] text-yellow-500">60–79% vs target</p>
        </div>
      </div>

      {/* Domain filter */}
      <div className="flex gap-2 flex-wrap">
        {domains.map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${filter === d ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Gap table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Competency</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-red-500 uppercase">Critical</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-amber-500 uppercase">High</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-yellow-500 uppercase hidden sm:table-cell">Medium</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">Affected Depts</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Distribution</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => {
              const total = g.critical + g.high + g.medium;
              return (
                <tr key={g.competency} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 text-sm">{g.competency}</p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${domainColors[g.domain]}`}>{g.domain}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-black text-red-700">{g.critical}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-black text-amber-700">{g.high}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-sm font-black text-yellow-700">{g.medium}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {g.depts.map((d) => (
                        <span key={d} className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{d}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex h-2 rounded-full overflow-hidden w-32">
                      <div className="bg-red-400" style={{ width: `${(g.critical / total) * 100}%` }} />
                      <div className="bg-amber-400" style={{ width: `${(g.high / total) * 100}%` }} />
                      <div className="bg-yellow-300" style={{ width: `${(g.medium / total) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
