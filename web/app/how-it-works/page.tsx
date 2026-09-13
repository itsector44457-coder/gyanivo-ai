"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  Users,
  Target,
  CheckCircle2,
  BarChart3,
  Cpu,
  BookOpen,
  FileCheck2,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function HowItWorksPage() {
  const stages = [
    {
      step: "01",
      title: "Cadre Profile Ingestion",
      cadre: "SSS & ISS Officers",
      desc: "Comprehensive profile indexing for Subordinate Statistical Service (SSS) and Indian Statistical Service (ISS) officers with historical survey assignments, designations, and postings.",
      icon: Users,
    },
    {
      step: "02",
      title: "Role Benchmark Matrix",
      cadre: "Standardized Competencies",
      desc: "Official MoSPI job roles mapped with required proficiency levels (1-5) across Survey Design, Field Operations, Sampling, National Accounts, and Data Governance.",
      icon: Target,
    },
    {
      step: "03",
      title: "Diagnostic Assessment",
      cadre: "Baseline Profiling",
      desc: "Initial baseline evaluation measuring an officer's current knowledge without penalty, establishing clear starting benchmarks across all cadre domains.",
      icon: CheckCircle2,
    },
    {
      step: "04",
      title: "Psychometric Scoring (CAT)",
      cadre: "IRT 3-PL Algorithm",
      desc: "Computerized Adaptive Testing adjusts item difficulty based on officer ability (θ) with Fisher Information maximization to minimize standard error with fewer questions.",
      icon: BarChart3,
    },
    {
      step: "05",
      title: "Explainable Skill Gaps",
      cadre: "Deficiency Breakdown",
      desc: "Transparent diagnostics showing exact competencies below benchmark, including root-cause analysis referencing specific operational survey procedures.",
      icon: Cpu,
    },
    {
      step: "06",
      title: "Personalized Learning Paths",
      cadre: "NSSTA & iGOT Curriculum",
      desc: "Automated curriculum recommendations assembled from NSSTA master training catalogs and iGOT Karmayogi modules to close identified gaps rapidly.",
      icon: BookOpen,
    },
    {
      step: "07",
      title: "Source-Traceable Verification",
      cadre: "Post-Training Exam",
      desc: "Rigorous verification tests where every single question directly cites official manuals, chapters, and page numbers, preventing ambiguity or AI hallucinations.",
      icon: FileCheck2,
    },
    {
      step: "08",
      title: "Dynamic Cadre Recalibration",
      cadre: "Closed-Loop Governance",
      desc: "Competency scores update automatically across the national database, enabling leadership to forecast cadre readiness for upcoming national surveys.",
      icon: TrendingUp,
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
            Closed-Loop Methodology
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
            How{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Sketu AI
            </span>{" "}
            Works
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            An end-to-end 8-stage cyclical workflow ensuring every officer in India&apos;s statistical cadres achieves verifiable operational excellence.
          </p>
        </div>

        {/* 8 Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {stages.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 group-hover:text-blue-600 transition-colors">
                      {st.step}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                    {st.cadre}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Flow Summary */}
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/70 p-8 sm:p-10 text-center max-w-4xl mx-auto shadow-sm">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
            Closed-Loop Assurance for National Survey Precision
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
            From NSS 78th Round household schedules to the Annual Survey of Industries, Sketu AI guarantees that officers receive targeted training backed by official manuals.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/trainer/materials/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-800 transition"
            >
              <span>Upload Guidelines & Synthesize Questions</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ai-engine"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition"
            >
              <span>View Psychometrics Lab</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
