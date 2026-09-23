"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  BookOpen,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  Layers,
  Award,
  LineChart,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { getMyRecommendations, type CourseRecommendation } from "@/lib/api/courses";
import { HorizontalCompetencyBar } from "@/components/ui/HorizontalCompetencyBar";
import { SampleCatalogueBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  getMyDashboardStats,
  type EmployeeDashboardResponse,
  type EvaluatedCompetency,
} from "@/lib/api/competencies";

/* ─── helpers ─────────────────────────────────────── */

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function severityColor(s: string) {
  if (s === "CRITICAL") return "text-red-600 bg-red-50 ring-red-200";
  if (s === "HIGH") return "text-amber-700 bg-amber-50 ring-amber-200";
  return "text-blue-700 bg-blue-50 ring-blue-200";
}

/* ─── page ────────────────────────────────────────── */

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployeeDashboardResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [selectedGap, setSelectedGap] = useState<EvaluatedCompetency | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseRecommendation | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [dashRes, recRes] = await Promise.all([
          getMyDashboardStats(),
          getMyRecommendations({ limit: 4 }).catch(() => []),
        ]);
        if (dashRes.success && dashRes.data) setStats(dashRes.data);
        setRecommendations(recRes);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displayName = user?.firstName ?? "there";
  const designation = user?.profile?.designation ?? "Statistical Officer";
  const department = user?.profile?.department?.name ?? "National Statistical Office (NSO)";

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
        <p className="text-sm">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* ── header ── */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greet()}, {displayName} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{designation}</span>
            <span className="mx-2 text-gray-300">·</span>
            {department}
            <span className="mx-2 text-gray-300">·</span>
            <span className="font-mono text-[12px] text-gray-400">
              {user?.profile?.employeeCode ?? "MOSPI-SSS-8842"}
            </span>
          </p>
        </div>

        <Link
          href="/employee/assessments"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700"
        >
          <FileCheck2 className="h-4 w-4" />
          Start assessment
        </Link>
      </div>

      {/* error notice */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">Couldn't load some metrics</p>
            <p className="mt-0.5 text-xs text-amber-700">{error}</p>
          </div>
        </div>
      )}

      {/* ── stat cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <StatCard
          label="Overall competency"
          icon={<Award className="h-4 w-4 text-blue-500" />}
        >
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {stats?.overallScore ?? 57.4}
            <span className="text-lg text-gray-400">%</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-700"
              style={{ width: `${stats?.overallScore ?? 57.4}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">Role-weighted average</p>
        </StatCard>

        <StatCard
          label="Skill gaps"
          icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
        >
          <p className="mt-1 text-3xl font-bold text-red-500">
            {stats?.criticalGapsCount ?? 2}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            of {stats?.totalRequiredCompetencies ?? 7} competencies need work
          </p>
        </StatCard>

        <StatCard
          label="Benchmarks met"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        >
          <p className="mt-1 text-3xl font-bold text-emerald-600">
            {stats?.competenciesMeetingTarget ?? 2}
          </p>
          <p className="mt-2 text-xs text-gray-400">proficient areas</p>
        </StatCard>

        <StatCard
          label="Competencies assessed"
          icon={<Layers className="h-4 w-4 text-blue-400" />}
        >
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {stats
              ? stats.totalRequiredCompetencies - stats.unassessedCompetencies
              : 6}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            / {stats?.totalRequiredCompetencies ?? 7} required
          </p>
        </StatCard>

      </div>

      {/* ── main content ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* left — gaps + recommendations */}
        <div className="space-y-6 lg:col-span-2">

          {/* skill gaps */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Priority skill gaps
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Ranked by gap size, role weight and mandatory status.
                </p>
              </div>
              <Link
                href="/employee/skill-gaps"
                className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.topPriorityGaps?.map((gap, i) => (
                <div
                  key={gap.competencyId}
                  className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition hover:bg-gray-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{gap.name}</span>
                      <span className="font-mono text-[10px] text-gray-400">{gap.code}</span>
                      {gap.isMandatory && (
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold text-red-600 ring-1 ring-red-200">
                          MANDATORY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${severityColor(gap.severity)}`}>
                        {gap.severity.toLowerCase()}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">
                        {gap.currentScore !== null ? `${gap.currentScore}%` : "—"} / {gap.requiredScore}%
                      </span>
                    </div>
                  </div>

                  <HorizontalCompetencyBar
                    name={gap.name}
                    current={gap.currentScore ?? 0}
                    target={gap.requiredScore}
                    showLabels={false}
                    size="sm"
                  />

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="truncate text-[11px] text-gray-500">{gap.reason}</p>
                    <button
                      onClick={() => setSelectedGap(gap)}
                      className="shrink-0 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Why this? →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* recommendations */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900">
                    Recommended training
                  </h2>
                  <SampleCatalogueBadge />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  NSSTA &amp; iGOT modules matched to your skill gaps.
                </p>
              </div>
              <Link
                href="/employee/courses"
                className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                All courses →
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <div className="py-10 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  Complete an assessment to get personalised recommendations.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recommendations.slice(0, 2).map((rec) => (
                  <div
                    key={rec.courseId}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-blue-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-100">
                        {rec.providerName}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {Math.round(rec.recommendationScore * 100)}% match
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-gray-900 line-clamp-1">
                      {rec.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-gray-500 line-clamp-2">
                      {rec.reasons[0] ?? `Targets ${rec.competencyName}`}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                      <button
                        onClick={() => setSelectedCourse(rec)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Why recommended?
                      </button>
                      {rec.courseUrl ? (
                        <a
                          href={rec.courseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          Enrol →
                        </a>
                      ) : (
                        <Link href="/employee/courses" className="text-[11px] font-semibold text-blue-600 hover:underline">
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* right — context + history */}
        <div className="space-y-6">

          {/* cadre context */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Your role context</h2>

            <div className="rounded-xl bg-blue-50/60 p-4 ring-1 ring-blue-100">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-700">
                Current posting
              </p>
              <p className="mt-1.5 text-sm font-semibold text-gray-900">
                {user?.profile?.currentAssignment ?? "Consumer Price Index (CPI) Analytics Unit"}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                Benchmarks synced with the 2026 MoSPI Statistical Officer cadre directive.
              </p>
            </div>

            {/* recent history */}
            <div className="mt-5">
              <h3 className="mb-3 text-xs font-semibold text-gray-600">Recent changes</h3>
              <div className="space-y-2">
                {stats?.recentHistory?.length ? (
                  stats.recentHistory.map((h) => (
                    <div
                      key={h.id}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-[11px]"
                    >
                      <div className="flex items-center justify-between font-semibold text-gray-800">
                        <span>{h.competencyName}</span>
                        <span className="text-blue-700">
                          {h.previousScore}% → {h.newScore}%
                        </span>
                      </div>
                      <p className="mt-1 text-gray-400">
                        {h.changeReason ?? "Baseline profile assessment"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-[11px] text-gray-400">
                    No recent score changes — baseline active.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* quick links */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Quick access</h2>
            <div className="space-y-2">
              {[
                { label: "Take an assessment", href: "/employee/assessments", icon: FileCheck2 },
                { label: "My learning path", href: "/employee/learning-path", icon: BookOpen },
                { label: "Skill gap detail", href: "/employee/skill-gaps", icon: AlertTriangle },
                { label: "Progress report", href: "/employee/progress", icon: TrendingUp },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-sm text-gray-700 transition hover:border-gray-200 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-gray-400" />
                    {label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── gap explain modal ── */}
      {selectedGap && (
        <Modal
          isOpen={!!selectedGap}
          onClose={() => setSelectedGap(null)}
          title={`Why "${selectedGap.name}" is a priority`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="leading-relaxed text-gray-700">{selectedGap.reason}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-gray-400">Current score</p>
                <p className="mt-1.5 text-xl font-bold text-gray-900">
                  {selectedGap.currentScore !== null ? `${selectedGap.currentScore}%` : "None"}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-gray-400">Role benchmark</p>
                <p className="mt-1.5 text-xl font-bold text-blue-700">{selectedGap.requiredScore}%</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-gray-400">Gap</p>
                <p className="mt-1.5 text-xl font-bold text-red-500">−{selectedGap.gap} pts</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── course explain modal ── */}
      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={`Why "${selectedCourse.title}" is recommended`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{selectedCourse.providerName}</span>
                <span className="font-semibold text-emerald-600">
                  {Math.round(selectedCourse.recommendationScore * 100)}% match
                </span>
              </div>
              <p className="mt-2 leading-relaxed text-gray-600">
                {selectedCourse.reasons.join(" ") || `Targets competency: ${selectedCourse.competencyName}`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-gray-400">Gap addressed</p>
                <p className="mt-1.5 text-xl font-bold text-gray-900">{selectedCourse.skillGap} pts</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-3">
                <p className="text-gray-400">Difficulty</p>
                <p className="mt-1.5 text-xl font-bold text-blue-700">{selectedCourse.difficultyLevel}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

/* ── stat card wrapper ────────────────────────────── */

function StatCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        {icon}
      </div>
      {children}
    </div>
  );
}
