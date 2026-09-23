"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  getMySkillGaps,
  type EvaluatedCompetency,
  type EmployeeSkillGapsResponse,
} from "@/lib/api/competencies";

/* ── helpers ───────────────────────────────────────── */

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-50   text-red-600   ring-red-200",
  HIGH:     "bg-amber-50 text-amber-700 ring-amber-200",
  MODERATE: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  LOW:      "bg-blue-50  text-blue-600  ring-blue-200",
  NONE:     "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const FILTER_OPTIONS = ["All", "CRITICAL", "HIGH", "MODERATE", "LOW", "NONE"];

/* ── page ──────────────────────────────────────────── */

export default function EmployeeSkillGapsPage() {
  const [data, setData]       = useState<EmployeeSkillGapsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [severity, setSeverity] = useState("All");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<EvaluatedCompetency | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getMySkillGaps(true);
        if (res.success && res.data) setData(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load skill gaps");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = (data?.gaps ?? []).filter((g) => {
    const matchesSev = severity === "All" || g.severity === severity;
    const q = search.toLowerCase();
    const matchesSearch =
      g.name.toLowerCase().includes(q) ||
      g.code.toLowerCase().includes(q) ||
      g.domainName.toLowerCase().includes(q);
    return matchesSev && matchesSearch;
  });

  const activeCount   = (data?.gaps ?? []).filter((g) => g.gap > 0).length;
  const criticalCount = data?.criticalGapsCount ?? 0;

  if (loading) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <p className="text-sm">Computing your skill gaps…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── header ── */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-xl font-semibold text-gray-900">Skill gap analysis</h1>
        <p className="mt-1 text-sm text-gray-500">
          {activeCount} active gaps · <span className="text-red-500 font-medium">{criticalCount} critical</span>
          {" "}for {data?.employee.jobRole ?? "your role"}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      {/* ── filter bar ── */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, code, domain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] text-gray-400 mr-1">Severity:</span>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setSeverity(opt)}
              className={`rounded-lg px-3 py-1 text-[12px] font-medium transition ${
                severity === opt
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt === "All" ? "All" : opt.charAt(0) + opt.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── table ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="border-b border-gray-100 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Competency</th>
              <th className="px-5 py-3">Domain</th>
              <th className="px-5 py-3 text-center">Current</th>
              <th className="px-5 py-3 text-center">Target</th>
              <th className="px-5 py-3 text-center">Gap</th>
              <th className="px-5 py-3">Severity</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((gap, i) => (
              <tr
                key={gap.competencyId}
                onClick={() => setSelected(gap)}
                className="cursor-pointer transition hover:bg-gray-50"
              >
                <td className="px-5 py-3.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 font-mono text-[11px] font-semibold text-gray-600">
                    {i + 1}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-900 leading-snug">
                    {gap.name}
                    {gap.isMandatory && (
                      <span className="ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold text-red-600 ring-1 ring-red-200">
                        mandatory
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-gray-400">{gap.code}</p>
                </td>

                <td className="px-5 py-3.5 text-gray-500">{gap.domainName}</td>

                <td className="px-5 py-3.5 text-center font-medium text-gray-800">
                  {gap.currentScore !== null ? (
                    `${gap.currentScore}%`
                  ) : (
                    <span className="text-[12px] italic text-gray-400">Not assessed</span>
                  )}
                </td>

                <td className="px-5 py-3.5 text-center font-medium text-blue-700">
                  {gap.requiredScore}%
                </td>

                <td className="px-5 py-3.5 text-center">
                  <span className={`font-semibold ${gap.gap > 0 ? "text-red-500" : "text-emerald-600"}`}>
                    {gap.gap > 0 ? `−${gap.gap}` : "—"}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
                      SEVERITY_STYLES[gap.severity] ?? "bg-gray-50 text-gray-500 ring-gray-200"
                    }`}
                  >
                    {gap.severity.charAt(0) + gap.severity.slice(1).toLowerCase()}
                  </span>
                </td>

                <td className="px-5 py-3.5 font-mono text-[12px] text-gray-500">
                  {gap.priorityScore.toFixed(2)}
                </td>

                <td className="px-5 py-3.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(gap); }}
                    className="rounded-lg bg-gray-50 px-2.5 py-1 text-[12px] font-medium text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-14 text-center text-sm text-gray-400">
                  No gaps match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── detail modal ── */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={selected.name}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm">

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="leading-relaxed text-gray-700">{selected.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Current score", value: selected.currentScore !== null ? `${selected.currentScore}%` : "None", color: "text-gray-900" },
                { label: "Role target",   value: `${selected.requiredScore}%`,        color: "text-blue-700" },
                { label: "Gap",           value: selected.gap > 0 ? `−${selected.gap} pts` : "On target", color: selected.gap > 0 ? "text-red-500" : "text-emerald-600" },
                { label: "Priority weight", value: `${selected.priorityWeight}×`,     color: "text-gray-900" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-3 text-center">
                  <p className="text-[11px] text-gray-400">{s.label}</p>
                  <p className={`mt-1.5 text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <p className="text-[12px] leading-relaxed text-blue-800">
                This gap feeds directly into the adaptive assessment engine and iGOT Karmayogi
                course recommendations to give you the most relevant next step.
              </p>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
}
