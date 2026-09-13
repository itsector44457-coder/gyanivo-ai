"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col font-sans antialiased text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black mb-4">Privacy & Data Protection Policy</h1>
        <p className="text-sm text-slate-600 mb-6">
          Compliance with India Digital Personal Data Protection (DPDP) Act 2023 & Government of India Cyber Security Guidelines.
        </p>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 bg-white p-8 rounded-3xl border border-slate-200">
          <p>
            Sketu AI processes officer competency scores, assessment answers, and training progress strictly within authorized MoSPI boundary controls. No personally identifiable officer information (PII) is shared with third-party external LLM APIs.
          </p>
          <p>
            All generated questions, evaluation items, and session logs are encrypted in transit via TLS 1.3 and at rest with AES-256 standards.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
