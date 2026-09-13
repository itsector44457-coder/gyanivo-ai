"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col font-sans antialiased text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black mb-4">Terms of Use</h1>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 bg-white p-8 rounded-3xl border border-slate-200">
          <p>
            The Sketu AI platform is deployed under the Smart India Hackathon 2026 (SIH26101) initiative for the Ministry of Statistics and Programme Implementation (MoSPI).
          </p>
          <p>
            Usage is authorized for cadre officers, NSSTA faculty members, and administrative personnel to evaluate, learn, and recalibrate competencies.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
