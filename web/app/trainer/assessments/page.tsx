"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, XCircle, RefreshCw, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { getMyAssessments, type MyAssessmentsResponse } from "@/lib/api/assessments";

type CompletedAttempt = MyAssessmentsResponse["data"]["recentCompleted"][number];
type InProgressAttempt = MyAssessmentsResponse["data"]["inProgressAttempts"][number];
type AvailableDiag = MyAssessmentsResponse["data"]["availableDiagnostics"][number];

export default function TrainerAssessmentsPage() {
  const [data, setData] = useState<MyAssessmentsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyAssessments();
      setData(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading assessments…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <XCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-slate-600 font-medium">{error}</p>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#1E3A8A] text-white rounded-lg">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  const completed = data?.recentCompleted ?? [];
  const inProgress = data?.inProgressAttempts ?? [];
  const available = data?.availableDiagnostics ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cadre Assessments</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Live
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Diagnostic assessments for this officer — completed, in-progress, and available
          </p>
        </div>

        <Link
          href="/trainer/assessment-builder"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-900 transition"
        >
          <Plus className="h-4 w-4" />
          Create New Assessment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-2xl font-black text-emerald-700">{completed.length}</p>
          <p className="text-xs font-bold text-emerald-600 uppercase mt-1">Completed</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
          <p className="text-2xl font-black text-blue-700">{inProgress.length}</p>
          <p className="text-xs font-bold text-blue-600 uppercase mt-1">In Progress</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-2xl font-black text-slate-700">{available.length}</p>
          <p className="text-xs font-bold text-slate-600 uppercase mt-1">Available</p>
        </div>
      </div>

      {/* In-Progress */}
      {inProgress.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">In Progress</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {inProgress.map((a: InProgressAttempt) => (
              <div key={a.attemptId} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{a.competencyName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Question {a.currentQuestionIndex + 1} of {a.totalQuestions} · Difficulty: {a.currentDifficulty}
                  </p>
                </div>
                <Link
                  href={`/employee/assessments/${a.attemptId}`}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900"
                >
                  Continue →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Completed Assessments</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {completed.map((a: CompletedAttempt) => {
              const scoreChange = a.initialScore !== null ? a.finalScore - a.initialScore : null;
              return (
                <div key={a.attemptId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{a.competencyName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(a.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Final Score</span>
                    <span className="text-sm font-black text-slate-900">{a.finalScore.toFixed(0)}%</span>
                  </div>
                  {scoreChange !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Change</span>
                      <span className={`text-xs font-bold ${scoreChange >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {scoreChange >= 0 ? "+" : ""}{scoreChange.toFixed(0)} pts
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200">
                    <Link
                      href={`/employee/results/${a.attemptId}`}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900"
                    >
                      View Detailed Results →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available diagnostics */}
      {available.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Available Diagnostics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {available.map((a: AvailableDiag) => (
              <div key={a.competencyId} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{a.name}</p>
                  <p className="text-xs text-slate-500">{a.domain}</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current Score</span>
                  <span className="font-bold text-slate-700">
                    {a.currentScore !== null ? `${a.currentScore}%` : "Not assessed"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Required</span>
                  <span className="font-bold text-blue-700">{a.requiredScore}%</span>
                </div>
                {a.isMandatory && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    MANDATORY
                  </span>
                )}
                <Link
                  href="/employee/assessments"
                  className="block text-center text-xs font-bold text-white bg-[#1E3A8A] px-3 py-1.5 rounded-lg hover:bg-blue-900 transition"
                >
                  Start Diagnostic
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {completed.length === 0 && inProgress.length === 0 && available.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <FileSpreadsheet className="h-10 w-10 mb-3 text-slate-300" />
          <p className="font-semibold">No assessments found</p>
          <p className="text-xs mt-1">Complete your profile and role assignment to unlock diagnostics</p>
        </div>
      )}
    </div>
  );
}
