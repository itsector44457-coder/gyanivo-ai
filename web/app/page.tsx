import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Award,
  CheckCircle,
  FileCheck,
  TrendingUp,
  Cpu,
  Database,
  Building2,
  BookOpen,
} from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

export default function HomePage() {
  const lifecycleSteps = [
    { num: "01", title: "Employee Profile", desc: "Cadre mapping for Subordinate Statistical Service (SSS) & ISS officers." },
    { num: "02", title: "Role Benchmark Matrix", desc: "Official MoSPI competency requirements defined per job role." },
    { num: "03", title: "Diagnostic Assessment", desc: "Adaptive baseline evaluation to gauge current domain capabilities." },
    { num: "04", title: "Competency Scoring", desc: "Objective competency rating across Statistical, Technical & Governance domains." },
    { num: "05", title: "Skill Gap Detection", desc: "Explainable gap analytics linking job role responsibilities with deficits." },
    { num: "06", title: "Personalized Learning", desc: "Targeted modules mapped from NSSTA and iGOT sample catalogues." },
    { num: "07", title: "Adaptive Assessment", desc: "Source-traceable verification linked to official training materials & page citations." },
    { num: "08", title: "Competency Recalibration", desc: "Continuous score updates, organizational analytics, and repeat feedback." },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Banner */}
      <div className="bg-[#172554] border-b border-blue-900/60 px-4 py-2 text-xs text-center text-blue-200 flex items-center justify-center gap-3">
        <span className="font-semibold text-white">Smart India Hackathon • SIH26101</span>
        <span className="text-blue-400">|</span>
        <span>Ministry of Statistics and Programme Implementation (MoSPI)</span>
        <PrototypeBadge label="PROTOTYPE SYSTEM" />
      </div>

      {/* Main Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md">
            <Sparkles className="h-6 w-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">Gyanivo AI</h1>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-400/30">
                MoSPI
              </span>
            </div>
            <p className="text-xs text-slate-400">Competency Intelligence & Adaptive Learning</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition"
          >
            Officer Sign In →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-28 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-3.5 py-1 text-xs font-semibold text-blue-300 mb-6">
          <Shield className="h-3.5 w-3.5 text-blue-400" />
          Official Statistical System Competency Platform
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          AI-Enabled Competency Intelligence for{" "}
          <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
            India&apos;s Statistical Cadre
          </span>
        </h2>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Empowering MoSPI officers through explainable skill-gap detection, role-calibrated competency matrices, source-traceable AI assessments, and continuous adaptive upskilling.
        </p>

        {/* Quick Launch Buttons for Demo */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-500 hover:scale-[1.02] transition"
          >
            Launch Official Portal
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/employee/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Direct Employee Demo (Rahul)
          </Link>

          <Link
            href="/trainer/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Trainer Workspace
          </Link>

          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Cadre Admin Center
          </Link>
        </div>
      </section>

      {/* 8-Stage Competency Loop Section */}
      <section className="bg-slate-950 py-16 border-y border-slate-800 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Closed-Loop Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              The 8-Stage Competency Intelligence Cycle
            </h3>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
              Moving beyond static quizzes to a living competency feedback loop tailored for government statistical operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lifecycleSteps.map((step) => (
              <div
                key={step.num}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-blue-500/50 transition flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                    STAGE {step.num}
                  </span>
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                </div>
                <h4 className="font-bold text-slate-100 text-sm">{step.title}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed flex-1">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiator Highlights */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Explainable Skill Gaps</h4>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Every identified gap includes transparent rationale connecting officer duties (e.g. PLFS geo-referencing) to specific missing competencies.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <FileCheck className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Source-Traceable AI Assessment</h4>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              AI-generated questions and feedback cite exact pages and chunks from uploaded official documents (e.g. <em>GIS Training.pdf, Page 22</em>).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-base">Dynamic Cadre Governance</h4>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Configurable role-competency matrix management, department gap distributions (NSO, FOD, SDRD, ESD), and measurable training ROI.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        <p>Gyanivo AI • Ministry of Statistics and Programme Implementation (MoSPI) • SIH26101</p>
        <p className="mt-1 text-slate-600">
          Prototype Implementation for Smart India Hackathon. All cadre data represents sample demo figures.
        </p>
      </footer>
    </div>
  );
}
