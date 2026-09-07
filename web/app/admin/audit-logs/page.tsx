"use client";

import React, { useState } from "react";
import { Shield, User, Settings, Edit3, Trash2, Database } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

const auditLogs = [
  { id: "AL001", timestamp: "25 Aug 2026, 09:12 IST", actor: "Admin: S. Murthy", action: "Role Matrix Updated", entity: "Statistical Officer — GIS Target: 55% → 60%", category: "Matrix", severity: "Medium" },
  { id: "AL002", timestamp: "25 Aug 2026, 08:45 IST", actor: "System", action: "Assessment Auto-Published", entity: "GIS Diagnostic Assessment – Q3 2026", category: "Assessment", severity: "Info" },
  { id: "AL003", timestamp: "24 Aug 2026, 17:30 IST", actor: "Admin: R. Kapoor", action: "Employee Deactivated", entity: "Officer E0892 — Pradeep Joshi (FOD)", category: "Employee", severity: "High" },
  { id: "AL004", timestamp: "24 Aug 2026, 15:22 IST", actor: "Trainer: Dr. P. Rao", action: "Question Approved", entity: "GIS Training.pdf — 12 questions bulk approved", category: "Content", severity: "Info" },
  { id: "AL005", timestamp: "24 Aug 2026, 14:10 IST", actor: "Admin: S. Murthy", action: "Course Mapping Added", entity: "Python Automation → Python/R Competency (88% weight)", category: "Mapping", severity: "Info" },
  { id: "AL006", timestamp: "24 Aug 2026, 11:05 IST", actor: "System", action: "Competency Score Updated", entity: "Rahul Sharma (E001) — GIS: 25 → 31 (post-assessment)", category: "Competency", severity: "Info" },
  { id: "AL007", timestamp: "23 Aug 2026, 16:45 IST", actor: "Admin: R. Kapoor", action: "New Competency Added", entity: "AI & Machine Learning for Statistics", category: "Framework", severity: "Medium" },
  { id: "AL008", timestamp: "23 Aug 2026, 10:30 IST", actor: "Trainer: A. Kumar", action: "Material Uploaded", entity: "Advanced SQL for Government DB.pdf — 48 chunks extracted", category: "Content", severity: "Info" },
];

const categoryColors: Record<string, string> = {
  Matrix: "bg-purple-50 text-purple-700",
  Assessment: "bg-blue-50 text-blue-700",
  Employee: "bg-red-50 text-red-700",
  Content: "bg-emerald-50 text-emerald-700",
  Mapping: "bg-amber-50 text-amber-700",
  Competency: "bg-indigo-50 text-indigo-700",
  Framework: "bg-pink-50 text-pink-700",
};

const severityColors: Record<string, string> = {
  High: "text-red-600 font-bold",
  Medium: "text-amber-600 font-semibold",
  Info: "text-slate-400",
};

const categoryIcons: Record<string, React.ElementType> = {
  Matrix: Settings,
  Assessment: Database,
  Employee: User,
  Content: Edit3,
  Mapping: Shield,
  Competency: Database,
  Framework: Settings,
};

export default function AdminAuditLogsPage() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Matrix", "Assessment", "Employee", "Content", "Mapping", "Competency", "Framework"];

  const filtered = auditLogs.filter((l) => filter === "All" || l.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">System Audit Log</h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">Immutable trail of all competency framework changes, matrix edits, and system events</p>
        </div>
        <button className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50">
          Export CSV
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${filter === c ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((log) => {
          const Icon = categoryIcons[log.category] || Shield;
          return (
            <div key={log.id} className="rounded-xl border border-slate-200 bg-white shadow-2xs px-4 py-3.5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${categoryColors[log.category]}`}>{log.category}</span>
                  <p className="text-sm font-bold text-slate-900">{log.action}</p>
                  <span className={`text-xs ${severityColors[log.severity]}`}>● {log.severity}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{log.entity}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                  <span className="text-[11px] text-slate-400">·</span>
                  <span className="text-[11px] font-semibold text-blue-700">{log.actor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
