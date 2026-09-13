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
  Bot,
  Sliders,
  Check,
  ExternalLink,
} from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";
import { SourceCitationBadge } from "@/components/ui/SourceCitationBadge";

export default function HomePage() {
  const [activeSandboxTab, setActiveSandboxTab] = useState<"generator" | "copilot" | "adaptive">("generator");

  const platformStats = [
    { label: "Cadre Officers Evaluated", value: "3,850+", detail: "SSS & ISS Cadres nationwide" },
    { label: "Source Citation Fidelity", value: "98.4%", detail: "Zero-hallucination page references" },
    { label: "Large PDF Processing", value: "500+ Pages", detail: "Multi-worker parallel chunking" },
    { label: "Closed-Loop Cycle", value: "8 Stages", detail: "From profile to continuous recalibration" },
  ];

  const lifecycleStages = [
    {
      num: "01",
      title: "Cadre Profile Ingestion",
      desc: "Comprehensive profile indexing for Subordinate Statistical Service (SSS) & ISS officers with historical postings.",
      tag: "Foundational",
      icon: Users,
    },
    {
      num: "02",
      title: "Role Benchmark Matrix",
      desc: "Official MoSPI competency requirements defined per job role by Joint Directors (NSO, FOD, SDRD, ESD).",
      tag: "Standards",
      icon: Target,
    },
    {
      num: "03",
      title: "Diagnostic Assessment",
      desc: "Baseline evaluation mapping initial capabilities across Statistical, Technical, and Governance domains.",
      tag: "Diagnosis",
      icon: CheckCircle2,
    },
    {
      num: "04",
      title: "Psychometric Scoring",
      desc: "Computerized Adaptive Testing (CAT) with standard error estimation and confidence bounds.",
      tag: "Evaluation",
      icon: BarChart3,
    },
    {
      num: "05",
      title: "Explainable Skill Gaps",
      desc: "Transparent deficiency analysis detailing why a gap exists relative to specific operational cadre duties.",
      tag: "Analytics",
      icon: Cpu,
    },
    {
      num: "06",
      title: "Personalized Learning Paths",
      desc: "Curriculum automated from NSSTA and iGOT Karmayogi catalogs matched to exact competency deficits.",
      tag: "Remediation",
      icon: BookOpen,
    },
    {
      num: "07",
      title: "Source-Traceable Verification",
      desc: "Adaptive post-training evaluations where every question cites exact paragraphs and chunk IDs from official manuals.",
      tag: "Verification",
      icon: FileCheck2,
    },
    {
      num: "08",
      title: "Dynamic Cadre Recalibration",
      desc: "Continuous score updates, institutional skill matrices, training ROI analytics, and national capability dashboards.",
      tag: "Recalibration",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFF] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased relative">
      {/* Top Official National Bar with Tricolor Accent */}
      <div className="bg-slate-900 text-white text-xs">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-500" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium text-[11px] sm:text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Government of India • Ministry of Statistics and Programme Implementation (MoSPI)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-300 hidden sm:inline">National Statistical Systems Training Academy (NSSTA)</span>
            <PrototypeBadge label="SIH26101 OFFICIAL PROTOTYPE" />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-600/20 group-hover:scale-105 transition">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Sketu AI
                </h1>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  MoSPI
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Competency Intelligence & Assessment Platform</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link href="/copilot" className="hover:text-blue-700 transition flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-blue-600" />
              <span>AI Copilot</span>
              <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full">New</span>
            </Link>
            <Link href="/ai-engine" className="hover:text-blue-700 transition flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-indigo-600" />
              <span>Psychometrics Lab</span>
              <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded-full">CAT/IRT</span>
            </Link>
            <Link href="/trainer/materials/upload" className="hover:text-blue-700 transition flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>500p PDF Ingestion</span>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/copilot"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <Bot className="h-4 w-4 text-blue-600" />
              <span>Try AI Copilot</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 sm:px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-900 transition hover:scale-[1.02]"
            >
              <span>Officer Login</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-6 pt-16 pb-14 max-w-6xl mx-auto text-center">
        {/* Subtle decorative glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* SIH Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-blue-900 mb-6 shadow-2xs">
          <Shield className="h-3.5 w-3.5 text-blue-600" />
          <span>Smart India Hackathon 2026 • Problem Statement SIH26101</span>
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.12]">
          AI-Powered Competency Intelligence for{" "}
          <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
            India&apos;s Statistical Cadres
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
          An enterprise closed-loop assessment and continuous upskilling system designed for <strong>Subordinate Statistical Service (SSS)</strong> and <strong>Indian Statistical Service (ISS)</strong> officers — powered by Computerized Adaptive Testing, 500-page document ingestion, and verifiable page citations.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-blue-900 hover:scale-[1.02] transition"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Launch Platform Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/copilot"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs hover:border-blue-500"
          >
            <Bot className="h-4 w-4 text-blue-600" />
            <span>Open Sketu AI Copilot</span>
          </Link>
          <Link
            href="/ai-engine"
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-5 py-3 text-xs sm:text-sm font-bold text-indigo-900 hover:bg-indigo-100 transition shadow-2xs"
          >
            <Cpu className="h-4 w-4 text-indigo-700" />
            <span>Psychometrics Lab</span>
          </Link>
        </div>

        {/* THREE ROLE DEMO TILES */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto text-left">
          {/* Card 1: Employee */}
          <Link
            href="/employee/dashboard"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Cadre Officer
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                Rahul Sharma (Statistical Officer)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Personalized competency radar, explainable skill gaps, diagnostic assessments, and adaptive micro-courses.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition">
              <span>Open Officer Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 2: Trainer */}
          <Link
            href="/trainer/dashboard"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  NSSTA Faculty
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                Dr. P. Rao (Senior Faculty)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload 500-page training guidelines, synthesize 50+ source-cited questions, and assemble cadre evaluations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition">
              <span>Open Trainer Workspace</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>

          {/* Card 3: Admin */}
          <Link
            href="/admin/dashboard"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Cadre Admin
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition">
                Director S. Murthy (MoSPI HQ)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Institutional capability heatmaps, department benchmarking (NSO, FOD, SDRD), and role-matrix governance.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-700 group-hover:translate-x-1 transition">
              <span>Open Admin Center</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* PLATFORM STATISTICS STRIP */}
      <section className="border-y border-slate-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {platformStats.map((st, i) => (
            <div key={i} className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-[#1E3A8A]">
                {st.value}
              </div>
              <div className="text-xs font-bold text-slate-800">{st.label}</div>
              <div className="text-[11px] text-slate-500">{st.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE LIVE AI SANDBOX */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Live Interactive Capabilities
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Experience Sketu AI in Action
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto">
            Explore how our AI models power verifiable assessments, methodology Q&A, and psychometrics.
          </p>
        </div>

        {/* Sandbox Container */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveSandboxTab("generator")}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeSandboxTab === "generator"
                  ? "bg-[#1E3A8A] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileCheck2 className="h-4 w-4" />
              <span>500p PDF Question Synthesis</span>
            </button>

            <button
              onClick={() => setActiveSandboxTab("copilot")}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeSandboxTab === "copilot"
                  ? "bg-[#1E3A8A] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>Cadre AI Copilot RAG</span>
            </button>

            <button
              onClick={() => setActiveSandboxTab("adaptive")}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeSandboxTab === "adaptive"
                  ? "bg-[#1E3A8A] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span>Computerized Adaptive Testing (CAT)</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {activeSandboxTab === "generator" && (
              <div className="space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <div>
                    <span className="font-bold text-blue-950">Active Ingested Document:</span>
                    <span className="ml-2 font-mono text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                      National_Survey_Field_Handbook_Vol_2.pdf (500 Pages)
                    </span>
                  </div>
                  <Link
                    href="/trainer/materials/upload"
                    className="text-blue-700 font-bold hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Upload Custom PDF</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Question Preview Box */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 bg-white border border-blue-200 px-2.5 py-0.5 rounded">
                      Statistical Methodologies • Stratified Sampling
                    </span>
                    <span className="font-semibold text-slate-500">
                      Difficulty: <strong className="text-slate-900">Medium</strong>
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-sm">
                    In official household consumption surveys under MoSPI, why is the Horvitz-Thompson estimator preferred over simple sample mean substitution?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700">
                      A. It simplifies data entry in rural field offices
                    </div>
                    <div className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold flex items-center justify-between">
                      <span>B. It ensures exact unbiasedness under unequal probability selection (PPS)</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-300">Correct</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700">
                      C. It eliminates the need for first-stage sampling units
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700">
                      D. It replaces post-stratification weight calibration
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <SourceCitationBadge
                      document="National_Survey_Field_Handbook_Vol_2.pdf"
                      page={214}
                      chunkId="chunk_nationalsurvey_p214_2"
                    />
                    <span className="text-emerald-700 font-bold">
                      Confidence Score: 98.2% • Verified against Source Paragraph
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSandboxTab === "copilot" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <span>Cadre Officer asks: &ldquo;What is the difference between GCS and PCS in Survey Cartography?&rdquo;</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed space-y-2">
                    <p>
                      <strong>Geographic Coordinate System (GCS)</strong> measures positions on a 3D spherical globe using angular coordinates (Latitude and Longitude in WGS84 or Everest 1830 Datum).
                    </p>
                    <p>
                      <strong>Projected Coordinate System (PCS)</strong> mathematically flattens the earth onto a 2D plane with linear units (Meters), essential for cadastral surveying and distance calculations without spatial distortion.
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <SourceCitationBadge
                        document="GIS Training.pdf"
                        page={22}
                        chunkId="chunk_gis_p22_04"
                      />
                      <Link
                        href="/copilot"
                        className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <span>Open Copilot Chat</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSandboxTab === "adaptive" && (
              <div className="space-y-4 text-xs">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-blue-950 text-sm">Computerized Adaptive Testing (CAT) Engine</h4>
                    <span className="font-mono text-xs font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                      3PL IRT Model Active
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">
                    Questions dynamically adjust in real time. Correct answers increase difficulty ($\theta \uparrow$), while errors serve foundational items ($\theta \downarrow$) to pinpoint exact capability with minimal test items.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/ai-engine"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold shadow-xs hover:bg-blue-900"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      <span>Launch Interactive Psychometrics Simulator</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8-STAGE CLOSED-LOOP ARCHITECTURE */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            The Institutional Cycle
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            The 8-Stage Competency Loop
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto">
            How Sketu AI bridges cadre recruitment, diagnosis, and dynamic competency recalibration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lifecycleStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.num}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      STAGE {stage.num}
                    </span>
                    <Icon className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">
                    {stage.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Verified in MoSPI Prototype</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* QUICK DEMO CREDENTIALS STRIP */}
      <section className="py-10 px-4 sm:px-6 bg-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-slate-300 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center justify-center md:justify-start gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Direct Credentials for Evaluation
            </span>
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
              Ready to Test Any Cadre Persona
            </h4>
            <p className="text-xs text-slate-500">
              Password for all roles: <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-bold text-slate-800">DemoPassword123!</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-xs font-bold text-white shadow-md hover:bg-blue-900 transition"
            >
              Sign In to Platform →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-medium text-slate-700">
          <Shield className="h-4 w-4 text-blue-700" />
          <span>Sketu AI • Ministry of Statistics and Programme Implementation (MoSPI)</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Smart India Hackathon 2026 Official Prototype • Problem Statement SIH26101 • Subordinate Statistical Service (SSS) & ISS Cadre Portal
        </p>
      </footer>
    </div>
  );
}
