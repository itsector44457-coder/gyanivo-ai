"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Edit3,
  Filter,
  Search,
  Sparkles,
  FileText,
  BookmarkCheck,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { DEMO_REVIEW_QUESTIONS } from "@/data/demo";
import { SourceCitationBadge } from "@/components/ui/SourceCitationBadge";
import { Modal } from "@/components/ui/Modal";
import { Badge, PrototypeBadge } from "@/components/ui/Badge";
import { Question } from "@/types";

export default function TrainerQuestionReviewPage() {
  const [questions, setQuestions] = useState<Question[]>(DEMO_REVIEW_QUESTIONS);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Record<string, boolean>>({});

  // Question Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editForm, setEditForm] = useState<{
    text: string;
    explanation: string;
    difficulty: "Easy" | "Medium" | "Hard";
    subCompetency: string;
  }>({
    text: "",
    explanation: "",
    difficulty: "Medium",
    subCompetency: "",
  });

  // Source Viewer Modal
  const [viewingSourceQuestion, setViewingSourceQuestion] = useState<Question | null>(null);

  const filteredQuestions = questions.filter((q) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending Review" && q.status === "PENDING_REVIEW") ||
      (statusFilter === "Approved" && q.status === "APPROVED") ||
      (statusFilter === "Rejected" && q.status === "REJECTED");

    const matchesSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.competency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.sourceDocument.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleApprove = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "APPROVED" } : q))
    );
  };

  const handleReject = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "REJECTED" } : q))
    );
  };

  const handleBulkApprove = () => {
    const selectedKeys = Object.keys(selectedQuestionIds).filter(
      (k) => selectedQuestionIds[k]
    );
    setQuestions((prev) =>
      prev.map((q) =>
        selectedKeys.includes(q.id) ? { ...q, status: "APPROVED" } : q
      )
    );
    setSelectedQuestionIds({});
  };

  const handleBulkReject = () => {
    const selectedKeys = Object.keys(selectedQuestionIds).filter(
      (k) => selectedQuestionIds[k]
    );
    setQuestions((prev) =>
      prev.map((q) =>
        selectedKeys.includes(q.id) ? { ...q, status: "REJECTED" } : q
      )
    );
    setSelectedQuestionIds({});
  };

  const handleToggleSelectAll = () => {
    if (Object.keys(selectedQuestionIds).length === filteredQuestions.length) {
      setSelectedQuestionIds({});
    } else {
      const all: Record<string, boolean> = {};
      filteredQuestions.forEach((q) => {
        all[q.id] = true;
      });
      setSelectedQuestionIds(all);
    }
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setEditForm({
      text: q.questionText,
      explanation: q.explanation,
      difficulty: q.difficulty,
      subCompetency: q.subCompetency || "",
    });
  };

  const handleSaveEdit = (approve = false) => {
    if (!editingQuestion) return;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              questionText: editForm.text,
              explanation: editForm.explanation,
              difficulty: editForm.difficulty,
              subCompetency: editForm.subCompetency,
              status: approve ? "APPROVED" : q.status,
            }
          : q
      )
    );
    setEditingQuestion(null);
  };

  const pendingCount = questions.filter((q) => q.status === "PENDING_REVIEW").length;
  const selectedCount = Object.values(selectedQuestionIds).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Human-in-the-Loop Question Verification Queue
            </h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Review and certify AI-generated questions derived from official NSSTA and MoSPI documents
          </p>
        </div>

        {/* Bulk Action Controls */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs">
            <span>{selectedCount} Selected</span>
            <button
              onClick={handleBulkApprove}
              className="bg-emerald-600 hover:bg-emerald-500 font-bold px-2.5 py-1 rounded"
            >
              Approve All
            </button>
            <button
              onClick={handleBulkReject}
              className="bg-rose-600 hover:bg-rose-500 font-bold px-2.5 py-1 rounded"
            >
              Reject All
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search question text, source, competency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "Pending Review", "Approved", "Rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                statusFilter === s
                  ? "bg-[#1E3A8A] text-white font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s} {s === "Pending Review" && `(${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Select All Checkbox Row */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={
              selectedCount > 0 && selectedCount === filteredQuestions.length
            }
            onChange={handleToggleSelectAll}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Select All Filtered ({filteredQuestions.length})
        </label>
        <span>
          Showing {filteredQuestions.length} AI Question Candidates
        </span>
      </div>

      {/* Questions Review Cards */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isSelected = !!selectedQuestionIds[q.id];

          return (
            <div
              key={q.id}
              className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-2xs space-y-4 transition ${
                q.status === "APPROVED"
                  ? "border-emerald-200 bg-emerald-50/20"
                  : q.status === "REJECTED"
                  ? "border-rose-200 bg-rose-50/20 opacity-70"
                  : "border-amber-200 bg-amber-50/10"
              }`}
            >
              {/* Top Row: Checkbox, Competency, Difficulty, Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      setSelectedQuestionIds((prev) => ({
                        ...prev,
                        [q.id]: e.target.checked,
                      }))
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-bold text-xs text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                    {q.competency}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Difficulty: <strong className="text-slate-800">{q.difficulty}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      q.status === "APPROVED"
                        ? "success"
                        : q.status === "REJECTED"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {q.status === "PENDING_REVIEW"
                      ? "Pending Review"
                      : q.status === "APPROVED"
                      ? "Approved & Verified"
                      : "Rejected"}
                  </Badge>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {q.questionText}
              </h2>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt) => {
                  const isCorrect = opt.id === q.correctOptionId;
                  return (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-semibold"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold ${
                          isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-slate-600 border border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span className="mt-0.5 leading-relaxed">{opt.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation & Source Verification Strip */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span>Official Explanation:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{q.explanation}</p>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <SourceCitationBadge
                    document={q.sourceDocument}
                    page={q.sourcePage}
                    chunkId={q.sourceChunkId}
                    confidence={q.confidenceScore}
                    onClick={() => setViewingSourceQuestion(q)}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingSourceQuestion(q)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      View Extracted Source Chunk
                    </button>
                  </div>
                </div>
              </div>

              {/* Trainer Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(q)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                  Edit Question
                </button>

                <button
                  onClick={() => handleReject(q.id)}
                  disabled={q.status === "REJECTED"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </button>

                <button
                  onClick={() => handleApprove(q.id)}
                  disabled={q.status === "APPROVED"}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50 transition shadow-2xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve & Certify
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUESTION EDIT MODAL */}
      <Modal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        title="Edit Question & Official Rationale"
        subtitle={`Editing ID: ${editingQuestion?.id} • Linked to ${editingQuestion?.sourceDocument}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setEditingQuestion(null)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveEdit(false)}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg"
            >
              Save Changes
            </button>
            <button
              onClick={() => handleSaveEdit(true)}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs"
            >
              Save & Approve
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Question Text</label>
            <textarea
              rows={3}
              value={editForm.text}
              onChange={(e) => setEditForm((prev) => ({ ...prev, text: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
              <select
                value={editForm.difficulty}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    difficulty: e.target.value as "Easy" | "Medium" | "Hard",
                  }))
                }
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sub-Competency Tag</label>
              <input
                type="text"
                value={editForm.subCompetency}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, subCompetency: e.target.value }))
                }
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Explanation & Citation</label>
            <textarea
              rows={3}
              value={editForm.explanation}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, explanation: e.target.value }))
              }
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600"
            />
          </div>
        </div>
      </Modal>

      {/* SOURCE CHUNK VIEWER MODAL */}
      <Modal
        isOpen={!!viewingSourceQuestion}
        onClose={() => setViewingSourceQuestion(null)}
        title={`Source Verification: ${viewingSourceQuestion?.sourceDocument}`}
        subtitle={`Page ${viewingSourceQuestion?.sourcePage} • Semantic Chunk: ${viewingSourceQuestion?.sourceChunkId}`}
      >
        {viewingSourceQuestion && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FileText className="h-4 w-4 text-blue-600" />
                Raw Extracted PDF Paragraph:
              </div>
              <p className="font-mono text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                &ldquo;{viewingSourceQuestion.sourceSnippet}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Confidence Score: <strong>{Math.round(viewingSourceQuestion.confidenceScore * 100)}%</strong></span>
              <span>Chunk Word Count: <strong>68 words</strong></span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
