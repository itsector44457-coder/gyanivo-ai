"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  QrCode,
  Download,
  ExternalLink,
  Printer,
  Smartphone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";

export default function QRPage() {
  const liveUrl = "https://gyanivo-web.onrender.com/";
  const qrImageUrl = "/disha-qr-code.png";

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = "Disha_AI_Live_Website_QR.png";
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans antialiased text-slate-900 relative overflow-hidden">
      {/* Dynamic Background with Disha AI Logo Watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0 select-none print:hidden">
        {/* Ambient atmospheric glows matching Disha AI color palette */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-amber-400/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-indigo-500/10 blur-[140px]" />

        {/* Large Prominent Disha AI Logo Watermark */}
        <div className="relative flex items-center justify-center w-full h-full">
          <img
            src="/Disha_AI_Logo.png"
            alt="Disha AI Background"
            className="w-[950px] max-w-none opacity-20 filter drop-shadow-2xl select-none"
          />
        </div>

        {/* High-tech dot matrix overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e40af_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 print:hidden">
        <Header />
      </div>

      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-4 py-12 sm:px-6 w-full flex flex-col items-center">
        {/* Banner */}
        <div className="text-center max-w-xl mx-auto mb-8 print:mb-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <Smartphone className="h-3.5 w-3.5" />
            Live Platform QR Code
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Scan to Open{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Disha AI
            </span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Open camera on any smartphone or tablet to immediately test the live platform.
          </p>
        </div>

        {/* Poster Card (Ready for Presentation / Printing) */}
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-7 sm:p-8 text-center relative overflow-hidden print:border-none print:shadow-none">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-blue-600 to-emerald-500" />

          {/* MoSPI Branding */}
          <div className="flex items-center justify-center gap-2 mb-4 text-[11px] font-bold text-slate-600">
            <span className="text-base">🇮🇳</span>
            <span>Ministry of Statistics & Programme Implementation</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center">
              <img src="/Disha_AI_Logo.png" alt="Disha AI Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Disha <span className="text-blue-600">AI</span>
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              SIH26101
            </span>
          </div>

          {/* QR Code Container */}
          <div className="mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-white p-3 border-2 border-slate-900 shadow-inner flex items-center justify-center relative group">
            <img
              src={qrImageUrl}
              alt="Disha AI Live Website QR Code"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          {/* Instructions */}
          <div className="mt-5 space-y-1.5">
            <p className="text-xs font-bold text-slate-900">
              Point camera to scan & open live website:
            </p>
            <p className="text-[12px] font-mono font-bold text-blue-700 bg-blue-50 py-1.5 px-3 rounded-lg border border-blue-100 truncate">
              {liveUrl}
            </p>
            <p className="text-[11px] text-slate-400">
              Compatible with iOS Camera, Android Camera, Google Lens & Paytm
            </p>
          </div>

          {/* Action Buttons (Hidden when printing) */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2.5 print:hidden">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Image (PNG)</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Poster</span>
            </button>

            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Visit Link</span>
            </a>
          </div>
        </div>

        {/* Hackathon Tip */}
        <div className="mt-8 max-w-md bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center print:hidden">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Hackathon Presentation Tip</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Aap iss QR code ko download karke apni PPT, poster ya banner me lga sakte hain, taaki judges apne phone se direct live website scan karke dekh sakein!
          </p>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
