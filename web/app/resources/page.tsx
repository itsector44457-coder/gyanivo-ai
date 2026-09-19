"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, Download, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";

export default function ResourcesPage() {
  const docs = [
    {
      title: "Disha AI User Manual & Architecture Document",
      desc: "Complete operational handbook covering officer diagnostic workflow, IRT psychometrics, and trainer authoring.",
      type: "PDF Guide",
      size: "4.2 MB",
    },
    {
      title: "NSS 78th Round Household Guidelines",
      desc: "Benchmark operational instructions for Multiple Indicator Survey scheduling and sampling weights.",
      type: "Official Manual",
      size: "8.5 MB",
    },
    {
      title: "Consumer Price Index (CPI) Technical Notes",
      desc: "Specification manual for commodity basket weighting, price relative computation, and index aggregation.",
      type: "Statistical Guide",
      size: "3.1 MB",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col font-sans antialiased text-slate-900">
      <Header />
      <main className="flex-1 max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            Documentation & Resources
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
            Cadre Resources & Guides
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Official manuals, curriculum documents, and architecture whitepapers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                  {doc.type} • {doc.size}
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {doc.desc}
                </p>
              </div>

              <Link
                href="/trainer/materials"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
              >
                <span>Access in Trainer Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
