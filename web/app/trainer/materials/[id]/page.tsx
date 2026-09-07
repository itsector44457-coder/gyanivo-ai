"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Sparkles, CheckCircle2, BookOpen, Layers } from "lucide-react";
import { DEMO_TRAINING_MATERIALS } from "@/data/demo";
import { PrototypeBadge } from "@/components/ui/Badge";

export default function TrainerMaterialDetailPage() {
  const params = useParams();
  const materialId = (params?.id as string) || "mat-gis-01";
  const material =
    DEMO_TRAINING_MATERIALS.find((m) => m.id === materialId) ||
    DEMO_TRAINING_MATERIALS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <Link
          href="/trainer/materials"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Materials
        </Link>
        <PrototypeBadge />
      </div>

      {/* Main Material Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {material.programme}
          </span>
          <h1 className="text-xl font-bold text-slate-900 leading-snug">
            {material.title}
          </h1>
          <p className="text-xs font-mono text-slate-500 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            <span>{material.fileName}</span>
            <span>•</span>
            <span>{(material.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
            <span>•</span>
            <span>Uploaded: {material.uploadedAt}</span>
          </p>
        </div>

        {/* Extracted Topics */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            AI Extracted Syllabus & Key Concepts:
          </h3>
          <div className="flex flex-wrap gap-2">
            {material.extractedTopics.map((topic, i) => (
              <span
                key={i}
                className="bg-white px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Pages</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{material.pageCount}</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Semantic Chunks</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{material.chunksCount}</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] uppercase font-bold text-slate-400">Questions Generated</span>
            <p className="text-xl font-black text-blue-900 mt-0.5">{material.questionsGeneratedCount}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Link
            href="/trainer/question-review"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-xs font-bold text-white shadow-md hover:bg-blue-900 transition"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            Review Generated Questions ({material.questionsGeneratedCount})
          </Link>
        </div>
      </div>
    </div>
  );
}
