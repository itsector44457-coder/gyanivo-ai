"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserCheck, Shield, GraduationCap, ChevronDown } from "lucide-react";
import { UserRole } from "@/types";

export function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentRole = (): UserRole => {
    if (pathname.startsWith("/trainer")) return "TRAINER";
    if (pathname.startsWith("/admin")) return "ADMIN";
    return "EMPLOYEE";
  };

  const currentRole = getCurrentRole();

  const handleSelectRole = (role: UserRole) => {
    setIsOpen(false);
    if (role === "EMPLOYEE") router.push("/employee/dashboard");
    if (role === "TRAINER") router.push("/trainer/dashboard");
    if (role === "ADMIN") router.push("/admin/dashboard");
  };

  const roleConfigs = {
    EMPLOYEE: {
      label: "Employee",
      user: "Rahul (Statistical Officer)",
      icon: <UserCheck className="h-3.5 w-3.5 text-blue-600" />,
      color: "bg-blue-50 text-blue-800 border-blue-200",
    },
    TRAINER: {
      label: "Trainer",
      user: "Dr. S. Rao (Master Trainer)",
      icon: <GraduationCap className="h-3.5 w-3.5 text-amber-600" />,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    ADMIN: {
      label: "Administrator",
      user: "MoSPI Cadre Admin",
      icon: <Shield className="h-3.5 w-3.5 text-purple-600" />,
      color: "bg-purple-50 text-purple-800 border-purple-200",
    },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs hover:opacity-95 transition ${roleConfigs[currentRole].color}`}
        title="Switch demo persona for judging presentation"
      >
        {roleConfigs[currentRole].icon}
        <span className="font-bold tracking-tight uppercase text-[10px]">
          Role: {roleConfigs[currentRole].label}
        </span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
              Switch Persona (Prototype Demo)
            </div>

            <button
              onClick={() => handleSelectRole("EMPLOYEE")}
              className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition ${
                currentRole === "EMPLOYEE" ? "bg-blue-50 text-blue-900 font-semibold" : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <UserCheck className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Employee Workspace</p>
                <p className="text-[11px] text-slate-500">Rahul Sharma • Statistical Officer</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectRole("TRAINER")}
              className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition ${
                currentRole === "TRAINER" ? "bg-amber-50 text-amber-900 font-semibold" : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <GraduationCap className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Trainer Workspace</p>
                <p className="text-[11px] text-slate-500">Dr. S. Rao • Material & Question Bank</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectRole("ADMIN")}
              className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition ${
                currentRole === "ADMIN" ? "bg-purple-50 text-purple-900 font-semibold" : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Admin Command Center</p>
                <p className="text-[11px] text-slate-500">MoSPI Cadre & Matrix Management</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
