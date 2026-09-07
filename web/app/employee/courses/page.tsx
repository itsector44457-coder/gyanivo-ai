"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  HelpCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  getCourses,
  getMyRecommendations,
  getCourseProviders,
  CourseDto,
  CourseRecommendation,
  CourseProvider,
  CourseDifficulty,
} from "@/lib/api/courses";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

const DIFFICULTY_COLORS: Record<CourseDifficulty, string> = {
  FOUNDATIONAL: "bg-slate-100 text-slate-700",
  BEGINNER: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  INTERMEDIATE: "bg-amber-50 text-amber-700 border border-amber-200",
  ADVANCED: "bg-red-50 text-red-700 border border-red-200",
};

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

type ViewMode = "recommendations" | "catalog";

interface SelectedCourse {
  course: CourseDto;
  recommendation?: CourseRecommendation;
}

export default function EmployeeCoursesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("recommendations");
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(null);
  const [savedCourses, setSavedCourses] = useState<Record<number, boolean>>({});

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [providers, setProviders] = useState<CourseProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catalogRes, recsRes, providersRes] = await Promise.all([
        getCourses({ page: 1, limit: 50 }),
        getMyRecommendations({ limit: 15 }),
        getCourseProviders(),
      ]);
      setCourses(catalogRes.items);
      setRecommendations(recsRes);
      setProviders(providersRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSave = (id: number) => {
    setSavedCourses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const providerNames = ["All", ...providers.map((p) => p.name)];

  const filteredCourses = courses.filter((c) => {
    const matchesProvider =
      providerFilter === "All" || c.providerName === providerFilter || c.providerCode === providerFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)) ||
      c.competencyMappings.some(
        (m) =>
          m.competencyName.toLowerCase().includes(q) ||
          m.competencyCode.toLowerCase().includes(q)
      );
    return matchesProvider && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600 mr-3" />
        <p className="text-sm text-slate-600 font-medium">Loading course catalog…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-slate-700 font-medium">{error}</p>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#1E3A8A] text-white rounded-lg"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Training Catalogue
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Catalog
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {courses.length} courses from {providers.length} providers, semantically mapped to MoSPI competency framework
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("recommendations")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              viewMode === "recommendations"
                ? "bg-[#1E3A8A] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Sparkles className="inline h-3.5 w-3.5 mr-1.5" />
            My Recommendations
          </button>
          <button
            onClick={() => setViewMode("catalog")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              viewMode === "catalog"
                ? "bg-[#1E3A8A] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <BookOpen className="inline h-3.5 w-3.5 mr-1.5" />
            Full Catalog
          </button>
        </div>
      </div>

      {/* View: Recommendations */}
      {viewMode === "recommendations" && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-900">All competency targets achieved!</p>
              <p className="text-xs text-slate-500 mt-1">
                No active skill gaps found. Browse the full catalog for enrichment.
              </p>
            </div>
          ) : (
            <>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                <Sparkles className="inline h-3.5 w-3.5 mr-1" />
                <strong>{recommendations.length} courses</strong> ranked by explainable composite score (competency relevance × gap severity × difficulty fit × role mandate).
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {recommendations.map((rec) => {
                  const isSaved = savedCourses[rec.courseId];
                  return (
                    <div
                      key={`${rec.courseId}-${rec.competencyId}`}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition group"
                    >
                      <div className="space-y-3">
                        {/* Rank badge + provider */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black text-white bg-[#1E3A8A] px-2 py-0.5 rounded">
                                #{rec.rankingPosition}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                {rec.providerCode}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleSave(rec.courseId)}
                            aria-label="Save course"
                            className={`p-1.5 rounded-lg border transition ${
                              isSaved
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-white text-slate-400 border-slate-200 hover:text-slate-700"
                            }`}
                          >
                            <Bookmark className="h-4 w-4" />
                          </button>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition leading-snug">
                          {rec.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${DIFFICULTY_COLORS[rec.difficultyLevel]}`}>
                            {rec.difficultyLevel}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDuration(rec.durationMinutes)}
                          </span>
                          <span>•</span>
                          <span className="font-extrabold text-emerald-700">
                            {Math.round(rec.recommendationScore * 100)}% match
                          </span>
                        </div>

                        {/* Gap info */}
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                          <strong>{rec.competencyName}</strong>
                          {rec.skillGap > 0 ? (
                            <span> — {Math.round(rec.skillGap)} pt gap ({rec.currentCompetencyScore ?? "Unassessed"}% → {rec.requiredScore}% required)</span>
                          ) : (
                            <span> — role proficiency maintenance</span>
                          )}
                          {rec.isMandatory && (
                            <span className="ml-1 text-[9px] font-black uppercase text-red-700 bg-red-100 px-1 py-0.5 rounded">Mandatory</span>
                          )}
                        </div>

                        {/* Reason */}
                        <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-950">
                          <p className="line-clamp-2">{rec.reasons[0]}</p>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                        <button
                          onClick={() => {
                            const course = courses.find((c) => c.id === rec.courseId);
                            if (course) setSelectedCourse({ course, recommendation: rec });
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
                          Why this?
                        </button>

                        {rec.courseUrl ? (
                          <a
                            href={rec.courseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#1E3A8A] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-900 shadow-2xs transition"
                          >
                            {rec.isCompleted ? "Review Again" : "Start Course"}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">URL not configured</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* View: Full Catalog */}
      {viewMode === "catalog" && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, skills, topics…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Source:
              </span>
              {providerNames.map((p) => (
                <button
                  key={p}
                  onClick={() => setProviderFilter(p)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition ${
                    providerFilter === p
                      ? "bg-[#1E3A8A] text-white font-bold shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const isSaved = savedCourses[course.id];
              const primaryMapping = course.competencyMappings.find((m) => m.status === "APPROVED");
              return (
                <div
                  key={course.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {course.providerCode}
                      </span>
                      <button
                        onClick={() => toggleSave(course.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          isSaved
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : "bg-white text-slate-400 border-slate-200 hover:text-slate-700"
                        }`}
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${DIFFICULTY_COLORS[course.difficultyLevel]}`}>
                        {course.difficultyLevel}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDuration(course.durationMinutes)}
                      </span>
                    </div>

                    {primaryMapping && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700">
                        <strong>Maps to:</strong> {primaryMapping.competencyName}
                        <span className="ml-1 text-emerald-600 font-bold">
                          ({Math.round(primaryMapping.relevanceScore * 100)}% match)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedCourse({ course })}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
                      Details
                    </button>

                    {course.courseUrl ? (
                      <a
                        href={course.courseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#1E3A8A] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-900 shadow-2xs transition"
                      >
                        View Course <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">URL not configured</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-900">No courses found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter.</p>
            </div>
          )}
        </div>
      )}

      {/* Provider Status Panel */}
      {providers.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Provider Integration Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {providers.map((p) => (
              <div key={p.code} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{p.code}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>{p.status}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{p.capabilities.authStatusNote}</p>
                <p className="text-[10px] text-slate-400 mt-1">{p.courseCount} courses synced</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Detail / Why Modal */}
      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.course.title || ""}
        subtitle={selectedCourse?.recommendation ? "Explainable Recommendation Rationale" : "Course Details"}
      >
        {selectedCourse && (
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold">Provider:</span>
                <span className="font-semibold text-blue-700">{selectedCourse.course.providerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Difficulty:</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[selectedCourse.course.difficultyLevel]}`}>
                  {selectedCourse.course.difficultyLevel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Duration:</span>
                <span>{formatDuration(selectedCourse.course.durationMinutes)}</span>
              </div>
              {selectedCourse.recommendation && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Match Score:</span>
                    <span className="font-extrabold text-emerald-700">
                      {Math.round(selectedCourse.recommendation.recommendationScore * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Target Competency:</span>
                    <span className="font-semibold">{selectedCourse.recommendation.competencyName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Skill Gap:</span>
                    <span className="font-bold text-amber-700">
                      {Math.round(selectedCourse.recommendation.skillGap)} pts
                      {" "}({selectedCourse.recommendation.currentCompetencyScore ?? "Unassessed"}% → {selectedCourse.recommendation.requiredScore}%)
                    </span>
                  </div>
                </>
              )}
            </div>

            {selectedCourse.recommendation?.reasons && selectedCourse.recommendation.reasons.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
                <p className="font-bold mb-2">Algorithm Rationale:</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  {selectedCourse.recommendation.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedCourse.course.competencyMappings.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold mb-2 text-slate-900">Competency Mappings:</p>
                <div className="space-y-1.5">
                  {selectedCourse.course.competencyMappings.map((m) => (
                    <div key={m.competencyId} className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-700">{m.competencyName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        m.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {Math.round(m.relevanceScore * 100)}% {m.mappingMethod}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCourse.course.courseUrl && (
              <a
                href={selectedCourse.course.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#1E3A8A] text-white text-xs font-bold hover:bg-blue-900 transition"
              >
                Open Course on {selectedCourse.course.providerCode} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
