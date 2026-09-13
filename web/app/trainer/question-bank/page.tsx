"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  BookmarkCheck,
  Edit,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Badge, PrototypeBadge } from "@/components/ui/Badge";
import { SourceCitationBadge } from "@/components/ui/SourceCitationBadge";
import { getStoredTrainerQuestions } from "@/lib/trainerStorage";
import { Question } from "@/types";

function QuestionBankContent() {
  const searchParams = useSearchParams();
  const initialDocParam = searchParams.get("doc") || "All";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [documentFilter, setDocumentFilter] = useState<string>(initialDocParam);

  // Load questions on mount & sync with localStorage updates
  useEffect(() => {
    setQuestions(getStoredTrainerQuestions());

    const handleUpdate = () => {
      setQuestions(getStoredTrainerQuestions());
    };

    window.addEventListener("gyanivo_questions_updated", handleUpdate);
    return () => {
      window.removeEventListener("gyanivo_questions_updated", handleUpdate);
    };
  }, []);

  // If URL parameter changes, update filter
  useEffect(() => {
    const doc = searchParams.get("doc");
    if (doc) {
      setDocumentFilter(doc);
    }
  }, [searchParams]);

  // Extract unique document names
  const availableDocuments = Array.from(
    new Set(questions.map((q) => q.sourceDocument).filter(Boolean))
  );

  const filtered = questions.filter((q) => {
    const matchesDiff =
      difficultyFilter === "All" || q.difficulty === difficultyFilter;
    const matchesDoc =
      documentFilter === "All" || q.sourceDocument === documentFilter;
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.competency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.sourceDocument.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDiff && matchesDoc && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Verified Question Bank
            </h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Certified MoSPI question repository with citation linkages, source page mapping, and difficulty metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/trainer/materials/upload"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            Upload PDF & Generate
          </Link>
          <Link
            href="/trainer/assessment-builder"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-900 transition"
          >
            <Plus className="h-4 w-4" />
            Assemble Assessment
          </Link>
        </div>
      </div>

      {/* Active Document Banner if filtered */}
      {documentFilter !== "All" && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-700 shrink-0" />
            <span>
              Filtering by document: <strong className="text-blue-950 font-bold">{documentFilter}</strong> ({filtered.length} questions mapped)
            </span>
          </div>
          <button
            onClick={() => setDocumentFilter("All")}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
          >
            Show All Documents ({questions.length})
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search question text, competency, page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Document Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Document:</span>
            <select
              value={documentFilter}
              onChange={(e) => setDocumentFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium max-w-[220px] truncate"
            >
              <option value="All">All Documents ({questions.length})</option>
              {availableDocuments.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty filter buttons */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Difficulty:
            </span>
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                  difficultyFilter === d
                    ? "bg-[#1E3A8A] text-white font-bold shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Counter Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>Showing {filtered.length} of {questions.length} total verified questions</span>
        {documentFilter !== "All" && (
          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Source: {documentFilter}
          </span>
        )}
      </div>

      {/* Question Bank Items */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <HelpCircle className="h-8 w-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No questions found matching criteria</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, difficulty filters, or select "All Documents".
            </p>
          </div>
        ) : (
          filtered.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:border-blue-300 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-xs text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {q.competency}
                  </span>
                  {q.subCompetency && (
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {q.subCompetency}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-500">
                    Difficulty: <strong className="text-slate-800">{q.difficulty}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Used in {q.usageCount} evaluations
                  </span>
                </div>

                <Badge variant={q.status === "APPROVED" ? "success" : "warning"}>
                  {q.status}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {q.questionText}
              </h3>

              {/* Options display */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt) => {
                    const isCorrect = opt.id === q.correctOptionId || opt.label === "A" && !q.correctOptionId?.includes("-");
                    return (
                      <div
                        key={opt.id}
                        className={`px-3 py-1.5 rounded-lg text-xs flex items-start gap-2 border ${
                          isCorrect
                            ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium"
                            : "bg-slate-50/70 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span className="font-bold shrink-0">{opt.label}.</span>
                        <span className="flex-1">{opt.text}</span>
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-white px-1.5 py-0.2 rounded border border-emerald-300 shrink-0">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Source citation badge */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <SourceCitationBadge
                  document={q.sourceDocument}
                  page={q.sourcePage}
                  chunkId={q.sourceChunkId}
                />
                <span className="text-slate-500 text-[11px]">
                  Verification Confidence: <strong className="text-emerald-700">{Math.round(q.confidenceScore * 100)}%</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function TrainerQuestionBankPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Question Bank...</div>}>
      <QuestionBankContent />
    </Suspense>
  );
}
