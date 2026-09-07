"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  FileCheck2,
  TrendingUp,
  Layers,
  ArrowRight,
  Shield,
  Calendar,
  ExternalLink,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { HorizontalCompetencyBar } from "@/components/ui/HorizontalCompetencyBar";
import { Modal } from "@/components/ui/Modal";
import { getMyCompetencies, EvaluatedCompetency, EmployeeCompetenciesResponse } from "@/lib/api/competencies";

export default function EmployeeCompetenciesPage() {
  const [data, setData] = useState<EmployeeCompetenciesResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"competencies" | "overview" | "history" | "requirements">("competencies");
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [selectedEvidenceComp, setSelectedEvidenceComp] = useState<EvaluatedCompetency | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getMyCompetencies();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load competencies");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const domains = ["All", "Statistical", "Technical", "Digital Governance", "Behavioural / Managerial"];

  const filteredCompetencies = (data?.competencies || []).filter((comp) => {
    if (selectedDomain === "All") return true;
    return (
      comp.domainName.toLowerCase().includes(selectedDomain.toLowerCase()) ||
      comp.domainCode.toLowerCase().includes(selectedDomain.toLowerCase().replace(/\s+/g, '_'))
    );
  });

  const handleDownloadReport = () => {
    alert("Official MoSPI Competency Profile Report (PDF generation - Prototype Action). A verified cadre transcript is generated.");
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading official competency profile from database...</p>
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
              My Competency Profile
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              DATABASE ENGINE VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Cadre Role: <strong className="text-blue-900 font-bold">{data?.employee.jobRole || "Statistical Officer"}</strong> • {data?.employee.department || "National Statistical Office (NSO)"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <Download className="h-4 w-4 text-blue-700" />
            Download Cadre Report
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error Loading Competencies</p>
            <p className="opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Overall Evaluated Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{data?.overallScore ?? 0}%</span>
            <span className="text-xs font-semibold text-slate-500">role-weighted</span>
          </div>
          <p className="text-[11px] text-slate-500">Benchmark requirement average</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Role Competencies</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-900">{data?.totalRequired ?? 0}</span>
            <span className="text-xs font-semibold text-slate-500">framework requirements</span>
          </div>
          <p className="text-[11px] text-slate-500">Prescribed by MoSPI Job Matrix</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-600">Meeting Target Benchmark</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{data?.metRequirements ?? 0}</span>
            <span className="text-xs font-semibold text-emerald-600">competencies</span>
          </div>
          <p className="text-[11px] text-emerald-600/80">Proficiency ≥ Required Score</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-600">Active Skill Gaps</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{data?.belowRequirements ?? 0}</span>
            <span className="text-xs font-semibold text-amber-600">target deficits</span>
          </div>
          <p className="text-[11px] text-amber-600/80">Require training or assessment</p>
        </div>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-slate-400 shrink-0" />
        {domains.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDomain(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedDomain === d
                ? "bg-[#1E3A8A] text-white shadow-2xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Competency List */}
      <div className="space-y-4">
        {filteredCompetencies.map((comp) => (
          <div
            key={comp.competencyId}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 hover:border-blue-200 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">{comp.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {comp.code}
                  </span>
                  {comp.isMandatory && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      MANDATORY
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      comp.status === "MEETS_REQUIREMENT" || comp.status === "EXCEEDS_REQUIREMENT"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : comp.status === "NOT_ASSESSED"
                        ? "bg-purple-50 text-purple-800 border border-purple-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {comp.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{comp.domainName}</p>
              </div>

              <div className="text-left sm:text-right">
                <div className="flex items-center sm:justify-end gap-2">
                  <span className="text-xs text-slate-500">Current:</span>
                  <span className="text-base font-black text-slate-900">
                    {comp.currentScore !== null ? `${comp.currentScore}%` : "Not Assessed"}
                  </span>
                  <span className="text-xs text-slate-400">/ Target {comp.requiredScore}%</span>
                </div>
                {comp.gap > 0 && (
                  <span
                    className={`text-[10px] font-bold ${
                      comp.severity === "CRITICAL"
                        ? "text-rose-600"
                        : comp.severity === "HIGH"
                        ? "text-amber-600"
                        : "text-blue-600"
                    }`}
                  >
                    Gap: -{comp.gap} pts ({comp.severity})
                  </span>
                )}
              </div>
            </div>

            {/* Visual Horizontal Progress Bar */}
            <HorizontalCompetencyBar
              name={comp.name}
              current={comp.currentScore ?? 0}
              target={comp.requiredScore}
              showLabels={false}
              size="md"
            />

            {/* Rationale / Explanation Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
              <Award className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{comp.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
