"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  AlertTriangle,
  BookOpen,
  FileCheck2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { DEMO_COURSES, DEMO_ASSESSMENTS } from "@/data/demo";
import { HorizontalCompetencyBar } from "@/components/ui/HorizontalCompetencyBar";
import { Badge, PrototypeBadge, SampleCatalogueBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth/AuthContext";
import { getMyDashboardStats, EmployeeDashboardResponse, EvaluatedCompetency } from "@/lib/api/competencies";

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployeeDashboardResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Explainability Modals
  const [selectedGapExplanation, setSelectedGapExplanation] = useState<EvaluatedCompetency | null>(null);
  const [selectedCourseExplanation, setSelectedCourseExplanation] = useState<{
    title: string;
    provider: string;
    match: number;
    reason: string;
    target: string[];
    id: string;
  } | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await getMyDashboardStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const openWhyRecommended = (courseId: string) => {
    const course = DEMO_COURSES.find((c) => c.id === courseId);
    if (!course) return;
    setSelectedCourseExplanation({
      title: course.title,
      provider: course.provider,
      match: course.matchPercentage,
      reason: course.recommendationReason,
      target: course.targetCompetencies,
      id: course.id,
    });
  };

  const displayName = user ? user.firstName : "Rahul";
  const designation = user?.profile?.designation || "Statistical Officer";
  const department = user?.profile?.department?.name || "National Statistical Office (NSO)";

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Aggregating competency intelligence from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Good morning, {displayName}
            </h1>
            <span className="text-xl">👋</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              DATABASE VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-blue-900">{designation}</span>
            <span>•</span>
            <span>{department}</span>
            <span>•</span>
            <span className="text-slate-400 font-mono">Cadre ID: {user?.profile?.employeeCode || "MOSPI-SSS-8842"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/employee/assessments"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-900 transition"
          >
            <FileCheck2 className="h-4 w-4" />
            Start Diagnostic Assessment
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Database Metrics Notice</p>
            <p className="opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Overall Competency
            </span>
            <Award className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {stats?.overallScore ?? 57.4}%
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> Role Weighted
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${stats?.overallScore ?? 57.4}%` }}
            />
          </div>
        </div>

        {/* Critical Gaps */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              Critical Skill Gaps
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">
              {stats?.criticalGapsCount ?? 2}
            </span>
            <span className="text-xs font-medium text-slate-500">
              of {stats?.totalRequiredCompetencies ?? 7} requirements
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Immediate training intervention required</p>
        </div>

        {/* Target Met */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Benchmarks Met
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">
              {stats?.competenciesMeetingTarget ?? 2}
            </span>
            <span className="text-xs font-medium text-slate-500">
              proficient areas
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Meets or exceeds cadre targets</p>
        </div>

        {/* Learning History Events */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Evaluated Competencies
            </span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-900">
              {stats ? stats.totalRequiredCompetencies - stats.unassessedCompetencies : 6}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {stats?.totalRequiredCompetencies ?? 7} mapped
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {stats?.unassessedCompetencies ? `${stats.unassessedCompetencies} unassessed` : "All competencies assessed"}
          </p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Priority Skill Gaps (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Priority Competency Gaps for Statistical Officer
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically ranked by gap deficit, role importance weight, and mandatory status
                </p>
              </div>
              <Link
                href="/employee/skill-gaps"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {stats?.topPriorityGaps?.map((gap, i) => (
                <div
                  key={gap.competencyId}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 font-mono text-[10px] font-bold text-slate-700">
                        {i + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900">
                        {gap.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {gap.code}
                      </span>
                      {gap.isMandatory && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          MANDATORY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          gap.severity === "CRITICAL"
                            ? "bg-rose-100 text-rose-800"
                            : gap.severity === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {gap.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {gap.currentScore !== null ? `${gap.currentScore}%` : "Not Assessed"} / {gap.requiredScore}%
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

                  <div className="flex items-center justify-between text-[11px]">
                    <p className="text-slate-600 font-medium truncate max-w-md">
                      {gap.reason}
                    </p>
                    <button
                      onClick={() => setSelectedGapExplanation(gap)}
                      className="font-bold text-blue-700 hover:text-blue-900 shrink-0 ml-2"
                    >
                      Why this priority? →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prototype Course Recommendation Section (Preserved with clear badge) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">
                    Recommended Training Programmes
                  </h2>
                  <SampleCatalogueBadge />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Targeted NSSTA & iGOT modules mapped to your priority skill gaps (Phase 4 integration)
                </p>
              </div>
              <Link
                href="/employee/courses"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                Catalogue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEMO_COURSES.slice(0, 2).map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {course.provider}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {course.matchPercentage}% Match
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {course.recommendationReason}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <button
                      onClick={() => openWhyRecommended(course.id)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900"
                    >
                      Why recommended?
                    </button>
                    <Link
                      href="/employee/courses"
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Enroll →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Cadre Progression & Recent Events (1 col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Cadre Progression Context
            </h2>
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
              <span className="text-[10px] font-bold uppercase text-blue-800">Assigned Posting</span>
              <p className="text-xs font-bold text-blue-950">
                {user?.profile?.currentAssignment || "Consumer Price Index (CPI) Analytics Unit"}
              </p>
              <p className="text-[11px] text-blue-900/80 leading-relaxed">
                Proficiency benchmarks are synchronized with the 2026 MoSPI Statistical Officer cadre directive.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-700">Recent Competency History Log</h3>
              <div className="space-y-2">
                {stats?.recentHistory?.length ? (
                  stats.recentHistory.map((h) => (
                    <div key={h.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{h.competencyName}</span>
                        <span className="text-blue-900">{h.previousScore}% → {h.newScore}%</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{h.changeReason || "Baseline profile assessment"}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-lg border border-dashed border-slate-200 text-center text-[11px] text-slate-400">
                    Baseline assessment active • No recent score changes
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Explain Modal */}
      {selectedGapExplanation && (
        <Modal
          isOpen={!!selectedGapExplanation}
          onClose={() => setSelectedGapExplanation(null)}
          title={`Priority Rationale: ${selectedGapExplanation.name}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-slate-700 leading-relaxed font-medium">
                {selectedGapExplanation.reason}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Current Score</span>
                <p className="text-lg font-black text-slate-900">{selectedGapExplanation.currentScore !== null ? `${selectedGapExplanation.currentScore}%` : "None"}</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Role Benchmark</span>
                <p className="text-lg font-black text-blue-900">{selectedGapExplanation.requiredScore}%</p>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Point Deficit</span>
                <p className="text-lg font-black text-rose-600">-{selectedGapExplanation.gap} pts</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Course Recommendation Explain Modal */}
      {selectedCourseExplanation && (
        <Modal
          isOpen={!!selectedCourseExplanation}
          onClose={() => setSelectedCourseExplanation(null)}
          title={`Why Recommended: ${selectedCourseExplanation.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedCourseExplanation.provider}</span>
                <span className="text-emerald-700 font-bold">{selectedCourseExplanation.match}% Match Weight</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {selectedCourseExplanation.reason}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}