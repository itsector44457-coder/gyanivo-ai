"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { DEMO_REVIEW_QUESTIONS } from "@/data/demo";
import { Badge, PrototypeBadge } from "@/components/ui/Badge";
import { SourceCitationBadge } from "@/components/ui/SourceCitationBadge";

export default function TrainerQuestionBankPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const filtered = DEMO_REVIEW_QUESTIONS.filter((q) => {
    const matchesDiff =
      difficultyFilter === "All" || q.difficulty === difficultyFilter;
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.competency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.sourceDocument.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDiff && matchesSearch;
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
            Certified MoSPI question repository with citation linkages and psychometric difficulty metrics
          </p>
        </div>

        <Link
          href="/trainer/assessment-builder"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-900 transition"
        >
          <Plus className="h-4 w-4" />
          Assemble Assessment
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search question text or competency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Difficulty:
          </span>
          {["All", "Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
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

      {/* Question Bank Items */}
      <div className="space-y-3">
        {filtered.map((q) => (
          <div
            key={q.id}
            className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:border-blue-300 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {q.competency}
                </span>
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

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <SourceCitationBadge
                document={q.sourceDocument}
                page={q.sourcePage}
                chunkId={q.sourceChunkId}
              />
              <span className="text-slate-500 text-[11px]">
                Confidence: <strong className="text-emerald-700">{Math.round(q.confidenceScore * 100)}%</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
