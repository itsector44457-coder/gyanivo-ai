"use client";

import React, { useState } from "react";
import { Briefcase, Users, ChevronRight, Plus } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

const jobRoles = [
  {
    id: "JR001",
    title: "Statistical Officer",
    cadre: "SSS Cadre",
    grade: "Group B Gazetted",
    department: "NSO / FOD",
    headcount: 428,
    avgScore: 64,
    benchmarks: [
      { name: "Statistical Methods", target: 80, avg: 70 },
      { name: "Python/R Programming", target: 70, avg: 38 },
      { name: "SQL & Database", target: 65, avg: 58 },
      { name: "GIS & Spatial", target: 60, avg: 25 },
    ],
  },
  {
    id: "JR002",
    title: "Senior Statistical Officer",
    cadre: "SSS Cadre",
    grade: "Group A",
    department: "NSO / ESD",
    headcount: 214,
    avgScore: 74,
    benchmarks: [
      { name: "Statistical Methods", target: 85, avg: 78 },
      { name: "Data Analysis & Viz", target: 75, avg: 69 },
      { name: "Research & Policy Writing", target: 70, avg: 64 },
    ],
  },
  {
    id: "JR003",
    title: "Data Analyst",
    cadre: "Technical",
    grade: "Group B",
    department: "SDRD / ESD",
    headcount: 187,
    avgScore: 68,
    benchmarks: [
      { name: "Python/R Programming", target: 80, avg: 65 },
      { name: "SQL & Database", target: 80, avg: 72 },
      { name: "Data Visualization", target: 70, avg: 60 },
    ],
  },
  {
    id: "JR004",
    title: "Field Investigator",
    cadre: "Field Ops",
    grade: "Group C",
    department: "FOD",
    headcount: 318,
    avgScore: 55,
    benchmarks: [
      { name: "Survey Data Collection", target: 85, avg: 70 },
      { name: "Digital Tools / CAPI", target: 75, avg: 48 },
      { name: "Field Quality Control", target: 70, avg: 54 },
    ],
  },
  {
    id: "JR005",
    title: "Joint Director",
    cadre: "IAS / ISS",
    grade: "Group A Senior",
    department: "CPD / HQ",
    headcount: 54,
    avgScore: 82,
    benchmarks: [
      { name: "Strategic Planning", target: 85, avg: 80 },
      { name: "Policy & Governance", target: 80, avg: 79 },
      { name: "Statistical Leadership", target: 80, avg: 84 },
    ],
  },
];

export default function AdminJobRolesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Job Roles & Cadre</h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">MoSPI cadre-wise role definitions with competency benchmark targets</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Role
        </button>
      </div>

      <div className="space-y-3">
        {jobRoles.map((role) => (
          <div key={role.id} className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 text-left"
              onClick={() => setExpanded(expanded === role.id ? null : role.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{role.title}</p>
                  <p className="text-xs text-slate-500">{role.cadre} · {role.grade} · {role.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" /> {role.headcount} officers</p>
                  <p className={`text-sm font-bold ${role.avgScore >= 70 ? "text-emerald-700" : "text-amber-700"}`}>Avg {role.avgScore}%</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expanded === role.id ? "rotate-90" : ""}`} />
              </div>
            </button>

            {expanded === role.id && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Competency Benchmarks</p>
                <div className="space-y-3">
                  {role.benchmarks.map((b) => (
                    <div key={b.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{b.name}</span>
                        <span className="text-slate-400">Avg: <span className={`font-bold ${b.avg >= b.target ? "text-emerald-700" : "text-amber-700"}`}>{b.avg}%</span> / Target: {b.target}%</span>
                      </div>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-200 rounded-full" style={{ width: `${b.target}%` }} />
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full ${b.avg >= b.target ? "bg-emerald-500" : "bg-amber-400"}`}
                          style={{ width: `${b.avg}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
