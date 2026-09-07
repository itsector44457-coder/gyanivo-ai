"use client";

import React, { useState } from "react";
import { Search, Filter, MoreVertical, UserCheck, ClipboardList, Pencil, UserX } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

const employees = [
  { id: "E001", name: "Rahul Sharma", email: "rahul.sharma@mospi.gov.in", role: "Statistical Officer", dept: "NSO", avgScore: 60, status: "Active", lastAssessed: "Aug 2026" },
  { id: "E002", name: "Priya Nair", email: "priya.nair@mospi.gov.in", role: "Sr. Statistical Officer", dept: "ESD", avgScore: 78, status: "Active", lastAssessed: "Aug 2026" },
  { id: "E003", name: "Amit Verma", email: "amit.verma@mospi.gov.in", role: "Data Analyst", dept: "SDRD", avgScore: 65, status: "Active", lastAssessed: "Jul 2026" },
  { id: "E004", name: "Sunita Patel", email: "sunita.patel@mospi.gov.in", role: "Field Investigator", dept: "FOD", avgScore: 52, status: "Active", lastAssessed: "Jun 2026" },
  { id: "E005", name: "Vikram Singh", email: "vikram.singh@mospi.gov.in", role: "Joint Director", dept: "CPD", avgScore: 84, status: "Active", lastAssessed: "Aug 2026" },
  { id: "E006", name: "Meena Krishnan", email: "meena.krishnan@mospi.gov.in", role: "Statistical Officer", dept: "FOD", avgScore: 55, status: "On Leave", lastAssessed: "May 2026" },
  { id: "E007", name: "Rajesh Kumar", email: "rajesh.kumar@mospi.gov.in", role: "Data Analyst", dept: "NSO", avgScore: 71, status: "Active", lastAssessed: "Aug 2026" },
  { id: "E008", name: "Ananya Das", email: "ananya.das@mospi.gov.in", role: "Sr. Statistical Officer", dept: "ESD", avgScore: 80, status: "Active", lastAssessed: "Aug 2026" },
];

const depts = ["All Departments", "NSO", "FOD", "SDRD", "ESD", "CPD"];
const roles = ["All Roles", "Statistical Officer", "Sr. Statistical Officer", "Data Analyst", "Field Investigator", "Joint Director"];

export default function AdminEmployeesPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [role, setRole] = useState("All Roles");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "All Departments" || e.dept === dept;
    const matchRole = role === "All Roles" || e.role === role;
    return matchSearch && matchDept && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Employee Directory</h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">1,248 officers across MoSPI divisions — search, filter, and manage competency actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name or employee ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          {depts.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Employee</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Role</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden lg:table-cell">Department</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Avg Score</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase hidden xl:table-cell">Last Assessed</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                      {emp.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-[11px] text-slate-400">{emp.id} · {emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{emp.role}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{emp.dept}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${emp.avgScore >= 70 ? "bg-emerald-500" : emp.avgScore >= 55 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${emp.avgScore}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{emp.avgScore}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${emp.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 hidden xl:table-cell">{emp.lastAssessed}</td>
                <td className="px-4 py-3 relative">
                  <button
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                    onClick={() => setOpenMenu(openMenu === emp.id ? null : emp.id)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenu === emp.id && (
                    <div className="absolute right-4 top-10 z-20 bg-white border border-slate-200 rounded-lg shadow-lg w-48 py-1">
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <UserCheck className="w-4 h-4" /> View Profile
                      </button>
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <ClipboardList className="w-4 h-4" /> Assign Assessment
                      </button>
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Pencil className="w-4 h-4" /> Edit Details
                      </button>
                      <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        <UserX className="w-4 h-4" /> Deactivate
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="font-semibold">No employees found</p>
          </div>
        )}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {filtered.length} of 1,248 employees</p>
        </div>
      </div>
    </div>
  );
}
