"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  PieChart,
  ShieldCheck,
} from "lucide-react";

export default function AnalyticsPage() {
  const departmentStats = [
    { name: "Field Operations Division (FOD)", officers: 1840, readiness: 87.4, gaps: "Urban Frame Survey, Tabulation" },
    { name: "Survey Design & Research Division (SDRD)", officers: 620, readiness: 91.2, gaps: "Stratified Sampling, Non-sampling error" },
    { name: "National Accounts Division (NAD)", officers: 490, readiness: 84.8, gaps: "GVA Deflators, FISIM allocation" },
    { name: "Economic Statistics Division (ESD)", officers: 580, readiness: 82.5, gaps: "ASI schedule validation, NIC coding" },
    { name: "Data Quality & Innovation Division (DQID)", officers: 320, readiness: 94.1, gaps: "Automated outlier detection, ML models" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFF] text-slate-900 flex flex-col font-sans antialiased">
      <Header />

      <main className="flex-1 max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Cadre Intelligence
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
            National Statistical{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Readiness & Analytics
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Real-time competency telemetry, institutional capability heatmaps, and readiness forecasting for Subordinate Statistical Service (SSS) and Indian Statistical Service (ISS) cadres.
          </p>
        </div>

        {/* Top 4 Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">National Readiness</span>
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">86.2%</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+4.8% post-NSSTA training</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Active Officers</span>
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">3,850</div>
            <div className="text-xs text-slate-500 mt-1">Across 36 States & UTs</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Assessments Taken</span>
              <BarChart3 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">12,480+</div>
            <div className="text-xs text-slate-500 mt-1">CAT adaptive sessions</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Citation Fidelity</span>
              <ShieldCheck className="h-5 w-5 text-teal-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">98.4%</div>
            <div className="text-xs text-slate-500 mt-1">Zero-hallucination index</div>
          </div>
        </div>

        {/* Division Benchmarks Table */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Division-wise Competency Benchmarks
              </h2>
              <p className="text-xs text-slate-500">
                Live aggregation across Field Operations, Survey Design, and National Accounts
              </p>
            </div>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
              <span>View Full Admin Analytics</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="pb-3 pr-4">Division Name</th>
                  <th className="pb-3 px-4">Cadre Officers</th>
                  <th className="pb-3 px-4">Readiness Score</th>
                  <th className="pb-3 pl-4">Primary Skill Gap Areas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentStats.map((dep, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 pr-4 font-bold text-slate-900">{dep.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{dep.officers.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${dep.readiness}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{dep.readiness}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 pl-4 text-slate-500">{dep.gaps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Tile */}
        <div className="rounded-3xl bg-blue-50 border border-blue-200 p-8 text-center max-w-2xl mx-auto space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Need in-depth Cadre Heatmaps and Institutional Reports?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Sign in as Cadre Administrator to view department drill-downs, export audit CSVs, and recalibrate role matrix requirements.
          </p>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-800 transition"
          >
            <span>Open Cadre Admin Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
