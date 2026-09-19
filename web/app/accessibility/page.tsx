"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col font-sans antialiased text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black mb-4">Accessibility Statement</h1>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 bg-white p-8 rounded-3xl border border-slate-200">
          <p>
            Disha AI adheres to the Guidelines for Indian Government Websites (GIGW 3.0) and WCAG 2.1 AA accessibility standards, ensuring compatibility with screen readers and keyboard navigation.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
