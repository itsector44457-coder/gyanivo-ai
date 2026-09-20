"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, BarChart3, XCircle } from "lucide-react";
import {
  getMyCompetencies,
  getMyDashboardStats,
  type EvaluatedCompetency,
} from "@/lib/api/competencies";
import { getMyAssessments, type MyAssessmentsResponse } from "@/lib/api/assessments";

// ── Status helpers ──────────────────────────────────────────────────────────

function statusLabel(status: string) {
  switch (status) {
    case "MEETS_REQUIREMENT":
    case "EXCEEDS_REQUIREMENT":
      return "Cleared";
    case "DEVELOPING":
      return "In Progress";
    case "NEEDS_IMPROVEMENT":
      return "Below Target";
    case "NOT_ASSESSED":
      return "Not Yet Assessed";
    default:
      return status;
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "MEETS_REQUIREMENT":
    case "EXCEEDS_REQUIREMENT":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "DEVELOPING":
      return "text-blue-700 bg-blue-50 border-blue-200";
    case "NEEDS_IMPROVEMENT":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "NOT_ASSESSED":
      return "text-slate-500 bg-slate-50 border-slate-200";
    default:
      return "text-slate-500 bg-slate-50 border-slate-200";
  }
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "MEETS_REQUIREMENT":
    case "EXCEEDS_REQUIREMENT":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "DEVELOPING":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "NEEDS_IMPROVEMENT":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    default:
      return <XCircle className="h-4 w-4 text-slate-400" />;
  }
}

// ── Competency Row ──────────────────────────────────────────────────────────

function CompetencyRow({ comp }: { comp: EvaluatedCompetency }) {
  const score = comp.currentScore ?? 0;
  const pct = Math.min(100, (score / comp.requiredScore) * 100);
  const assessed = comp.currentScore !== null;

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <StatusIcon status={comp.status} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{comp.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{comp.domainName} · {comp.code}</p>
          </div>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor(comp.status)}`}
        >
          {statusLabel(comp.status)}
        </span>
      </div>

      {/* Score bar */}
      <div className="mt-3 ml-7">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>
            {assessed
              ? `Score: ${score.toFixed(0)} / ${comp.requiredScore}`
              : "No score yet — assessment needed"}
          </span>
          {assessed && (
            <span className={comp.gap > 0 ? "text-amber-600 font-semibold" : "text-emerald-600 font-semibold"}>
              {comp.gap > 0 ? `Gap: -${comp.gap.toFixed(0)}` : "✓ Met"}
            </span>
          )}
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct >= 100
                ? "bg-emerald-500"
                : pct >= 60
                ? "bg-blue-500"
                : pct >= 30
                ? "bg-amber-500"
                : "bg-slate-300"
            }`}
            style={{ width: `${assessed ? pct : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function EmployeeProgressPage() {
  const [competencies, setCompetencies] = useState<EvaluatedCompetency[]>([]);
  const [dashboard, setDashboard] = useState<{
    overallScore: number;
    competenciesMeetingTarget: number;
    totalRequiredCompetencies: number;
    unassessedCompetencies: number;
    recentHistory: Array<{
      id: number;
      competencyName: string;
      previousScore: number;
      newScore: number;
      sourceType: string;
      createdAt: string;
    }>;
  } | null>(null);
  const [assessments, setAssessments] = useState<MyAssessmentsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [compRes, dashRes, asmRes] = await Promise.all([
          getMyCompetencies(),
          getMyDashboardStats(),
          getMyAssessments(),
        ]);
        setCompetencies(compRes.data.competencies);
        setDashboard(dashRes.data);
        setAssessments(asmRes.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load progress data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        Loading your progress...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">Could not load progress</p>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const met = dashboard?.competenciesMeetingTarget ?? 0;
  const total = dashboard?.totalRequiredCompetencies ?? 0;
  const unassessed = dashboard?.unassessedCompetencies ?? 0;
  const overallPct = dashboard?.overallScore ?? 0;
  const completedCount = assessments?.recentCompleted?.length ?? 0;
  const inProgressCount = assessments?.inProgressAttempts?.length ?? 0;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Progress</h1>
        <p className="text-xs text-slate-500 mt-1">
          Live data from your assessments — updates every time you complete an assessment
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Overall Score</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{overallPct.toFixed(0)}%</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-700 font-medium uppercase tracking-wide">Targets Met</span>
          </div>
          <p className="text-2xl font-black text-emerald-800">
            {met}<span className="text-sm font-bold text-emerald-600"> / {total}</span>
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs text-blue-700 font-medium uppercase tracking-wide">Assessments Done</span>
          </div>
          <p className="text-2xl font-black text-blue-800">{completedCount}</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-amber-700 font-medium uppercase tracking-wide">Not Yet Assessed</span>
          </div>
          <p className="text-2xl font-black text-amber-800">{unassessed}</p>
        </div>
      </div>

      {/* In-progress assessments (if any) */}
      {inProgressCount > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">
            🔄 {inProgressCount} assessment{inProgressCount > 1 ? "s" : ""} in progress
          </p>
          <div className="space-y-1">
            {assessments?.inProgressAttempts.map((a: MyAssessmentsResponse["data"]["inProgressAttempts"][number]) => (
              <p key={a.attemptId} className="text-xs text-blue-700">
                • {a.competencyName} — Question {a.currentQuestionIndex + 1} of {a.totalQuestions}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Competency-by-competency list */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Competency Breakdown</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Each row shows your current score vs. the required target for your role
          </p>
        </div>
        <div className="px-5">
          {competencies.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No competency data yet. Complete at least one assessment to see your progress here.
            </p>
          ) : (
            competencies.map((c) => <CompetencyRow key={c.competencyId} comp={c} />)
          )}
        </div>
      </div>

      {/* Recent score changes */}
      {(dashboard?.recentHistory?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Recent Score Changes</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {dashboard!.recentHistory.map((h) => {
              const diff = h.newScore - h.previousScore;
              const isUp = diff >= 0;
              return (
                <div key={h.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{h.competencyName}</p>
                    <p className="text-xs text-slate-400">
                      {h.sourceType} · {new Date(h.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                    {isUp ? "+" : ""}{diff.toFixed(0)} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
