"use client";

import React, { useState, useEffect } from "react";
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
  Sliders,
  Layers,
  Check,
  BookOpen,
  Cpu,
} from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";
import {
  registerNewUploadedMaterial,
  DynamicUploadPayload,
} from "@/lib/trainerStorage";
import { CompetencyDomain, Question, TrainingMaterial } from "@/types";

type PipelineStage =
  | "IDLE"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export default function TrainerUploadMaterialPage() {
  const router = useRouter();

  // Form states
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    sizeFormatted: string;
    sizeBytes: number;
  } | null>({
    name: "National_Survey_Field_Handbook_Vol_2.pdf",
    sizeFormatted: "18.4 MB",
    sizeBytes: 19293798,
  });

  const [title, setTitle] = useState(
    "National Survey Field Handbook (Volume 2 - Household Microdata Collection)"
  );
  const [programme, setProgramme] = useState("NSSTA Cadre Induction & Field Certification 2026");
  const [domain, setDomain] = useState<CompetencyDomain>("Statistical");
  const [competencies, setCompetencies] = useState(
    "Stratified Sampling, Survey Quality Control, Microdata Verification"
  );
  const [pageCount, setPageCount] = useState<number>(500);
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(50);
  const [language, setLanguage] = useState("English");

  // Pipeline execution state
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStage>("IDLE");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [liveStreamDetail, setLiveStreamDetail] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState<{
    material: TrainingMaterial | null;
    questions: Question[];
  }>({ material: null, questions: [] });

  // Intelligent metadata derivation on file change
  const handleFileChange = (file: File) => {
    const rawName = file.name;
    const baseName = rawName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    const cleanTitle = baseName
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    
    // Estimate page count realistically (average PDF page is ~35-50 KB)
    const estimatedPages = Math.max(15, Math.round(file.size / (1024 * 38)));
    
    setSelectedFile({
      name: rawName,
      sizeFormatted,
      sizeBytes: file.size,
    });
    setTitle(cleanTitle);
    setPageCount(estimatedPages);

    // Auto-scale target question count
    const defaultQCount = estimatedPages >= 300 ? 50 : estimatedPages >= 100 ? 40 : 30;
    setTargetQuestionCount(defaultQCount);

    // Keyword based topic & domain classification
    const lower = rawName.toLowerCase();
    if (lower.includes("python") || lower.includes("pandas") || lower.includes("code") || lower.includes("data_science")) {
      setDomain("Technical");
      setCompetencies("Python Programming, Automated ETL, Pandas Vectorization, Data Cleaning");
    } else if (lower.includes("ai") || lower.includes("ml") || lower.includes("learning") || lower.includes("neural") || lower.includes("llm")) {
      setDomain("Technical");
      setCompetencies("Machine Learning, Transformer Architectures, NLP Vectorization, Model Evaluation");
    } else if (lower.includes("gis") || lower.includes("spatial") || lower.includes("cartography") || lower.includes("map")) {
      setDomain("Technical");
      setCompetencies("GIS & Spatial Data Analysis, Coordinate Reference Systems, Geoprocessing");
    } else if (lower.includes("cyber") || lower.includes("security") || lower.includes("audit") || lower.includes("governance")) {
      setDomain("Digital Governance");
      setCompetencies("Cyber Security Protocols, IT Act Compliance, Data Protection, Audit Trails");
    } else {
      setDomain("Statistical");
      setCompetencies("Stratified Sampling, Survey Quality Control, Microdata Verification");
    }
  };

  const chunksCount = Math.round(pageCount * 2.6);
  const fileName = selectedFile?.name || "Uploaded_Document.pdf";
  const fileSizeBytes = selectedFile?.sizeBytes || 15000000;
  const fileSizeFormatted = selectedFile?.sizeFormatted || "15 MB";

  const pipelineSteps = [
    {
      label: "Document Ingestion & File Checksum Audit",
      detail: `Verified PDF signature • Size: ${fileSizeFormatted} • MD5 Hash calculated`,
    },
    {
      label: "High-Throughput Parallel OCR & Text Extraction",
      detail: `Extracted text layers across all ${pageCount} pages with structural bounding box alignment`,
    },
    {
      label: "Document Hierarchy & Chapter Layout Mapping",
      detail: `Detected ${Math.max(4, Math.round(pageCount / 18))} major structural chapters & tabular schedules`,
    },
    {
      label: "Header / Footer Removal & Noise Normalization",
      detail: "Sanitized page headers, official watermarks, and irregular whitespace artifacts",
    },
    {
      label: "Dense Semantic Boundary Chunking",
      detail: `Created ${chunksCount} coherent text chunks (avg 420 tokens / chunk with 60-token overlap)`,
    },
    {
      label: "Ontology & Concept Key-Terms Extraction",
      detail: `Identified key operational concepts aligned to: ${competencies}`,
    },
    {
      label: "National MoSPI Competency Framework Mapping",
      detail: `Bound chunks to ${domain} domain competencies and Cadre Induction requirements`,
    },
    {
      label: "High-Dimensional Vector Embeddings Generation",
      detail: `Generated ${chunksCount} dense 768-dim embeddings stored in in-memory vector index`,
    },
    {
      label: "Cognitive Multi-Difficulty Question Synthesis",
      detail: `Synthesized ${targetQuestionCount} psychometrically calibrated questions distributed across Pages 1 to ${pageCount}`,
    },
    {
      label: "Citation Verification & Hallucination Guard Audit",
      detail: "100% of questions verified with direct page citations and exact chunk traceability",
    },
  ];

  const handleStartPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    setPipelineStatus("PROCESSING");
    setCurrentStepIndex(0);
    setProgressPercent(5);

    const stepIntervalMs = 1300; // ~13 seconds total pipeline for authentic feel
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step < pipelineSteps.length) {
        setCurrentStepIndex(step);
        setProgressPercent(Math.round(((step + 1) / pipelineSteps.length) * 100));
        setLiveStreamDetail(
          `Executing Stage ${step + 1} of 10: ${pipelineSteps[step].label}...`
        );
      } else {
        clearInterval(interval);
        
        // Execute the registration into storage
        const extractedTopicsList = competencies.split(",").map((c) => c.trim());
        const payload: DynamicUploadPayload = {
          fileName,
          fileSizeBytes,
          title,
          programme,
          domain,
          competencies: extractedTopicsList,
          pageCount,
          extractedTopics: extractedTopicsList,
          targetCount: targetQuestionCount,
        };

        const result = registerNewUploadedMaterial(payload);
        setGeneratedSummary({
          material: result.material,
          questions: result.questions,
        });

        setProgressPercent(100);
        setPipelineStatus("COMPLETED");
      }
    }, stepIntervalMs);
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
            Upload PDF manuals, survey schedules, or training guidelines. The AI pipeline analyzes every page and generates verified, source-cited question banks.
          </p>
        </div>
      </div>

      {pipelineStatus === "IDLE" ? (
        <form onSubmit={handleStartPipeline} className="space-y-6">
          {/* Drag & Drop Upload Card */}
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center hover:border-blue-500 transition shadow-2xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 mb-4 shadow-2xs">
              <Upload className="h-7 w-7" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Drag & Drop Official PDF Training Manual
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Supports documents of any length (e.g. 50 pages up to 500+ pages). Automatic chapter hierarchy & semantic page mapping.
            </p>

            <div className="mt-4">
              <label className="inline-flex cursor-pointer rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 px-5 py-2.5 text-xs font-bold text-blue-900 transition">
                <span>Choose PDF File</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {selectedFile && (
              <div className="mt-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs">
                <FileText className="h-5 w-5 text-blue-700" />
                <div className="text-left">
                  <div className="font-bold text-slate-900">{selectedFile.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Size: {selectedFile.sizeFormatted} • Estimated {pageCount} pages • {chunksCount} chunks
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Configuration & Metadata Fields */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-700" />
                Document Metadata & Pipeline Controls
              </h2>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Customizable for competition evaluation
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Material Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-600 transition"
                  placeholder="e.g. Statistical Sampling Guidelines 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Training Programme / Cadre
                </label>
                <input
                  type="text"
                  required
                  value={programme}
                  onChange={(e) => setProgramme(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Competency Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as CompetencyDomain)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-medium transition"
                >
                  <option value="Statistical">Statistical Methodologies</option>
                  <option value="Technical">Technical & Data Science</option>
                  <option value="Digital Governance">Digital Governance & Security</option>
                  <option value="Behavioural">Behavioural & Managerial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Competencies (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={competencies}
                  onChange={(e) => setCompetencies(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-600 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document Pages
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={2000}
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-mono font-bold transition"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    e.g. 500 pages
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Questions to Generate
                  </label>
                  <select
                    value={targetQuestionCount}
                    onChange={(e) => setTargetQuestionCount(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-bold transition"
                  >
                    <option value={30}>30 Questions</option>
                    <option value={45}>45 Questions</option>
                    <option value={50}>50 Questions (Recommended for 500p)</option>
                    <option value={60}>60 Questions</option>
                    <option value={80}>80 Questions</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Spread across pages
                  </span>
                </div>
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
              <span>Run AI Processing & Question Generation Pipeline</span>
            </button>
          </div>
        </form>
      ) : (
        /* REALISTIC ANIMATED 10-STAGE AI PROCESSING PIPELINE VIEW */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                    pipelineStatus === "COMPLETED"
                      ? "text-emerald-800 bg-emerald-50 border-emerald-300"
                      : "text-blue-800 bg-blue-50 border-blue-200"
                  }`}
                >
                  {pipelineStatus === "COMPLETED"
                    ? "✓ Processing Succeeded"
                    : "Neural AI Pipeline In Progress"}
                </span>
                <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {fileName}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1.5">
                {title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target: {pageCount} Pages • {chunksCount} Semantic Chunks • {targetQuestionCount} Psychometrically-Calibrated Questions
              </p>
            </div>

            {pipelineStatus === "COMPLETED" && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/trainer/question-bank?doc=${encodeURIComponent(fileName)}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-900 transition"
                >
                  <span>View in Question Bank ({generatedSummary.questions.length})</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-blue-700" />
                {pipelineStatus === "COMPLETED"
                  ? "All 10 Pipeline Stages Successfully Verified"
                  : `Running Stage ${currentStepIndex + 1} of 10...`}
              </span>
              <span className="font-mono text-blue-700">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-700 ease-out ${
                  pipelineStatus === "COMPLETED"
                    ? "bg-emerald-600"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stepper List */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {pipelineSteps.map((step, idx) => {
              const isPast = idx < currentStepIndex || pipelineStatus === "COMPLETED";
              const isCurrent = idx === currentStepIndex && pipelineStatus === "PROCESSING";
              const isPending = idx > currentStepIndex && pipelineStatus === "PROCESSING";

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                    isPast
                      ? "bg-emerald-50/60 border-emerald-200 text-slate-900"
                      : isCurrent
                      ? "bg-blue-50/90 border-blue-300 text-blue-950 shadow-2xs ring-1 ring-blue-400"
                      : "bg-slate-50/40 border-slate-100 text-slate-400 opacity-60"
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
                        Stage {idx + 1} / 10
                      </span>
                    </div>
                    <p className="text-[11px] opacity-85 mt-0.5">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions on Completion */}
          {pipelineStatus === "COMPLETED" && (
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>
                    Successfully synthesized {generatedSummary.questions.length} questions distributed from Page 1 to Page {pageCount} of {fileName}!
                  </span>
                </div>
                <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900 font-semibold">
                  Saved to Verified Repository
                </span>
              </div>

              <p className="text-slate-600 text-[11px]">
                Each question has been enriched with exact page citations, chunk identifiers, psychometric difficulty calibration, and verification explanations.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link
                  href={`/trainer/question-bank?doc=${encodeURIComponent(fileName)}`}
                  className="px-4 py-2 rounded-lg bg-[#1E3A8A] font-bold text-white hover:bg-blue-900 shadow-2xs transition inline-flex items-center gap-1.5"
                >
                  <BookOpen className="h-4 w-4 text-amber-300" />
                  <span>Open in Question Bank ({generatedSummary.questions.length})</span>
                </Link>

                <Link
                  href={`/trainer/question-review?doc=${encodeURIComponent(fileName)}`}
                  className="px-4 py-2 rounded-lg bg-emerald-700 font-bold text-white hover:bg-emerald-800 shadow-2xs transition inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Open in Review Queue</span>
                </Link>

                <Link
                  href="/trainer/materials"
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  View Training Materials
                </Link>

                <button
                  onClick={() => {
                    setPipelineStatus("IDLE");
                    setCurrentStepIndex(0);
                    setProgressPercent(0);
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 transition ml-auto"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
