"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  ShieldCheck,
  BrainCircuit,
  Award,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFF] text-slate-900 flex flex-col font-sans antialiased">
      <Header />

      <main className="flex-1 max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            Smart India Hackathon • SIH26101
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
            About{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Disha AI
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            An enterprise AI platform engineered to empower India&apos;s Official Statistical System with closed-loop competency diagnostics, computerized adaptive testing, and verifiable learning.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Ministry of Statistics & Programme Implementation (MoSPI)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              MoSPI oversees the Subordinate Statistical Service (SSS) and Indian Statistical Service (ISS), conducting high-stakes nationwide surveys including the National Sample Survey (NSS), Consumer Price Index (CPI), and Annual Survey of Industries (ASI). Disha AI ensures officers master survey guidelines with verifiable precision.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              Zero-Hallucination AI Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Unlike generic LLMs, Disha AI binds every question, explanation, and recommendation to cryptographically verifiable source citations directly from official gazetted manuals, guidelines, and curriculum documents.
            </p>
          </div>
        </div>

        {/* Key Pillars */}
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 mb-16">
          <h2 className="text-2xl font-black mb-6">Core Technological Innovations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-blue-400 font-bold text-sm">01. 500p Document Ingestion</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Parallel worker chunking that digests entire survey guidelines and synthesizes evaluation questions in seconds.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-emerald-400 font-bold text-sm">02. CAT / IRT Psychometrics</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Computerized Adaptive Testing powered by 3-Parameter Logistic Item Response Theory for standard error convergence.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-violet-400 font-bold text-sm">03. iGOT Karmayogi Sync</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct alignment with India&apos;s Mission Karmayogi civil service competency framework.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition"
          >
            <span>Launch Platform</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
