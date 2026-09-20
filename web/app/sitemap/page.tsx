"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SitemapPage() {
  const sections = [
    {
      title: "Core Platform",
      links: [
        { name: "Home", href: "/" },
        { name: "Features", href: "/features" },
        { name: "How It Works", href: "/how-it-works" },
        { name: "Roles", href: "/roles" },
        { name: "Assessments", href: "/assessments" },
        { name: "Analytics", href: "/analytics" },
        { name: "About Disha AI", href: "/about" },
      ],
    },
    {
      title: "Portals & Tools",
      links: [
        { name: "Officer Portal", href: "/employee/dashboard" },
        { name: "Trainer Workspace", href: "/trainer/dashboard" },
        { name: "Admin Governance", href: "/admin/dashboard" },
        { name: "Adaptive Assessment Engine", href: "/employee/assessments" },
        { name: "AI Copilot", href: "/copilot" },
        { name: "Syllabus Upload & Ingestion", href: "/trainer/materials/upload" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col font-sans antialiased text-slate-900">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-black mb-8">Platform Sitemap</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {sections.map((sec, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-4">{sec.title}</h2>
              <ul className="space-y-2 text-xs">
                {sec.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link href={link.href} className="text-blue-600 hover:underline">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
