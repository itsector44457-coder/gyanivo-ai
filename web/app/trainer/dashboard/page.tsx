"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Upload,
  FileCheck2,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  HelpCircle,
  BarChart3,
  Sliders,
} from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";
import {
  getStoredTrainerQuestions,
  getStoredTrainingMaterials,
} from "@/lib/trainerStorage";
import { Question, TrainingMaterial } from "@/types";

export default function TrainerDashboardPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);

  useEffect(() => {
    setQuestions(getStoredTrainerQuestions());
    setMaterials(getStoredTrainingMaterials());

    const handleQ = () => setQuestions(getStoredTrainerQuestions());
    const handleM = () => setMaterials(getStoredTrainingMaterials());

    window.addEventListener("gyanivo_questions_updated", handleQ);
    window.addEventListener("gyanivo_materials_updated", handleM);
    return () => {
      window.removeEventListener("gyanivo_questions_updated", handleQ);
      window.removeEventListener("gyanivo_materials_updated", handleM);
    };
  }, []);

  const pendingReviewCount = questions.filter(
    (q: Question) => q.status === "PENDING_REVIEW"
  ).length;

  const workflowSteps = [
    { num: 1, label: "Upload PDF Material", desc: "NSSTA & MoSPI official manuals" },
    { num: 2, label: "AI Chunking & Mapping", desc: "Topic & competency linking" },
    { num: 3, label: "Question Generation", desc: "Source-anchored MCQs" },
    { num: 4, label: "Human Review", desc: "Trainer verification & confidence check" },
    { num: 5, label: "Assessment Builder", desc: "Adaptive & diagnostic test design" },
    { num: 6, label: "Cadre Publication", desc: "Dispatched to officer dashboard" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Trainer Workspace
            </h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Dr. S. Rao • Master Trainer • National Statistical Systems Training Academy (NSSTA)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/trainer/materials/upload"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-900 transition"
          >
            <Upload className="h-4 w-4" />
            Upload Material
          </Link>
          <Link
            href="/trainer/assessment-builder"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <Sliders className="h-4 w-4 text-blue-700" />
            Create Assessment
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Training Materials</span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">14</p>
          <p className="text-[11px] text-slate-500 mt-1">540+ pages processed</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Questions Generated</span>
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-indigo-900 mt-3">384</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">94% average AI confidence</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Needs Review</span>
            <FileCheck2 className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600 mt-3">18</p>
          <Link
            href="/trainer/question-review"
            className="text-[11px] font-bold text-amber-800 hover:underline mt-1 inline-block"
          >
            Open Review Queue →
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Published Assessments</span>
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700 mt-3">12</p>
          <p className="text-[11px] text-slate-500 mt-1">Active across 5 divisions</p>
        </div>
      </div>

      {/* 6-Stage Workflow Visualization */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            AI Content-to-Assessment Pipeline
          </h2>
          <p className="text-xs text-slate-500">
            Source-traceable question generation and human-in-the-loop verification
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {workflowSteps.map((step) => (
            <div
              key={step.num}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 flex flex-col justify-between"
            >
              <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded w-max">
                Stage {step.num}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Materials & Review Queue Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Materials */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Recent Training Materials
            </h2>
            <Link
              href="/trainer/materials"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              View All ({materials.length}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {materials.slice(0, 3).map((mat: TrainingMaterial) => (
              <div key={mat.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {mat.fileName}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {mat.programme} • {mat.questionsGeneratedCount} questions generated
                  </p>
                </div>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 shrink-0">
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Review Questions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Questions Awaiting Verification
            </h2>
            <Link
              href="/trainer/question-review"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              Open Queue ({pendingReviewCount}) →
            </Link>
          </div>

          <div className="space-y-3">
            {questions
              .filter((q: Question) => q.status === "PENDING_REVIEW")
              .slice(0, 3)
              .map((q: Question) => (
                <div
                  key={q.id}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 space-y-2"
                >
                  <p className="text-xs font-bold text-slate-900 line-clamp-2">
                    {q.questionText}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono text-slate-700">{q.sourceDocument} (p. {q.sourcePage})</span>
                    <span className="text-emerald-700 font-bold">{Math.round(q.confidenceScore * 100)}% confidence</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
