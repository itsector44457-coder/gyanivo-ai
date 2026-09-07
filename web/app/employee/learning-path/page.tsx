"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Compass,
  CheckCircle2,
  PlayCircle,
  Clock,
  Award,
  Sparkles,
  Layers,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Target,
} from "lucide-react";
import { getMyLearningPath, PersonalizedLearningPath, LearningPathMilestone, CourseDifficulty } from "@/lib/api/courses";

const MILESTONE_ICONS = {
  COURSE: BookOpen,
  REASSESSMENT: Target,
  GOAL: Award,
};

const DIFFICULTY_COLORS: Record<CourseDifficulty, string> = {
  FOUNDATIONAL: "text-slate-600 bg-slate-100",
  BEGINNER: "text-emerald-700 bg-emerald-50 border border-emerald-200",
  INTERMEDIATE: "text-amber-700 bg-amber-50 border border-amber-200",
  ADVANCED: "text-red-700 bg-red-50 border border-red-200",
};

function formatDuration(mins?: number): string {
  if (!mins) return "";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function MilestoneCard({ milestone, isLast }: { milestone: LearningPathMilestone; isLast: boolean }) {
  const Icon = MILESTONE_ICONS[milestone.type];

  const stepColorClass =
    milestone.type === "GOAL"
      ? "border-emerald-400 bg-emerald-50"
      : milestone.type === "REASSESSMENT"
      ? "border-purple-300 bg-purple-50"
      : milestone.isCompleted
      ? "border-emerald-300 bg-emerald-50/40"
      : "border-blue-300 bg-white";

  const iconColorClass =
    milestone.type === "GOAL"
      ? "bg-emerald-600 text-white"
      : milestone.type === "REASSESSMENT"
      ? "bg-purple-600 text-white"
      : milestone.isCompleted
      ? "bg-emerald-500 text-white"
      : "bg-[#1E3A8A] text-white";

  return (
    <div className="flex gap-4">
      {/* Step indicator column */}
      <div className="flex flex-col items-center">
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${iconColorClass}`}>
          {milestone.isCompleted ? (
            <CheckCircle2 className="h-4.5 w-4.5" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1.5 mb-0" />}
      </div>

      {/* Card */}
      <div className={`flex-1 rounded-xl border p-4 shadow-2xs mb-4 ${stepColorClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Step {milestone.stepNumber}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                milestone.type === "GOAL"
                  ? "bg-emerald-100 text-emerald-800"
                  : milestone.type === "REASSESSMENT"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {milestone.type === "REASSESSMENT" ? "Re-Assessment" : milestone.type}
              </span>
              {milestone.difficultyLevel && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[milestone.difficultyLevel]}`}>
                  {milestone.difficultyLevel}
                </span>
              )}
              {milestone.isCompleted && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Completed
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug">{milestone.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{milestone.description}</p>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
              {milestone.durationMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(milestone.durationMinutes)}
                </span>
              )}
              {milestone.providerName && (
                <span className="text-blue-600 font-medium">{milestone.providerName}</span>
              )}
              {milestone.targetCompetencyScore && (
                <span className="text-slate-600">
                  Target: <strong>{milestone.targetCompetencyScore}%</strong>
                </span>
              )}
              {milestone.estimatedScoreGain && (
                <span className="text-emerald-700 font-bold">
                  +{milestone.estimatedScoreGain} pts estimated gain
                </span>
              )}
            </div>
          </div>

          {/* Action */}
          {milestone.type === "COURSE" && milestone.courseUrl && !milestone.isCompleted && (
            <a
              href={milestone.courseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#1E3A8A] px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-900 transition shadow-sm"
            >
              <PlayCircle className="h-3.5 w-3.5" /> Start
            </a>
          )}
          {milestone.type === "COURSE" && milestone.isCompleted && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
          )}
          {milestone.type === "REASSESSMENT" && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg">
              <Target className="h-3.5 w-3.5" /> Diagnostic
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmployeeLearningPathPage() {
  const [learningPath, setLearningPath] = useState<PersonalizedLearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPath = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyLearningPath();
      setLearningPath(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load learning path");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPath();
  }, [loadPath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600 mr-3" />
        <p className="text-sm text-slate-600 font-medium">Generating your personalized learning roadmap…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-slate-700 font-medium">{error}</p>
        <button
          onClick={loadPath}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#1E3A8A] text-white rounded-lg"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (!learningPath || learningPath.milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <p className="text-lg font-black text-slate-900">All Competency Benchmarks Met!</p>
        <p className="text-sm text-slate-500">No active skill gaps identified for your job role.</p>
      </div>
    );
  }

  const completedMilestones = learningPath.milestones.filter((m) => m.isCompleted).length;
  const progressPercent = Math.round((completedMilestones / learningPath.milestones.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Personalized Learning Roadmap
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Focus: <strong className="text-blue-900">{learningPath.primaryFocusCompetency}</strong> • {learningPath.jobRole} Benchmark
          </p>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/60 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-700" />
              <h2 className="text-base font-bold text-blue-950">
                Calibrated Milestone Sequence — {learningPath.employeeName}
              </h2>
            </div>
            <p className="text-xs text-blue-900/80 max-w-2xl leading-relaxed">
              Dynamically generated to close {learningPath.totalGapsIdentified} identified skill gap{learningPath.totalGapsIdentified > 1 ? "s" : ""} through structured training modules and adaptive re-assessments.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 flex-shrink-0">
            <div className="text-center bg-white/60 rounded-xl p-3 border border-blue-200">
              <div className="text-xl font-black text-blue-900">{learningPath.milestones.length}</div>
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Steps</div>
            </div>
            <div className="text-center bg-white/60 rounded-xl p-3 border border-blue-200">
              <div className="text-xl font-black text-blue-900">{learningPath.estimatedTotalHours}h</div>
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Est. Hours</div>
            </div>
            <div className="text-center bg-white/60 rounded-xl p-3 border border-blue-200">
              <div className="text-xl font-black text-emerald-700">{learningPath.totalGapsIdentified}</div>
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Gaps</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {progressPercent > 0 && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="font-semibold text-blue-900">Overall Progress</span>
              <span className="text-blue-700 font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-700 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Milestone Timeline */}
      <div className="space-y-0">
        {learningPath.milestones.map((milestone, idx) => (
          <MilestoneCard
            key={milestone.stepNumber}
            milestone={milestone}
            isLast={idx === learningPath.milestones.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
