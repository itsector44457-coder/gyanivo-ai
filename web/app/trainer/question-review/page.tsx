"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { SourceCitationBadge } from "@/components/ui/SourceCitationBadge";
import { Modal } from "@/components/ui/Modal";
import { Badge, PrototypeBadge } from "@/components/ui/Badge";
import { Question } from "@/types";
import {
  getStoredTrainerQuestions,
  saveStoredTrainerQuestions,
} from "@/lib/trainerStorage";

function QuestionReviewContent() {
  const searchParams = useSearchParams();
  const initialDocParam = searchParams.get("doc") || "All";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [documentFilter, setDocumentFilter] = useState<string>(initialDocParam);
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

  // Load from persistent storage
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

  // Sync URL search param
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

  const filteredQuestions = questions.filter((q) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending Review" && q.status === "PENDING_REVIEW") ||
      (statusFilter === "Approved" && q.status === "APPROVED") ||
      (statusFilter === "Rejected" && q.status === "REJECTED");

    const matchesDoc =
      documentFilter === "All" || q.sourceDocument === documentFilter;

    const matchesSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.competency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.sourceDocument.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesDoc && matchesSearch;
  });

  const persistQuestions = (updated: Question[]) => {
    setQuestions(updated);
    saveStoredTrainerQuestions(updated);
  };

  const handleApprove = (id: string) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, status: "APPROVED" as const } : q
    );
    persistQuestions(updated);
  };

  const handleReject = (id: string) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, status: "REJECTED" as const } : q
    );
    persistQuestions(updated);
  };

  const handleBulkApprove = () => {
    const selectedKeys = Object.keys(selectedQuestionIds).filter(
      (k) => selectedQuestionIds[k]
    );
    const updated = questions.map((q) =>
      selectedKeys.includes(q.id) ? { ...q, status: "APPROVED" as const } : q
    );
    persistQuestions(updated);
    setSelectedQuestionIds({});
  };

  const handleBulkReject = () => {
    const selectedKeys = Object.keys(selectedQuestionIds).filter(
      (k) => selectedQuestionIds[k]
    );
    const updated = questions.map((q) =>
      selectedKeys.includes(q.id) ? { ...q, status: "REJECTED" as const } : q
    );
    persistQuestions(updated);
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
    const updated = questions.map((q) =>
      q.id === editingQuestion.id
        ? {
            ...q,
            questionText: editForm.text,
            explanation: editForm.explanation,
            difficulty: editForm.difficulty,
            subCompetency: editForm.subCompetency,
            status: approve ? ("APPROVED" as const) : q.status,
          }
        : q
    );
    persistQuestions(updated);
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

      {/* Active Document Banner if filtered */}
      {documentFilter !== "All" && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-700 shrink-0" />
            <span>
              Reviewing questions from document: <strong className="text-blue-950 font-bold">{documentFilter}</strong> ({filteredQuestions.length} questions in queue)
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Document filter dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Document:</span>
            <select
              value={documentFilter}
              onChange={(e) => setDocumentFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:border-blue-600 font-medium max-w-[200px] truncate"
            >
              <option value="All">All Documents ({questions.length})</option>
              {availableDocuments.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            {["All", "Pending Review", "Approved", "Rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
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
        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <FileCheck2 className="h-8 w-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No questions found in this filter</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try switching your document or status filter to see all generated questions.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
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
                  <div className="flex flex-wrap items-center gap-3">
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
                    {q.subCompetency && (
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {q.subCompetency}
                      </span>
                    )}
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
                      {q.status === "PENDING_REVIEW" ? "Pending Review" : q.status}
                    </Badge>
                  </div>
                </div>

                {/* Question Stem */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {q.questionText}
                </h3>

                {/* Multiple Choice Options */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const isCorrect =
                        opt.id === q.correctOptionId ||
                        (opt.label === "A" && !q.correctOptionId?.includes("-"));

                      return (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                            isCorrect
                              ? "border-emerald-300 bg-emerald-50/80 font-semibold text-emerald-950"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span
                            className={`font-mono text-xs px-1.5 py-0.5 rounded font-bold ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrect && (
                            <span className="text-[10px] text-emerald-700 font-bold bg-white px-1.5 py-0.2 rounded border border-emerald-300 shrink-0">
                              Correct Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* AI Explanation & Source Snippet */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <BookmarkCheck className="h-3.5 w-3.5 text-blue-700" />
                    Official Rationale & Source Reference:
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {q.explanation}
                  </p>
                </div>

                {/* Citation & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <SourceCitationBadge
                      document={q.sourceDocument}
                      page={q.sourcePage}
                      chunkId={q.sourceChunkId}
                    />
                    <button
                      onClick={() => setViewingSourceQuestion(q)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline ml-1"
                    >
                      View Source Chunk
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(q)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    {q.status !== "APPROVED" && (
                      <button
                        onClick={() => handleApprove(q.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-2xs transition"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    )}

                    {q.status !== "REJECTED" && (
                      <button
                        onClick={() => handleReject(q.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100 transition"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EDIT QUESTION MODAL */}
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
              <span>Target Competency: <strong>{viewingSourceQuestion.competency}</strong></span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function TrainerQuestionReviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Review Queue...</div>}>
      <QuestionReviewContent />
    </Suspense>
  );
}
