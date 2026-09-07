"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Award,
  AlertCircle,
  Loader2,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  getMyAssessments,
  startDiagnosticAssessment,
  MyAssessmentsResponse,
} from "@/lib/api/assessments";

export default function EmployeeAssessmentsPage() {
  const router = useRouter();
  const [data, setData] = useState<MyAssessmentsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"available" | "in_progress" | "completed">("available");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getMyAssessments();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load assessment center");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStartDiagnostic = async (competencyId: number) => {
    try {
      setStartingId(competencyId);
      setError(null);
      const res = await startDiagnosticAssessment(competencyId);
      if (res.success && res.data?.attemptId) {
        router.push(`/employee/assessments/${res.data.attemptId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize diagnostic session");
      setStartingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading MoSPI diagnostic assessments from database...</p>
      </div>
    );
  }

  const availableCount = data?.availableDiagnostics?.length || 0;
  const inProgressCount = data?.inProgressAttempts?.length || 0;
  const completedCount = data?.recentCompleted?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Assessment Center
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              ADAPTIVE ENGINE READY
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Real-time Bayesian Knowledge Tracing (BKT) diagnostic evaluations and adaptive difficulty calibration
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Assessment Error</p>
            <p className="opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("available")}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === "available"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Available Diagnostics</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
            {availableCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("in_progress")}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === "in_progress"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Active Sessions</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
            {inProgressCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === "completed"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <span>Completed Evaluations</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
            {completedCount}
          </span>
        </button>
      </div>

      {/* Available Diagnostics Tab */}
      {activeTab === "available" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.availableDiagnostics.map((diag) => (
            <div
              key={diag.competencyId}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {diag.domain}
                  </span>
                  {diag.needsAssessment ? (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-purple-600" /> NEEDS ASSESSMENT
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Current: {diag.currentScore}%
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 line-clamp-1">{diag.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{diag.code}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Role Target Benchmark:</span>
                    <strong className="text-blue-900">{diag.requiredScore}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Calculated Gap:</span>
                    <strong className={diag.gap > 0 ? "text-rose-600" : "text-emerald-600"}>
                      {diag.gap > 0 ? `-${diag.gap} pts` : "Target Met"}
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span>Adaptive Format:</span>
                    <span>10 MCQs • BKT Powered</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleStartDiagnostic(diag.competencyId)}
                  disabled={startingId === diag.competencyId}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-900 transition disabled:opacity-50"
                >
                  {startingId === diag.competencyId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : diag.activeAttemptId ? (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Resume Diagnostic
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white" />
                      Start Adaptive Diagnostic
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Sessions Tab */}
      {activeTab === "in_progress" && (
        <div className="space-y-4">
          {data?.inProgressAttempts.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-400">
              No active diagnostic sessions in progress. Start a new assessment above.
            </div>
          ) : (
            data?.inProgressAttempts.map((att) => (
              <div
                key={att.attemptId}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{att.competencyName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      IN PROGRESS
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Question {att.currentQuestionIndex + 1} of {att.totalQuestions} • Current Difficulty: {att.currentDifficulty}
                  </p>
                </div>

                <Link
                  href={`/employee/assessments/${att.attemptId}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition"
                >
                  Resume <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* Completed Tab */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          {data?.recentCompleted.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-400">
              No completed assessment records yet. Take a diagnostic assessment to establish verified competency scores.
            </div>
          ) : (
            data?.recentCompleted.map((comp) => (
              <div
                key={comp.attemptId}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{comp.competencyName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Calibrated Score: <strong className="text-blue-900">{comp.finalScore}%</strong> • Accuracy: {comp.rawScore}% • Completed {new Date(comp.completedAt).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  href={`/employee/results/${comp.attemptId}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  View Verified Report <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
