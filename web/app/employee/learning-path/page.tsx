"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, PlayCircle, Clock, Award, Layers, Loader2, AlertCircle, RefreshCw, BookOpen, Target } from "lucide-react";
import { getMyLearningPath, type PersonalizedLearningPath, type LearningPathMilestone, type CourseDifficulty } from "@/lib/api/courses";

const MILESTONE_ICONS = { COURSE: BookOpen, REASSESSMENT: Target, GOAL: Award };

const DIFFICULTY_PILLS: Record<CourseDifficulty, string> = {
  FOUNDATIONAL: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  BEGINNER:     "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  INTERMEDIATE: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
  ADVANCED:     "bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30",
};

function mins(m?: number) {
  if (!m) return null;
  const h = Math.floor(m / 60), r = m % 60;
  return h && r ? `${h}h ${r}m` : h ? `${h}h` : `${m}m`;
}

function MilestoneCard({ milestone, isLast }: { milestone: LearningPathMilestone; isLast: boolean }) {
  const Icon = MILESTONE_ICONS[milestone.type];
  const iconBg =
    milestone.type === "GOAL"           ? "bg-emerald-600"
    : milestone.type === "REASSESSMENT" ? "bg-violet-600"
    : milestone.isCompleted             ? "bg-emerald-500"
    : "bg-blue-600";

  const cardBorder =
    milestone.type === "GOAL"           ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-500/5"
    : milestone.type === "REASSESSMENT" ? "border-violet-200 bg-violet-50/20 dark:border-violet-500/20 dark:bg-violet-500/5"
    : milestone.isCompleted             ? "border-gray-200 bg-gray-50/40 dark:border-gray-800 dark:bg-gray-800/30"
    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900";

  const typePill =
    milestone.type === "GOAL"           ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
    : milestone.type === "REASSESSMENT" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400"
    : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";

  const duration = mins(milestone.durationMinutes);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-0.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${iconBg}`}>
          {milestone.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>
        {!isLast && <div className="mt-1.5 w-px flex-1 bg-gray-200 dark:bg-gray-800" />}
      </div>

      <div className={`mb-4 flex-1 rounded-xl border p-4 ${cardBorder}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-600">Step {milestone.stepNumber}</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${typePill}`}>
                {milestone.type === "REASSESSMENT" ? "Re-assessment" : milestone.type.charAt(0) + milestone.type.slice(1).toLowerCase()}
              </span>
              {milestone.difficultyLevel && (
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${DIFFICULTY_PILLS[milestone.difficultyLevel]}`}>
                  {milestone.difficultyLevel.charAt(0) + milestone.difficultyLevel.slice(1).toLowerCase()}
                </span>
              )}
              {milestone.isCompleted && (
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                  Completed
                </span>
              )}
            </div>

            <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">{milestone.title}</h3>
            <p className="text-[12px] leading-relaxed text-gray-500 dark:text-gray-400">{milestone.description}</p>

            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-gray-400 dark:text-gray-600">
              {duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{duration}</span>}
              {milestone.providerName && <span className="font-medium text-blue-600 dark:text-blue-400">{milestone.providerName}</span>}
              {milestone.targetCompetencyScore && <span>Target: <strong className="text-gray-700 dark:text-gray-300">{milestone.targetCompetencyScore}%</strong></span>}
              {milestone.estimatedScoreGain && <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{milestone.estimatedScoreGain} pts estimated</span>}
            </div>
          </div>

          <div className="shrink-0">
            {milestone.type === "COURSE" && milestone.courseUrl && !milestone.isCompleted && (
              <a href={milestone.courseUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <PlayCircle className="h-3.5 w-3.5" /> Start
              </a>
            )}
            {milestone.type === "COURSE" && milestone.isCompleted && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" /> Done
              </span>
            )}
            {milestone.type === "REASSESSMENT" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-[12px] font-semibold text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30">
                <Target className="h-3.5 w-3.5" /> Diagnostic
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeLearningPathPage() {
  const [path, setPath]       = useState<PersonalizedLearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setPath(await getMyLearningPath()); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load learning path"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex h-80 flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-600">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      <p className="text-sm">Building your learning path…</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertCircle className="h-9 w-9 text-red-400" />
      <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
      <button onClick={load} className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900">
        <RefreshCw className="h-3.5 w-3.5" /> Try again
      </button>
    </div>
  );

  if (!path || path.milestones.length === 0) return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      <p className="text-lg font-semibold text-gray-900 dark:text-white">All benchmarks met</p>
      <p className="text-sm text-gray-500 dark:text-gray-500">No active skill gaps for your role right now.</p>
    </div>
  );

  const completed = path.milestones.filter((m) => m.isCompleted).length;
  const progress  = Math.round((completed / path.milestones.length) * 100);

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="border-b border-gray-200 pb-5 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Learning path</h1>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" /> Live
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Focused on: <span className="font-medium text-gray-700 dark:text-gray-300">{path.primaryFocusCompetency}</span>
          {" · "}{path.jobRole} benchmarks
        </p>
      </div>

      {/* overview banner */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{path.employeeName}'s roadmap</p>
            <p className="mt-1 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400">
              {path.totalGapsIdentified} skill gap{path.totalGapsIdentified !== 1 ? "s" : ""} to close through structured training and adaptive re-assessments.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            {[
              { value: path.milestones.length,      label: "Steps",    icon: Layers },
              { value: `${path.estimatedTotalHours}h`, label: "Est. time", icon: Clock },
              { value: path.totalGapsIdentified,    label: "Gaps",     icon: AlertCircle },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="rounded-xl bg-white px-4 py-3 text-center shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="mt-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {progress > 0 && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-[12px]">
              <span className="font-medium text-gray-600 dark:text-gray-400">Overall progress</span>
              <span className="font-semibold text-blue-700 dark:text-blue-400">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-blue-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* timeline */}
      <div>
        {path.milestones.map((m, i) => (
          <MilestoneCard key={m.stepNumber} milestone={m} isLast={i === path.milestones.length - 1} />
        ))}
      </div>
    </div>
  );
}
