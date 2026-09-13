"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Award,
  CheckCircle2,
  FileCheck2,
  TrendingUp,
  Cpu,
  Database,
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  BarChart3,
  Target,
  FileText,
  ChevronRight,
  Zap,
  Lock,
  Compass,
  ArrowUpRight,
  FileCheck,
} from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"cadre" | "trainer" | "admin">("cadre");

  const platformStats = [
    { label: "Cadre Officers Covered", value: "3,850+", detail: "SSS & ISS Cadres across India" },
    { label: "Source Citation Fidelity", value: "98.4%", detail: "Zero-hallucination page references" },
    { label: "Large PDF Processing", value: "500+ Pages", detail: "Multi-worker OCR & chunk synthesis" },
    { label: "Competency Loop Stages", value: "8-Stage Cycle", detail: "Profile to Recalibration" },
  ];

  const lifecycleStages = [
    {
      num: "01",
      title: "Cadre Profile Ingestion",
      desc: "Comprehensive profile creation for Subordinate Statistical Service (SSS) & ISS officers with historical postings and assignments.",
      tag: "Foundation",
    },
    {
      num: "02",
      title: "Role Benchmark Matrix",
      desc: "Official MoSPI competency benchmarks defined by Joint Directors for every cadre designation (e.g. Statistical Officer, Field Investigator).",
      tag: "Standards",
    },
    {
      num: "03",
      title: "Diagnostic Assessment",
      desc: "Multi-domain baseline evaluation using calibrated item banks to map initial abilities across Statistical, Technical, and Governance areas.",
      tag: "Assessment",
    },
    {
      num: "04",
      title: "Psychometric Scoring",
      desc: "Objective scoring with standard error estimation and confidence levels based on Computerized Adaptive Testing (CAT) principles.",
      tag: "Evaluation",
    },
    {
      num: "05",
      title: "Explainable Skill Gaps",
      desc: "Transparent deficiency analysis detailing why a gap exists relative to specific cadre duties (e.g. CPI imputation, NSS stratification).",
      tag: "Analytics",
    },
    {
      num: "06",
      title: "Personalized Learning Paths",
      desc: "Automated curriculum curation from NSSTA and iGOT Karmayogi catalogs matched to the officer's exact competency deficits.",
      tag: "Upskilling",
    },
    {
      num: "07",
      title: "Source-Traceable Verification",
      desc: "Adaptive post-training evaluations where every question cites exact paragraphs and chunk IDs from official manuals.",
      tag: "Verification",
    },
    {
      num: "08",
      title: "Dynamic Cadre Recalibration",
      desc: "Continuous score updates, institutional skill matrices, training ROI analytics, and national capability dashboards.",
      tag: "Continuous Loop",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070D1B] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-80 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 -right-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Official National Bar with Tricolor Accent */}
      <div className="bg-[#0B152B] border-b border-blue-900/40 text-xs">
        <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-500 opacity-80" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-slate-300">
          <div className="flex items-center gap-2 font-medium text-[11px] sm:text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Government of India • Ministry of Statistics and Programme Implementation (MoSPI)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400 hidden sm:inline">National Statistical Systems Training Academy (NSSTA)</span>
            <PrototypeBadge label="SIH26101 OFFICIAL PROTOTYPE" />
          </div>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="border-b border-slate-800/80 bg-[#070D1B]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Sketu AI
                  <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold text-blue-300 border border-blue-400/30">
                    MoSPI
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400">Official Statistical System Competency Platform</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition hover:scale-[1.02]"
            >
              <span>Sign In with Role</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-16 pb-14 max-w-6xl mx-auto text-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-4 py-1.5 text-xs font-semibold text-blue-300 mb-6 shadow-sm">
          <Shield className="h-3.5 w-3.5 text-blue-400" />
          <span>Smart India Hackathon 2026 • Problem Statement SIH26101</span>
        </div>

        {/* Hero Title */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
          AI-Enabled Competency Intelligence for{" "}
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            India&apos;s Statistical Cadres
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          A closed-loop competency evaluation and adaptive upskilling ecosystem designed for <strong>Subordinate Statistical Service (SSS)</strong> and <strong>Indian Statistical Service (ISS)</strong> officers — featuring explainable gap analytics, large-document PDF item generation, and verifiable source page citations.
        </p>

        {/* Quick Launch Role Tiles */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto text-left">
          {/* Employee Card */}
          <Link
            href="/employee/dashboard"
            className="group relative p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/70 hover:border-blue-500/60 shadow-lg hover:shadow-blue-500/10 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-blue-500/15 border border-blue-400/20 text-blue-400 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/60">
                  Officer Portal
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                  Cadre Officer Experience
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Demo account: <strong>Rahul Sharma</strong> (Statistical Officer). View personalized skill radar, adaptive tests, and course catalog.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition">
              <span>Open Officer Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>

          {/* Trainer Card */}
          <Link
            href="/trainer/dashboard"
            className="group relative p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/70 hover:border-emerald-500/60 shadow-lg hover:shadow-emerald-500/10 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-400/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                  Faculty Center
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                  Trainer & NSSTA Workspace
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Demo account: <strong>Dr. P. Rao</strong> (Senior Faculty). Ingest 500-page manuals, generate verified question banks with citations.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition">
              <span>Open Trainer Workspace</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>

          {/* Admin Card */}
          <Link
            href="/admin/dashboard"
            className="group relative p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/70 hover:border-purple-500/60 shadow-lg hover:shadow-purple-500/10 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-400/20 text-purple-400 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60">
                  Cadre Admin
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                  HQ Cadre Management
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Demo account: <strong>Director S. Murthy</strong>. Review national competency heatmaps, role benchmarks, and audit trails.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition">
              <span>Open Admin Center</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Platform Statistics Bar */}
      <section className="border-y border-slate-800/80 bg-[#091122]/90 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {platformStats.map((st, i) => (
            <div key={i} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
                {st.value}
              </div>
              <div className="text-xs font-bold text-slate-200">{st.label}</div>
              <div className="text-[11px] text-slate-500">{st.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 8-Stage Closed-Loop Interactive Architecture */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950/80 border border-blue-800/50 px-3 py-1 rounded-full">
            Continuous Intelligence Cycle
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            The 8-Stage Competency Loop
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
            Traditional learning platforms stop at static multiple-choice tests. Sketu AI implements a living feedback architecture tailored to government statistical operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lifecycleStages.map((stage) => (
            <div
              key={stage.num}
              className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-blue-500/5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-black text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50">
                    STAGE {stage.num}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
                    {stage.tag}
                  </span>
                </div>
                <h4 className="font-bold text-slate-100 text-sm group-hover:text-blue-300 transition">
                  {stage.title}
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Verified in Prototype</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="border-t border-slate-800/80 bg-[#060B17] py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-800/50 px-3 py-1 rounded-full">
              Engine Capabilities
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Why Sketu AI Solves SIH26101
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
              Engineered specifically for the institutional challenges of the Ministry of Statistics & Programme Implementation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950 border border-slate-800/80 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600/15 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                500-Page Document Ingestion
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload massive manuals like the <em>National Survey Field Handbook</em> or <em>GIS Guidelines</em>. High-throughput extraction maps semantic chapter structures and distributes questions evenly across all pages.
              </p>
              <div className="pt-2 text-[11px] text-blue-400 font-medium">
                • Chunk IDs & exact page references
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950 border border-slate-800/80 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Adaptive Assessment (CAT)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dynamically calibrates item difficulty according to the officer&apos;s real-time accuracy and response confidence. Prevents test fatigue while providing rigorous psychometric reliability.
              </p>
              <div className="pt-2 text-[11px] text-emerald-400 font-medium">
                • Computerized Adaptive Testing (IRT)
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950 border border-slate-800/80 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-600/15 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Institutional Cadre Governance
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role-Competency Matrix mapping for NSO, FOD, SDRD, and CPD departments. Provides Directors with macro heatmaps to plan targeted NSSTA training cohorts before major survey launches.
              </p>
              <div className="pt-2 text-[11px] text-purple-400 font-medium">
                • Cadre skill audit & training ROI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Evaluation Credentials Strip */}
      <section className="py-12 px-4 sm:px-6 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto rounded-2xl bg-slate-900/90 border border-blue-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-center md:justify-start gap-1.5">
              <Zap className="h-4 w-4" /> Ready for Competition Judges & Evaluators
            </span>
            <h4 className="text-lg font-bold text-white">
              Experience the Full Prototype Live
            </h4>
            <p className="text-xs text-slate-400 max-w-md">
              Sign in using pre-seeded test accounts for Employee, Trainer, or Administrator roles.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition hover:scale-105"
            >
              Sign In to Sketu AI →
            </Link>
            <Link
              href="/trainer/materials/upload"
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              Test 500p PDF Upload
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#050914] py-8 px-4 sm:px-6 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
          <Shield className="h-3.5 w-3.5 text-blue-400" />
          <span>Sketu AI • Ministry of Statistics and Programme Implementation (MoSPI)</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Smart India Hackathon 2026 Prototype • Problem Statement SIH26101 • Subordinate Statistical Service (SSS) & ISS Cadre Architecture
        </p>
      </footer>
    </div>
  );
}
