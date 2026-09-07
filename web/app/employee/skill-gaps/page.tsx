"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Filter,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { getMySkillGaps, EvaluatedCompetency, EmployeeSkillGapsResponse } from "@/lib/api/competencies";

export default function EmployeeSkillGapsPage() {
  const [data, setData] = useState<EmployeeSkillGapsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGap, setSelectedGap] = useState<EvaluatedCompetency | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getMySkillGaps(true);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load skill gaps");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const gapsList = (data?.gaps || []).filter((gap) => {
    const matchesSeverity =
      severityFilter === "All" || gap.severity === severityFilter;
    const matchesSearch =
      gap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gap.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gap.domainName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const activeGapsCount = (data?.gaps || []).filter((g) => g.gap > 0).length;
  const criticalCount = data?.criticalGapsCount ?? 0;

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Computing automatic skill gaps from role requirements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Automatic Skill Gap Analysis
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              BACKEND ENGINE DERIVED
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            <strong>{activeGapsCount} active competency gaps detected</strong> •{" "}
            <span className="text-rose-700 font-bold">{criticalCount} critical deficits for {data?.employee.jobRole || "Statistical Officer"}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error Computing Gaps</p>
            <p className="opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search gaps or domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Severity:
          </span>
          {["All", "CRITICAL", "HIGH", "MODERATE", "LOW", "NONE"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                severityFilter === sev
                  ? "bg-[#1E3A8A] text-white font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700">
            <tr>
              <th className="px-5 py-3.5">Priority Rank</th>
              <th className="px-5 py-3.5">Competency</th>
              <th className="px-5 py-3.5">Domain</th>
              <th className="px-5 py-3.5 text-center">Current Score</th>
              <th className="px-5 py-3.5 text-center">Role Benchmark</th>
              <th className="px-5 py-3.5 text-center">Calculated Gap</th>
              <th className="px-5 py-3.5">Severity</th>
              <th className="px-5 py-3.5">Priority Score</th>
              <th className="px-5 py-3.5 text-right">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gapsList.map((gap, index) => {
              const rank = index + 1;
              const severityColor =
                gap.severity === "CRITICAL"
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : gap.severity === "HIGH"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : gap.severity === "MODERATE"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : gap.severity === "LOW"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-emerald-100 text-emerald-800 border-emerald-200";

              return (
                <tr
                  key={gap.competencyId}
                  className="hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => setSelectedGap(gap)}
                >
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
                      #{rank}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{gap.name}</span>
                      {gap.isMandatory && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          MANDATORY
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{gap.code}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{gap.domainName}</td>
                  <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                    {gap.currentScore !== null ? `${gap.currentScore}%` : <span className="text-purple-600 font-normal italic">Unassessed</span>}
                  </td>
                  <td className="px-5 py-3.5 text-center font-bold text-blue-900">
                    {gap.requiredScore}%
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`font-black ${gap.gap > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      {gap.gap > 0 ? `-${gap.gap}` : "0"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityColor}`}>
                      {gap.severity}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {gap.priorityScore.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGap(gap);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                    >
                      Explain
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Explanation Modal */}
      {selectedGap && (
        <Modal
          isOpen={!!selectedGap}
          onClose={() => setSelectedGap(null)}
          title={`Skill Gap Analysis: ${selectedGap.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedGap.name}</span>
                <span className="text-[10px] font-mono text-slate-500">{selectedGap.code}</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {selectedGap.reason}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Current Score</span>
                <p className="text-lg font-black text-slate-900">{selectedGap.currentScore !== null ? `${selectedGap.currentScore}%` : "None"}</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Target Requirement</span>
                <p className="text-lg font-black text-blue-900">{selectedGap.requiredScore}%</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Calculated Gap</span>
                <p className="text-lg font-black text-rose-600">{selectedGap.gap} pts</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Priority Weight</span>
                <p className="text-lg font-black text-slate-800">{selectedGap.priorityWeight}x</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Next Steps (Phase 3 & 4)</p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  This deterministic gap will feed directly into the Adaptive Diagnostic Assessment engine and iGOT Karmayogi targeted course recommendation pipeline.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
