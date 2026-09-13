"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  FileCheck2,
  Cpu,
  Target,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  BarChart2,
  Sliders,
} from "lucide-react";

export default function AssessmentsPage() {
  const assessmentTypes = [
    {
      title: "Diagnostic Baseline Assessment",
      purpose: "Entry-level cadre profiling",
      desc: "Comprehensive evaluation administered when an officer joins a new posting or division. Measures broad aptitude across sampling theory, schedule filling, and data validation without penalization.",
      items: "20-30 Adaptive Items",
      time: "45 Minutes",
      metric: "Baseline Theta (θ)",
    },
    {
      title: "CAT Adaptive Progress Evaluation",
      purpose: "Continuous competency recalibration",
      desc: "3-Parameter Logistic (3PL) IRT dynamically selects questions targeting the candidate's exact ability estimate, yielding high measurement precision in 50% less test time.",
      items: "15 Adaptive Items",
      time: "20 Minutes",
      metric: "SE(θ) < 0.28 Convergence",
    },
    {
      title: "Source-Cited Post-Training Exam",
      purpose: "Course completion certification",
      desc: "Post-training verification tests generated directly from official 500-page training manuals with mandatory paragraph citations for auditing and accountability.",
      items: "25 Rigorous Questions",
      time: "35 Minutes",
      metric: "Pass Benchmark: 80%",
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
            Computerized Adaptive Testing
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
            Scientifically Validated{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Assessments
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Move beyond static MCQs. Sketu AI implements modern Item Response Theory (IRT) and Automated Question Synthesis to measure true officer competence with mathematical precision.
          </p>
        </div>

        {/* 3 Assessment Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {assessmentTypes.map((a, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  {a.purpose}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {a.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {a.desc}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600 rounded-2xl bg-slate-50 p-3 mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ITEMS</span>
                    <span className="font-bold text-slate-800">{a.items}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TIME</span>
                    <span className="font-bold text-slate-800">{a.time}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px]">EVALUATION CRITERIA</span>
                    <span className="font-bold text-blue-700">{a.metric}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/employee/assessments"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition"
              >
                <span>View Candidate Assessments</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* CAT Psychometrics Spotlight */}
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
              Interactive Psychometric Lab
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Explore the CAT / IRT Simulation Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Test how candidate ability (θ), item difficulty (b), discrimination (a), and pseudo-guessing (c) converge in real time with live probability curves and standard error bounds.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/ai-engine"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 transition"
              >
                <Cpu className="h-4 w-4" />
                <span>Launch Psychometrics Lab</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-700 transition"
              >
                <span>Take Practice Test</span>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 w-full lg:max-w-md text-xs font-mono space-y-2">
            <div className="text-slate-400">// IRT 3-Parameter Logistic (3PL) Formula</div>
            <div className="text-blue-400 font-bold">P(θ) = c + (1 - c) / [1 + exp(-1.7 * a * (θ - b))]</div>
            <div className="pt-2 text-slate-400">// Fisher Information Function</div>
            <div className="text-emerald-400">I(θ) = [P&apos;(θ)]² / [P(θ) * (1 - P(θ))]</div>
            <div className="pt-2 text-slate-400">// Standard Error of Estimation</div>
            <div className="text-violet-400">SE(θ) = 1 / √[Σ I_i(θ)]</div>
          </div>
        </div>
      </main>
    </div>
  );
}
