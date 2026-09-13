"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  FileCheck2,
  Clock,
  Award,
} from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { getStoredTrainerQuestions } from "@/lib/trainerStorage";
import { Question } from "@/types";

export default function TrainerAssessmentBuilderPage() {
  const router = useRouter();

  // Form
  const [name, setName] = useState("GIS Post Training Assessment");
  const [competency, setCompetency] = useState("GIS & Spatial Data Analysis");
  const [type, setType] = useState<"Diagnostic" | "Adaptive" | "Post-Training" | "Benchmark">("Post-Training");
  const [initialDiff, setInitialDiff] = useState("Medium");
  const [timeLimit, setTimeLimit] = useState(15);
  const [attempts, setAttempts] = useState(2);
  const [passPercentage, setPassPercentage] = useState(60);

  // Bank questions
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  // Selected questions from question bank
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [showAddFromBankModal, setShowAddFromBankModal] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const qList = getStoredTrainerQuestions();
    setBankQuestions(qList);
    setSelectedQuestions(qList.slice(0, 4));
  }, []);

  const handleRemoveQuestion = (id: string) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublished(true);
    setTimeout(() => {
      alert("Assessment successfully published and assigned to NSO Cadre! (Demo Action)");
      router.push("/trainer/assessments");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Assessment Builder
            </h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Construct adaptive evaluations from certified question banks and syllabus documents
          </p>
        </div>
      </div>

      <form onSubmit={handlePublish} className="space-y-6">
        {/* Basic Configuration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Assessment Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assessment Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Competency</label>
              <select
                value={competency}
                onChange={(e) => setCompetency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              >
                <option>GIS & Spatial Data Analysis</option>
                <option>Python for Data Analysis</option>
                <option>Statistics & Official Metrics</option>
                <option>SQL & Relational Databases</option>
                <option>Data Privacy & Statistical Security</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assessment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              >
                <option>Post-Training</option>
                <option>Adaptive</option>
                <option>Diagnostic</option>
                <option>Benchmark</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Difficulty</label>
              <select
                value={initialDiff}
                onChange={(e) => setInitialDiff(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Time Limit (Minutes)</label>
              <input
                type="number"
                min={5}
                max={120}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Attempts Allowed</label>
              <input
                type="number"
                min={1}
                max={5}
                value={attempts}
                onChange={(e) => setAttempts(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              />
            </div>
          </div>
        </div>

        {/* Selected Questions Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Selected Questions ({selectedQuestions.length})
              </h2>
              <p className="text-xs text-slate-500">
                Source-anchored items included in this evaluation
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddFromBankModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add from Question Bank
            </button>
          </div>

          <div className="space-y-3">
            {selectedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      Q{idx + 1}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Difficulty: {q.difficulty}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {q.sourceDocument} (p. {q.sourcePage})
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 leading-snug">{q.questionText}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(q.id)}
                  aria-label="Remove question"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => alert("Draft saved locally (Prototype action).")}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Save Draft
          </button>

          <div className="flex items-center gap-3">
            <Link
              href="/employee/assessments/gis-diag-01"
              target="_blank"
              className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
            >
              Preview Player
            </Link>

            <button
              type="submit"
              disabled={isPublished}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E3A8A] text-xs font-bold text-white shadow-md hover:bg-blue-900 transition disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {isPublished ? "Publishing..." : "Publish Assessment"}
            </button>
          </div>
        </div>
      </form>

      {/* ADD FROM BANK MODAL */}
      <Modal
        isOpen={showAddFromBankModal}
        onClose={() => setShowAddFromBankModal(false)}
        title="Add Questions from Certified Question Bank"
        subtitle="Select certified items from official training documents"
      >
        <div className="space-y-3 text-xs">
          {bankQuestions.map((q) => (
            <div
              key={q.id}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between gap-2"
            >
              <div className="space-y-1">
                <span className="font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {q.competency} ({q.difficulty})
                </span>
                <p className="font-semibold text-slate-900">{q.questionText}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!selectedQuestions.some((sq) => sq.id === q.id)) {
                    setSelectedQuestions((prev) => [...prev, q]);
                  }
                  setShowAddFromBankModal(false);
                }}
                className="shrink-0 px-2.5 py-1 rounded bg-blue-700 font-bold text-white hover:bg-blue-800"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
