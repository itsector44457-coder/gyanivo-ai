"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "What is Sketu AI and which government cadre is it built for?",
      a: "Sketu AI is an AI-powered competency intelligence, adaptive assessment, and personalized learning platform developed for India's Official Statistical System under MoSPI, catering specifically to Subordinate Statistical Service (SSS) and Indian Statistical Service (ISS) officers.",
    },
    {
      q: "How does the Computerized Adaptive Testing (CAT) work?",
      a: "CAT uses Item Response Theory (IRT) with a 3-Parameter Logistic (3PL) model. After each answered item, the engine recalibrates the officer's latent ability (θ) and dynamically selects the next item that maximizes Fisher Information, reducing testing time by over 50%.",
    },
    {
      q: "How does Sketu AI guarantee zero hallucinations in generated questions?",
      a: "All questions synthesized by Sketu AI are tied to exact page, paragraph, and chapter coordinates in uploaded official training manuals (e.g., NSS 78th Round guidelines, CPI calculation manuals). Every item includes a verifiable source citation badge.",
    },
    {
      q: "How does Sketu AI integrate with iGOT Karmayogi?",
      a: "Diagnosed competency gaps are automatically mapped against the iGOT Karmayogi civil service competency framework and NSSTA catalog to generate targeted micro-learning paths.",
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col font-sans antialiased text-slate-900">
      <Header />
      <main className="flex-1 max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-4">
            <HelpCircle className="h-3.5 w-3.5" />
            Frequently Asked Questions
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
            Questions & Answers
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything you need to know about the Sketu AI assessment and learning framework.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-slate-900 hover:text-blue-700 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                    openIdx === idx ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
