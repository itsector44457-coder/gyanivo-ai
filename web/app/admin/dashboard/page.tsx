"use client";

import React, { useEffect, useState } from "react";
import {
  Users, Award, AlertTriangle, TrendingUp, Building2,
  Loader2, XCircle, RefreshCw, CheckCircle2,
} from "lucide-react";
import { getAdminAllUsers, type AdminUser } from "@/lib/api/admin";
import { getAdminCompetenciesCatalog } from "@/lib/api/admin";

// ── helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 55) return "bg-amber-400";
  return "bg-red-400";
}

function getInitials(u: AdminUser) {
  return `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [competencyCount, setCompetencyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [usersData, catData] = await Promise.all([
        getAdminAllUsers(),
        getAdminCompetenciesCatalog().catch(() => null),
      ]);
      setUsers(usersData);
      if (catData) setCompetencyCount(catData.competencies?.length ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading admin dashboard…</p>
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

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;

  // Group by department
  const deptMap: Record<string, { employees: number; assessments: number }> = {};
  for (const u of users) {
    const dept = u.profile?.department?.name ?? "Unassigned";
    if (!deptMap[dept]) deptMap[dept] = { employees: 0, assessments: 0 };
    deptMap[dept].employees++;
    deptMap[dept].assessments += u._count?.assessmentAttempts ?? 0;
  }
  const departments = Object.entries(deptMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.employees - a.employees)
    .slice(0, 6);

  // Role breakdown
  const roleMap: Record<string, number> = {};
  for (const u of users) {
    const role = u.profile?.jobRole?.name ?? "Unassigned";
    roleMap[role] = (roleMap[role] ?? 0) + 1;
  }
  const topRoles = Object.entries(roleMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Assessed users (have any assessment attempts)
  const assessedCount = users.filter((u) => (u._count?.assessmentAttempts ?? 0) > 0).length;
  const totalAttempts = users.reduce((s, u) => s + (u._count?.assessmentAttempts ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Command Centre</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Live Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ministry of Statistics &amp; Programme Implementation — Competency Intelligence Overview
          </p>
        </div>
        <p className="text-xs text-slate-400 border border-slate-200 rounded-lg px-3 py-2 bg-white">
          Refreshed: {new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} IST
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex gap-4 items-start">
          <div className="bg-blue-50 rounded-lg p-2.5"><Users className="w-5 h-5 text-blue-700" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Officers</p>
            <p className="text-2xl font-black mt-1 text-blue-700">{totalUsers}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{activeUsers} active</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex gap-4 items-start">
          <div className="bg-emerald-50 rounded-lg p-2.5"><Award className="w-5 h-5 text-emerald-700" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assessed Officers</p>
            <p className="text-2xl font-black mt-1 text-emerald-700">{assessedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">of {totalUsers} total</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex gap-4 items-start">
          <div className="bg-indigo-50 rounded-lg p-2.5"><TrendingUp className="w-5 h-5 text-indigo-700" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Attempts</p>
            <p className="text-2xl font-black mt-1 text-indigo-700">{totalAttempts}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">assessment attempts</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex gap-4 items-start">
          <div className="bg-amber-50 rounded-lg p-2.5"><AlertTriangle className="w-5 h-5 text-amber-700" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Competencies</p>
            <p className="text-2xl font-black mt-1 text-amber-700">{competencyCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">in framework</p>
          </div>
        </div>
      </div>

      {/* Department Breakdown + Top Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-blue-600" /> Officers by Department
          </h2>
          {departments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No department data available</p>
          ) : (
            <div className="space-y-3">
              {departments.map((d) => {
                const pct = totalUsers > 0 ? Math.round((d.employees / totalUsers) * 100) : 0;
                return (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-32 min-w-[8rem] truncate text-xs font-semibold text-slate-700">{d.name}</div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right">{d.employees}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top roles */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-emerald-600" /> Officers by Job Role
          </h2>
          {topRoles.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No role data available</p>
          ) : (
            <div className="space-y-3">
              {topRoles.map(([roleName, count]) => {
                const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                return (
                  <div key={roleName} className="flex items-center gap-3">
                    <div className="w-40 min-w-[10rem] truncate text-xs font-semibold text-slate-700">{roleName}</div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent users table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recently Registered Officers</h2>
          <span className="text-xs text-slate-400">{totalUsers} total</span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase">Name</th>
              <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase hidden md:table-cell">Role</th>
              <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase hidden lg:table-cell">Department</th>
              <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase">Attempts</th>
              <th className="text-left px-5 py-3 font-bold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 8).map((u) => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {getInitials(u)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{u.firstName} {u.lastName}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600 hidden md:table-cell">
                  {u.profile?.jobRole?.name ?? <span className="text-slate-300 italic">Unassigned</span>}
                </td>
                <td className="px-5 py-3 hidden lg:table-cell">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full text-[10px]">
                    {u.profile?.department?.name ?? "—"}
                  </span>
                </td>
                <td className="px-5 py-3 font-bold text-slate-700">
                  {u._count?.assessmentAttempts ?? 0}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
