"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  PlayCircle,
  Clock,
  Award,
  Layers,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Target,
} from "lucide-react";
import {
  getMyLearningPath,
  type PersonalizedLearningPath,
  type LearningPathMilestone,
  type CourseDifficulty,
} from "@/lib/api/courses";

/* ── helpers ───────────────────────────────────────── */

const MILESTONE_ICONS = {
  COURSE:       BookOpen,
  REASSESSMENT: Target,
  GOAL:         Award,
};

const DIFFICULTY_PILLS: Record<CourseDifficulty, string> = {
  FOUNDATIONAL: "bg-gray-100 text-gray-600",
  BEGINNER:     "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  INTERMEDIATE: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  ADVANCED:     "bg-red-50 text-red-600 ring-1 ring-red-200",
};

function mins(m?: number) {
  if (!m) return null;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h && rem) return `${h}h ${rem}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

/* ── milestone card ────────────────────────────────── */

function MilestoneCard({
  milestone,
  isLast,
}: {
  milestone: LearningPathMilestone;
  isLast: boolean;
}) {
  const Icon = MILESTONE_ICONS[milestone.type];

  const iconBg =
    milestone.type === "GOAL"        ? "bg-emerald-600"
    : milestone.type === "REASSESSMENT" ? "bg-violet-600"
    : milestone.isCompleted           ? "bg-emerald-500"
    : "bg-blue-600";

  const cardBorder =
    milestone.type === "GOAL"           ? "border-emerald-200 bg-emerald-50/30"
    : milestone.type === "REASSESSMENT" ? "border-violet-200 bg-violet-50/20"
    : milestone.isCompleted             ? "border-gray-200 bg-gray-50/40"
    : "border-gray-200 bg-white";

  const duration = mins(milestone.durationMinutes);

  return (
    <div className="flex gap-4">
      {/* timeline column */}
      <div className="flex flex-col items-center pt-0.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${iconBg}`}
        >
          {milestone.isCompleted ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>
        {!isLast && <div className="mt-1.5 w-px flex-1 bg-gray-200" />}
      </div>

      {/* card */}
      <div className={`mb-4 flex-1 rounded-xl border p-4 ${cardBorder}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-1.5">

            {/* meta row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400">
                Step {milestone.stepNumber}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  milestone.type === "GOAL"           ? "bg-emerald-100 text-emerald-700"
                  : milestone.type === "REASSESSMENT" ? "bg-violet-100 text-violet-700"
                  : "bg-blue-100 text-blue-700"
                }`}
              >
                {milestone.type === "REASSESSMENT" ? "Re-assessment" : milestone.type.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
              </span>
              {milestone.difficultyLevel && (
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${DIFFICULTY_PILLS[milestone.difficultyLevel]}`}>
                  {milestone.difficultyLevel.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                </span>
              )}
              {milestone.isCompleted && (
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                  Completed
                </span>
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-900 leading-snug">
              {milestone.title}
            </h3>
            <p className="text-[12px] leading-relaxed text-gray-500">
              {milestone.description}
            </p>

            {/* info row */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-gray-400">
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {duration}
                </span>
              )}
              {milestone.providerName && (
                <span className="font-medium text-blue-600">{milestone.providerName}</span>
              )}
              {milestone.targetCompetencyScore && (
                <span>Target: <strong className="text-gray-700">{milestone.targetCompetencyScore}%</strong></span>
              )}
              {milestone.estimatedScoreGain && (
                <span className="font-semibold text-emerald-600">
                  +{milestone.estimatedScoreGain} pts estimated
                </span>
              )}
            </div>
          </div>

          {/* action */}
          <div className="shrink-0">
            {milestone.type === "COURSE" && milestone.courseUrl && !milestone.isCompleted && (
              <a
                href={milestone.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-blue-700"
              >
                <PlayCircle className="h-3.5 w-3.5" /> Start
              </a>
            )}
            {milestone.type === "COURSE" && milestone.isCompleted && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Done
              </span>
            )}
            {milestone.type === "REASSESSMENT" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-[12px] font-semibold text-violet-700 ring-1 ring-violet-200">
                <Target className="h-3.5 w-3.5" /> Diagnostic
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── page ──────────────────────────────────────────── */

export default function EmployeeLearningPathPage() {
  const [path, setPath]   = useState<PersonalizedLearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyLearningPath();
      setPath(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load learning path");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3 text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <p className="text-sm">Building your learning path…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <AlertCircle className="h-9 w-9 text-red-400" />
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      </div>
    );
  }

  if (!path || path.milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <p className="text-lg font-semibold text-gray-900">All benchmarks met</p>
        <p className="text-sm text-gray-500">No active skill gaps for your role right now.</p>
      </div>
    );
  }

  const completed = path.milestones.filter((m) => m.isCompleted).length;
  const progress  = Math.round((completed / path.milestones.length) * 100);

  return (
    <div className="space-y-6">

      {/* ── header ── */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900">Learning path</h1>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Focused on: <span className="font-medium text-gray-700">{path.primaryFocusCompetency}</span>
          {" · "}{path.jobRole} benchmarks
        </p>
      </div>

      {/* ── overview banner ── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-gray-900">{path.employeeName}'s roadmap</p>
            <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
              {path.totalGapsIdentified} skill gap{path.totalGapsIdentified !== 1 ? "s" : ""} to close through structured training and adaptive re-assessments.
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            {[
              { value: path.milestones.length, label: "Steps",     icon: Layers },
              { value: `${path.estimatedTotalHours}h`, label: "Est. time", icon: Clock },
              { value: path.totalGapsIdentified, label: "Gaps",    icon: AlertCircle },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="rounded-xl bg-white px-4 py-3 text-center shadow-sm ring-1 ring-gray-200">
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="mt-0.5 text-[10px] font-medium text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {progress > 0 && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-[12px]">
              <span className="font-medium text-gray-600">Overall progress</span>
              <span className="font-semibold text-blue-700">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── timeline ── */}
      <div>
        {path.milestones.map((m, i) => (
          <MilestoneCard
            key={m.stepNumber}
            milestone={m}
            isLast={i === path.milestones.length - 1}
          />
        ))}
      </div>

    </div>
  );
}
