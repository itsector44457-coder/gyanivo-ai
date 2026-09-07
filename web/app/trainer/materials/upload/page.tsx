"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Check,
} from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

type PipelineStage =
  | "IDLE"
  | "UPLOADING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export default function TrainerUploadMaterialPage() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("Geographic Information Systems for Official Survey Cartography");
  const [programme, setProgramme] = useState("NSSTA Cadre Induction 2026");
  const [domain, setDomain] = useState("Technical");
  const [competencies, setCompetencies] = useState("GIS & Spatial Data Analysis, Data Visualization");
  const [language, setLanguage] = useState("English");
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>({
    name: "GIS Training.pdf",
    size: "8.4 MB",
  });

  // Pipeline execution state
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStage>("IDLE");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const pipelineSteps = [
    { label: "File validated & checksum verified", detail: "Format: PDF • Size: 8.4 MB" },
    { label: "OCR & Text extracted", detail: "54 pages parsed with layout preservation" },
    { label: "Pages & Section headers detected", detail: "6 major chapters mapped" },
    { label: "Content cleaned & normalized", detail: "Noise & headers/footers stripped" },
    { label: "Semantic chunks created", detail: "128 chunks (avg 400 tokens / chunk)" },
    { label: "Key topics & concepts detected", detail: "Identified GCS, PCS, Datums, LGD Joins" },
    { label: "Competencies mapped to MoSPI framework", detail: "Mapped to TECH-03 (GIS & Spatial Analysis)" },
    { label: "Vector embeddings created", detail: "Generated 1536-dim embeddings" },
    { label: "Source-traceable questions generated", detail: "36 multi-choice questions generated" },
    { label: "Question quality & hallucination verified", detail: "96% average confidence score" },
  ];

  const handleStartPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    setPipelineStatus("PROCESSING");
    setCurrentStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < pipelineSteps.length) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        setPipelineStatus("COMPLETED");
      }
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Upload Official Training Material
            </h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Upload PDF guidelines, manuals, or training documents to extract topics and generate source-traceable assessment items
          </p>
        </div>
      </div>

      {pipelineStatus === "IDLE" ? (
        <form onSubmit={handleStartPipeline} className="space-y-6">
          {/* Drag & Drop Upload Card */}
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center hover:border-blue-500 transition">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 mb-4 shadow-2xs">
              <Upload className="h-7 w-7" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Drag & Drop PDF Training Manual Here
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Supported format: PDF (up to 50MB). Scanned documents with OCR supported.
            </p>

            <div className="mt-4">
              <label className="inline-flex cursor-pointer rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition">
                <span>Browse Files</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setSelectedFile({
                        name: file.name,
                        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                      });
                    }
                  }}
                />
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900">
                <FileText className="h-4 w-4 text-blue-700" />
                <span>Selected: {selectedFile.name} ({selectedFile.size})</span>
              </div>
            )}
          </div>

          {/* Metadata Fields */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Official Material Metadata
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Material Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Training Programme
                </label>
                <input
                  type="text"
                  required
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Competency Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium"
                >
                  <option>Technical</option>
                  <option>Statistical</option>
                  <option>Digital Governance</option>
                  <option>Behavioural / Managerial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Competencies
                </label>
                <input
                  type="text"
                  required
                  value={competencies}
                  onChange={(e) => setCompetencies(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Language
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  File Format (MVP)
                </label>
                <input
                  type="text"
                  disabled
                  value="PDF Document (*.pdf)"
                  className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/trainer/materials"
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E3A8A] text-xs font-bold text-white shadow-md hover:bg-blue-900 transition"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              Upload & Run AI Pipeline
            </button>
          </div>
        </form>
      ) : (
        /* ANIMATED 10-STAGE AI PROCESSING PIPELINE VIEW */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {pipelineStatus === "COMPLETED" ? "Processing Complete" : "AI Processing Pipeline Active"}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {selectedFile?.name}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {title}
              </h2>
            </div>

            {pipelineStatus === "COMPLETED" && (
              <div className="flex items-center gap-2">
                <Link
                  href="/trainer/question-review"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition"
                >
                  <span>Review Generated Questions (36)</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Stepper List */}
          <div className="space-y-3">
            {pipelineSteps.map((step, idx) => {
              const isPast = idx < currentStepIndex || pipelineStatus === "COMPLETED";
              const isCurrent = idx === currentStepIndex && pipelineStatus === "PROCESSING";
              const isPending = idx > currentStepIndex && pipelineStatus === "PROCESSING";

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                    isPast
                      ? "bg-emerald-50/50 border-emerald-200 text-slate-900"
                      : isCurrent
                      ? "bg-blue-50 border-blue-300 text-blue-950 shadow-2xs"
                      : "bg-slate-50/50 border-slate-100 text-slate-400 opacity-60"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-300 text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold">{step.label}</p>
                      <span className="font-mono text-[10px] text-slate-500">
                        Stage {idx + 1} of 10
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 mt-0.5">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions on Completion */}
          {pipelineStatus === "COMPLETED" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>36 Source-Traceable Questions Generated & Linked to Page Citations</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPipelineStatus("IDLE")}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Upload Another
                </button>
                <Link
                  href="/trainer/question-review"
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 font-bold text-white hover:bg-emerald-800 shadow-2xs"
                >
                  Proceed to Review Queue →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
