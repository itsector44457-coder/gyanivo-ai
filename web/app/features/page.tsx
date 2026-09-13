"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  FileText,
  Cpu,
  Bot,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  BarChart3,
  Search,
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: FileText,
      tag: "Ingestion Engine",
      title: "500+ Page Official PDF Ingestion",
      desc: "Upload large official manuals (e.g., NSS 78th Round, Consumer Price Index guidelines, Annual Survey of Industries). The system splits documents into semantic chunks with exact line and paragraph coordinates.",
      color: "from-blue-600 to-cyan-600",
      link: "/trainer/materials/upload",
      linkText: "Test PDF Pipeline",
    },
    {
      icon: ShieldCheck,
      tag: "Zero Hallucination",
      title: "Verifiable Source Citations",
      desc: "Every AI-generated evaluation question carries a cryptographically verifiable citation badge detailing the exact document title, chapter, and page number for auditing.",
      color: "from-emerald-600 to-teal-600",
      link: "/trainer/question-bank",
      linkText: "View Cited Questions",
    },
    {
      icon: Cpu,
      tag: "Psychometrics",
      title: "CAT / IRT Adaptive Assessment",
      desc: "Computerized Adaptive Testing powered by 3-Parameter Logistic Item Response Theory adjusts question difficulty in real-time based on candidate ability (θ).",
      color: "from-indigo-600 to-violet-600",
      link: "/ai-engine",
      linkText: "Open CAT Simulator",
    },
    {
      icon: Bot,
      tag: "RAG Assistant",
      title: "Sketu AI Cadre Copilot",
      desc: "Interactive statistical methodology assistant answering officer queries with verifiable source references from official MoSPI survey instructions.",
      color: "from-purple-600 to-pink-600",
      link: "/copilot",
      linkText: "Chat with Copilot",
    },
    {
      icon: BarChart3,
      tag: "Diagnosis",
      title: "Explainable Skill Gap Identification",
      desc: "Pinpoint precise competency deficiencies across Statistical Theory, Field Operations, and Data Quality before curating targeted micro-learning.",
      color: "from-amber-600 to-orange-600",
      link: "/employee/skill-gaps",
      linkText: "Inspect Skill Gaps",
    },
    {
      icon: BookOpen,
      tag: "Curriculum",
      title: "iGOT Karmayogi & NSSTA Integration",
      desc: "Curated learning modules matched dynamically to diagnosed officer gaps, closing the loop between assessment, training, and operational redeployment.",
      color: "from-sky-600 to-blue-600",
      link: "/employee/courses",
      linkText: "Explore Courses",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFF] text-slate-900 flex flex-col font-sans antialiased">
      <Header />

      <main className="flex-1 max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Core Capabilities
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
            Next-Generation AI for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Statistical Intelligence
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Built specifically for India&apos;s National Statistical System (MoSPI, SSS, ISS). Explore the core technologies powering closed-loop competency management.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={f.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>{f.linkText}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Bar */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to evaluate the live system?</h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Log in with an officer, trainer, or administrative profile to experience closed-loop competency workflows in real-time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 transition"
            >
              Sign In to Platform
            </Link>
            <Link
              href="/copilot"
              className="px-6 py-3.5 rounded-xl bg-blue-600/40 border border-white/20 text-white font-bold text-sm hover:bg-blue-600/60 transition"
            >
              Try AI Copilot
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
