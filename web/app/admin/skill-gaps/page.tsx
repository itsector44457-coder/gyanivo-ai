"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Loader2, XCircle, RefreshCw, Filter, CheckCircle2 } from "lucide-react";
import { getAdminAllUsers, type AdminUser } from "@/lib/api/admin";
import { getAdminCompetenciesCatalog } from "@/lib/api/admin";
import { getMySkillGaps } from "@/lib/api/competencies";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompetencyGapSummary {
  competency: string;
  domain: string;
  competencyId: number;
  notAssessed: number;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminSkillGapsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [gapSummary, setGapSummary] = useState<CompetencyGapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const domains = ["All", ...Array.from(new Set(gapSummary.map((g) => g.domain))).sort()];

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // Load competency catalog + all users
      const [catalog, allUsers] = await Promise.all([
        getAdminCompetenciesCatalog(),
        getAdminAllUsers(),
      ]);

      setUsers(allUsers);

      // For each competency, count how many users have NOT been assessed
      const assessedUserIds = new Set(
        allUsers.filter((u) => (u._count?.assessmentAttempts ?? 0) > 0).map((u) => u.id)
      );
      const unassessedCount = allUsers.length - assessedUserIds.size;

      // Build per-competency gap rows from catalog
      const rows: CompetencyGapSummary[] = catalog.competencies.map((c) => ({
        competency: c.name,
        domain: c.domain.name,
        competencyId: c.id,
        notAssessed: unassessedCount, // approximation: everyone not yet assessed could have a gap
      }));

      setGapSummary(rows);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load skill gap data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalUsers = users.length;
  const assessedUsers = users.filter((u) => (u._count?.assessmentAttempts ?? 0) > 0).length;
  const unassessedUsers = totalUsers - assessedUsers;

  const filtered = filter === "All" ? gapSummary : gapSummary.filter((g) => g.domain === filter);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500">Analysing organisation skill gaps…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <XCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-slate-600 font-medium">{error}</p>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#1E3A8A] text-white rounded-lg">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Organisation Skill Gap Analysis</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Live Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Competency coverage across {totalUsers} registered officers in MoSPI
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
          <p className="text-2xl font-black text-blue-700">{totalUsers}</p>
          <p className="text-xs font-bold text-blue-600 uppercase mt-1">Total Officers</p>
          <p className="text-[11px] text-blue-500">In system</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-2xl font-black text-emerald-700">{assessedUsers}</p>
          <p className="text-xs font-bold text-emerald-600 uppercase mt-1">Assessed</p>
          <p className="text-[11px] text-emerald-500">Have completed assessments</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-black text-amber-700">{unassessedUsers}</p>
          <p className="text-xs font-bold text-amber-600 uppercase mt-1">Not Yet Assessed</p>
          <p className="text-[11px] text-amber-500">Competencies unknown</p>
        </div>
      </div>

      {/* Domain filter */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter className="h-4 w-4 text-slate-400 shrink-0" />
        {domains.map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              filter === d
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Competency table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">#</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Competency</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Domain</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-amber-500 uppercase">Officers Not Assessed</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Coverage Bar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g, i) => {
              const covPct = totalUsers > 0 ? Math.round(((totalUsers - g.notAssessed) / totalUsers) * 100) : 0;
              const domainColors: Record<string, string> = {
                Technical: "bg-blue-50 text-blue-700",
                "Digital Governance": "bg-purple-50 text-purple-700",
                Statistical: "bg-emerald-50 text-emerald-700",
              };
              const dc = domainColors[g.domain] ?? "bg-slate-50 text-slate-600";
              return (
                <tr key={g.competencyId} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 text-sm">{g.competency}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${dc}`}>{g.domain}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-black ${g.notAssessed > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                      {g.notAssessed}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${covPct >= 80 ? "bg-emerald-500" : covPct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${covPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 w-8 text-right">{covPct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">No competencies found for this domain</p>
          </div>
        )}
      </div>
    </div>
  );
}
