"use client";

import React, { useEffect, useState } from "react";
import { Search, Loader2, XCircle, RefreshCw, UserCheck } from "lucide-react";
import { getAdminAllUsers, type AdminUser } from "@/lib/api/admin";

function getInitials(u: AdminUser) {
  return `${u.firstName[0] ?? ""}${u.lastName[0] ?? ""}`.toUpperCase();
}

export default function AdminEmployeesPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminAllUsers();
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Unique dept & role filters from real data
  const depts = ["All", ...Array.from(new Set(users.map((u) => u.profile?.department?.name ?? "Unassigned"))).sort()];
  const roles = ["All", ...Array.from(new Set(users.map((u) => u.profile?.jobRole?.name ?? "Unassigned"))).sort()];

  const filtered = users.filter((u) => {
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || (u.profile?.department?.name ?? "Unassigned") === deptFilter;
    const matchRole = roleFilter === "All" || (u.profile?.jobRole?.name ?? "Unassigned") === roleFilter;
    return matchSearch && matchDept && matchRole;
  });

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading employee directory…</p>
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
          <h1 className="text-2xl font-black text-slate-900">Employee Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            {users.length} officers registered — search, filter, and manage competency actions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          {depts.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Officer</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Job Role</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">Department</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase">Assessments</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden xl:table-cell">Since</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                      {getInitials(u)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{u.firstName} {u.lastName}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                  {u.profile?.jobRole?.name ?? <span className="italic text-slate-300">Unassigned</span>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                    {u.profile?.department?.name ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-bold ${(u._count?.assessmentAttempts ?? 0) > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                    {u._count?.assessmentAttempts ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 hidden xl:table-cell">
                  {new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <UserCheck className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">No officers found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <strong>{filtered.length}</strong> of <strong>{users.length}</strong> officers
          </p>
        </div>
      </div>
    </div>
  );
}
