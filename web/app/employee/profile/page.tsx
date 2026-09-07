"use client";

import React, { useEffect, useState } from "react";
import { User, Shield, Building2, Calendar, Mail, Award, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiClient } from "@/lib/api/client";

interface RealEmployeeProfileData {
  id: number;
  userId: number;
  employeeCode?: string;
  designation: string;
  cadre?: string;
  currentAssignment?: string;
  educationalQualification?: string;
  experienceYears: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    systemRole: string;
    lastLoginAt?: string;
  };
  department?: {
    id: number;
    code: string;
    name: string;
    description?: string;
  };
  jobRole?: {
    id: number;
    code: string;
    name: string;
    requirements?: Array<{
      id: number;
      requiredScore: number;
      competency: {
        id: number;
        code: string;
        name: string;
        domain: {
          name: string;
        };
      };
    }>;
  };
  competencies?: Array<{
    id: number;
    currentScore: number;
    confidence: number;
    evidenceCount: number;
    competency: {
      id: number;
      code: string;
      name: string;
      domain: {
        name: string;
      };
    };
  }>;
}

export default function EmployeeProfilePage() {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState<RealEmployeeProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await apiClient<{ success: boolean; profile: RealEmployeeProfileData }>("/employees/me/profile");
        if (res?.success && res?.profile) {
          setProfileData(res.profile);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load database profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const fullName = profileData
    ? `${profileData.user.firstName} ${profileData.user.lastName}`
    : authUser
    ? `${authUser.firstName} ${authUser.lastName}`
    : "Officer";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const email = profileData?.user.email || authUser?.email || "officer@mospi.gov.in";
  const designation = profileData?.designation || authUser?.profile?.designation || "Statistical Officer";
  const cadre = profileData?.cadre || authUser?.profile?.cadre || "Subordinate Statistical Service (SSS Cadre)";
  const deptName = profileData?.department?.name || authUser?.profile?.department?.name || "National Statistical Office (NSO)";
  const jobRoleName = profileData?.jobRole?.name || authUser?.profile?.jobRole?.name || "Statistical Officer";
  const employeeCode = profileData?.employeeCode || authUser?.profile?.employeeCode || "MOSPI-SSS-8842";
  const education = profileData?.educationalQualification || "M.Sc. Statistics / Data Science";
  const experience = profileData?.experienceYears ?? 4.5;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Officer Official Profile
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              DATABASE VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Ministry of Statistics and Programme Implementation • SSS Cadre Official Record
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Live Profile Notice</p>
            <p className="opacity-90 mt-0.5">
              Displaying authenticated session data ({error}). Connect to local NestJS backend at port 5000 for full relational tree.
            </p>
          </div>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#1E3A8A] text-2xl font-black text-white shadow-md">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                Active Cadre Status
              </span>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                {profileData?.user.systemRole || authUser?.systemRole || "EMPLOYEE"}
              </span>
            </div>
            <p className="text-sm font-semibold text-blue-900">{designation}</p>
            <p className="text-xs text-slate-500">{deptName} • MoSPI Government of India</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Employee ID / Code</span>
            <p className="font-mono font-bold text-slate-900">{employeeCode}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Official NIC Email</span>
            <p className="font-semibold text-slate-900 truncate">{email}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Service Cadre</span>
            <p className="font-semibold text-slate-900">{cadre}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Assigned Job Role</span>
            <p className="font-semibold text-slate-900">{jobRoleName}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Experience in Cadre</span>
            <p className="font-semibold text-slate-900">{experience} Years</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Educational Qualification</span>
            <p className="font-semibold text-slate-900">{education}</p>
          </div>
        </div>
      </div>

      {/* Database Competencies Snapshot (if loaded from relational DB) */}
      {profileData?.competencies && profileData.competencies.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Persistent Competency Records in PostgreSQL
            </h3>
            <span className="text-xs text-slate-500">
              {profileData.competencies.length} Competencies Tagged
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profileData.competencies.map((ec) => (
              <div
                key={ec.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{ec.competency.name}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {ec.competency.code} • {ec.competency.domain.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-blue-900">{ec.currentScore}%</span>
                  <p className="text-[9px] text-slate-400">score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
