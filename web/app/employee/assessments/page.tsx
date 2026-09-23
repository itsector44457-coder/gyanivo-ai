"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCheck2, Clock, ArrowRight, CheckCircle2, AlertCircle,
  Loader2, Play, RotateCcw, Zap,
} from "lucide-react";
import { getMyAssessments, startDiagnosticAssessment, type MyAssessmentsResponse } from "@/lib/api/assessments";

type Tab = "available" | "in_progress" | "completed";

export default function EmployeeAssessmentsPage() {
  const router = useRouter();
  const [data, setData] = useState<MyAssessmentsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("available");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getMyAssessments();
        if (res.success && res.data) setData(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load assessments");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStart = async (competencyId: number) => {
    try {
      setStartingId(competencyId);
      setError(null);
      const res = await startDiagnosticAssessment(competencyId);
      if (res.success && res.data?.attemptId) router.push(`/employee/assessments/${res.data.attemptId}`);
    } catch (err: any) {
      setError(err.message || "Failed to start assessment");
      setStartingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <p className="text-sm">Loading assessments…</p>
      </div>
    );
  }

  const counts = { available: data?.availableDiagnostics?.length ?? 0, in_progress: data?.inProgressAttempts?.length ?? 0, completed: data?.recentCompleted?.length ?? 0 };
  const tabs: { key: Tab; label: string }[] = [
    { key: "available",   label: "Available" },
    { key: "in_progress", label: "In progress" },
    { key: "completed",   label: "Completed" },
  ];

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="border-b border-gray-200 pb-5 dark:border-gray-800">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Assessments</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Adaptive diagnostics that measure where you actually stand against your role benchmarks.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p>{error}</p>
        </div>
      )}

      {/* tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 border-b-2 px-4 pb-3 pt-1 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-200"
            }`}
          >
            {t.label}
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              tab === t.key
                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
            }`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* available */}
      {tab === "available" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.availableDiagnostics ?? []).map((diag) => (
            <div key={diag.competencyId} className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    {diag.domain}
                  </span>
                  {diag.needsAssessment ? (
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      <Zap className="h-3 w-3" /> Not yet assessed
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 dark:text-gray-600">Current: {diag.currentScore}%</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-snug text-gray-900 line-clamp-2 dark:text-white">{diag.name}</h3>
                  <p className="mt-0.5 font-mono text-[11px] text-gray-400 dark:text-gray-600">{diag.code}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-[12px] text-gray-600 space-y-1.5 dark:bg-gray-800 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Role target</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{diag.requiredScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gap</span>
                    <span className={`font-semibold ${diag.gap > 0 ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {diag.gap > 0 ? `−${diag.gap} pts` : "On target"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1.5 text-[11px] text-gray-400 dark:border-gray-700 dark:text-gray-600">
                    <span>Format</span><span>10 questions · adaptive</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button onClick={() => handleStart(diag.competencyId)} disabled={startingId === diag.competencyId}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {startingId === diag.competencyId ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</>
                    : diag.activeAttemptId ? <><RotateCcw className="h-4 w-4" /> Resume</>
                    : <><Play className="h-4 w-4 fill-white" /> Start assessment</>}
                </button>
              </div>
            </div>
          ))}
          {counts.available === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-gray-200 py-14 text-center dark:border-gray-800">
              <FileCheck2 className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">No assessments available right now.</p>
            </div>
          )}
        </div>
      )}

      {/* in progress */}
      {tab === "in_progress" && (
        <div className="space-y-3">
          {(data?.inProgressAttempts ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center dark:border-gray-800">
              <Clock className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">No assessments in progress.</p>
            </div>
          ) : data?.inProgressAttempts.map((att) => (
            <div key={att.attemptId} className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{att.competencyName}</h3>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">In progress</span>
                </div>
                <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
                  Question {att.currentQuestionIndex + 1} of {att.totalQuestions} · difficulty: {att.currentDifficulty}
                </p>
              </div>
              <Link href={`/employee/assessments/${att.attemptId}`}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Resume <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* completed */}
      {tab === "completed" && (
        <div className="space-y-3">
          {(data?.recentCompleted ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center dark:border-gray-800">
              <CheckCircle2 className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">No completed assessments yet.</p>
            </div>
          ) : data?.recentCompleted.map((comp) => (
            <div key={comp.attemptId} className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{comp.competencyName}</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Done</span>
                </div>
                <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
                  Score: <span className="font-semibold text-gray-800 dark:text-gray-200">{comp.finalScore}%</span>
                  {" · "}Accuracy: {comp.rawScore}%
                  {" · "}{new Date(comp.completedAt).toLocaleDateString()}
                </p>
              </div>
              <Link href={`/employee/results/${comp.attemptId}`}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                View report <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
