"use client";

import React, { useState } from "react";
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, MoreVertical } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

const assessments = [
  { id: "A001", title: "GIS Diagnostic Assessment – Q3 2026", type: "Diagnostic", dept: "NSO", assigned: 412, completed: 338, pending: 74, avgScore: 68, status: "Active", deadline: "30 Sep 2026" },
  { id: "A002", title: "Python & Data Tools Baseline", type: "Diagnostic", dept: "All Divisions", assigned: 1248, completed: 987, pending: 261, avgScore: 61, status: "Active", deadline: "15 Sep 2026" },
  { id: "A003", title: "Statistical Methods Proficiency – Annual", type: "Proficiency", dept: "NSO / ESD", assigned: 615, completed: 562, pending: 53, avgScore: 74, status: "Active", deadline: "20 Sep 2026" },
  { id: "A004", title: "Field Operations Digital Tools Check", type: "Compliance", dept: "FOD", assigned: 318, completed: 318, pending: 0, avgScore: 71, status: "Completed", deadline: "Aug 2026" },
  { id: "A005", title: "SQL & Database Querying Evaluation", type: "Proficiency", dept: "ESD / CPD", assigned: 331, completed: 214, pending: 117, avgScore: 58, status: "Active", deadline: "05 Oct 2026" },
];

const typeColor: Record<string, string> = {
  Diagnostic: "bg-blue-50 text-blue-700",
  Proficiency: "bg-purple-50 text-purple-700",
  Compliance: "bg-emerald-50 text-emerald-700",
};

export default function AdminAssessmentsPage() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Assessment Compliance Monitor</h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">Track organisation-wide assessment assignments, completion rates, and compliance</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs text-center">
          <ClipboardList className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-black text-slate-900">5</p>
          <p className="text-xs text-slate-500 font-semibold uppercase">Active Assessments</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <p className="text-xl font-black text-emerald-700">79.2%</p>
          <p className="text-xs text-slate-500 font-semibold uppercase">Avg Completion</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs text-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-black text-amber-700">505</p>
          <p className="text-xs text-slate-500 font-semibold uppercase">Pending Attempts</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs text-center">
          <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-xl font-black text-slate-700">66.4%</p>
          <p className="text-xs text-slate-500 font-semibold uppercase">Avg Score</p>
        </div>
      </div>

      {/* Assessment table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Assessment</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Dept</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Completion</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Avg Score</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">Deadline</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => {
              const pct = Math.round((a.completed / a.assigned) * 100);
              return (
                <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900 text-sm">{a.title}</p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${typeColor[a.type]}`}>{a.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 hidden md:table-cell">{a.dept}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-blue-500" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{pct}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{a.completed}/{a.assigned} officers</p>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-slate-700 hidden sm:table-cell">{a.avgScore}%</td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500 hidden lg:table-cell">{a.deadline}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${a.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                      onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenu === a.id && (
                      <div className="absolute right-4 top-10 z-20 bg-white border border-slate-200 rounded-lg shadow-lg w-40 py-1">
                        <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">View Details</button>
                        <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Send Reminder</button>
                        <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Close Assessment</button>
                      </div>
                    )}
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
