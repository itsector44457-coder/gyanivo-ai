"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  GraduationCap,
  FileText,
  BarChart3,
  ArrowRight,
  Sparkles,
  Check,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function RolesPage() {
  const roles = [
    {
      title: "Cadre Officers (SSS & ISS)",
      roleName: "Statistical Officer / Senior Investigator",
      badge: "Learner & Examinee",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: GraduationCap,
      iconColor: "bg-blue-600",
      demoUser: "rahul.sharma@mospi.gov.in",
      demoPass: "DemoPassword123!",
      dashboardLink: "/employee/dashboard",
      desc: "Junior and Senior Statistical Officers (JSO/SSO) and Indian Statistical Service probationers operating across FOD (Field Operations Division), SDRD, and NSO.",
      features: [
        "Interactive Competency Radar & Proficiency Matrix (Levels 1-5)",
        "Diagnostic & Post-Training Assessments with Instant IRT Scoring",
        "Personalized Learning Paths curated from NSSTA & iGOT Karmayogi",
        "Explainable Gap Explanations highlighting specific field weaknesses",
        "Cadre History & Verifiable Credential Certificates",
      ],
    },
    {
      title: "NSSTA Faculty & Trainers",
      roleName: "Subject Matter Expert / Question Author",
      badge: "Content & Evaluation",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: FileText,
      iconColor: "bg-emerald-600",
      demoUser: "faculty.trainer@mospi.gov.in",
      demoPass: "DemoPassword123!",
      dashboardLink: "/trainer/dashboard",
      desc: "Senior Faculty at the National Statistical Systems Training Academy (NSSTA, Greater Noida) responsible for curriculum design, question bank synthesis, and evaluations.",
      features: [
        "500-Page Official Document Ingestion (NSS, CPI, ASI Guidelines)",
        "Automated Question Synthesis with Precise Page/Paragraph Citations",
        "Two-Stage Question Review & Approval Workflow (Draft, Approved, Rejected)",
        "Assessment Builder with Bloom's Taxonomy & IRT Parameter Tuning",
        "Cohort Performance & Answer Distribution Analytics",
      ],
    },
    {
      title: "MoSPI Leadership & Admins",
      roleName: "Joint Director / Cadre Management Unit",
      badge: "Governance & Strategic Analytics",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: BarChart3,
      iconColor: "bg-indigo-600",
      demoUser: "cadre.admin@mospi.gov.in",
      demoPass: "DemoPassword123!",
      dashboardLink: "/admin/dashboard",
      desc: "Joint Directors, Deputy Directors, and Cadre Administrators overseeing national statistical readiness across NSO, FOD, SDRD, and ESD divisions.",
      features: [
        "National Institutional Capability Heatmaps across all Divisions",
        "Department-wise Benchmarking (FOD vs SDRD vs NSO HQ)",
        "Standardized Role Competency Matrix & Proficiency Requirement Editor",
        "Cadre Deployment Readiness Forecasting for Upcoming National Surveys",
        "Comprehensive System Audit Logs and Security Compliance Tracking",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFF] text-slate-900 flex flex-col font-sans antialiased">
      <Header />

      <main className="flex-1 max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Cadre Ecosystem
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
            Tailored Workspaces for Every{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Statistical Role
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Sketu AI provides specialized user journeys tailored to the distinct responsibilities of Officers, NSSTA Trainers, and MoSPI Leadership.
          </p>
        </div>

        {/* Roles 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-2xl ${r.iconColor} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${r.badgeColor}`}
                    >
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {r.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-3">
                    {r.roleName}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {r.desc}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Key Capabilities
                    </div>
                    {r.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="mb-4 rounded-xl bg-slate-50 p-3 text-[11px] border border-slate-100">
                    <div className="text-slate-500">Demo Login:</div>
                    <div className="font-mono font-bold text-slate-800 truncate">{r.demoUser}</div>
                    <div className="font-mono text-slate-500">PW: {r.demoPass}</div>
                  </div>

                  <Link
                    href={r.dashboardLink}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                  >
                    <span>Launch {r.title.split(" ")[0]} Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
