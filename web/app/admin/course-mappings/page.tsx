"use client";

import React, { useState } from "react";
import { Link2, Star, Pencil, Trash2, Plus } from "lucide-react";
import { PrototypeBadge, SampleCatalogueBadge } from "@/components/ui/Badge";

const mappings = [
  {
    id: "M001",
    course: "GIS Fundamentals for Official Statistics",
    source: "NSSTA",
    competency: "GIS & Spatial Statistics",
    weight: 92,
    roles: ["Statistical Officer"],
    gap: "Critical",
  },
  {
    id: "M002",
    course: "Python for Survey Data Automation",
    source: "NSSTA",
    competency: "Python / R Programming",
    weight: 88,
    roles: ["Statistical Officer", "Data Analyst"],
    gap: "Critical",
  },
  {
    id: "M003",
    course: "SQL for Government Data Analysts",
    source: "iGOT",
    competency: "SQL & Database Querying",
    weight: 85,
    roles: ["Data Analyst", "Statistical Officer"],
    gap: "High",
  },
  {
    id: "M004",
    course: "Advanced Sampling & Variance Estimation",
    source: "NSSTA",
    competency: "Sampling Theory & Design",
    weight: 90,
    roles: ["Statistical Officer", "Sr. Statistical Officer"],
    gap: "Medium",
  },
  {
    id: "M005",
    course: "Digital Data Collection using CSPro/CAPI",
    source: "iGOT",
    competency: "Field Data Collection (CAPI)",
    weight: 87,
    roles: ["Field Investigator"],
    gap: "High",
  },
  {
    id: "M006",
    course: "eOffice & Digital Governance Compliance",
    source: "iGOT",
    competency: "Digital Governance Tools",
    weight: 79,
    roles: ["All Roles"],
    gap: "High",
  },
];

const gapColors: Record<string, string> = {
  Critical: "bg-red-50 text-red-700",
  High: "bg-amber-50 text-amber-700",
  Medium: "bg-yellow-50 text-yellow-700",
};

export default function AdminCourseMappingsPage() {
  const [filter, setFilter] = useState("All");

  const filtered = mappings.filter((m) => filter === "All" || m.gap === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Course–Competency Mappings</h1>
            <PrototypeBadge />
            <SampleCatalogueBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">AI-computed semantic match weights between courses and competency gaps. Official MoSPI & iGOT curriculum alignments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shrink-0">
          <Plus className="w-4 h-4" /> Add Mapping
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All", "Critical", "High", "Medium"].map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${filter === g ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Course</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">Competency</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Match Weight</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Target Roles</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Gap Priority</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900 text-sm leading-snug">{m.course}</p>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${m.source === "iGOT" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>{m.source}</span>
                </td>
                <td className="px-4 py-3 text-slate-600 hidden lg:table-cell text-xs">{m.competency}</td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${m.weight}%` }} />
                    </div>
                    <span className="text-xs font-black text-emerald-700">{m.weight}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {m.roles.map((r) => (
                      <span key={r} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{r}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${gapColors[m.gap]}`}>{m.gap}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
