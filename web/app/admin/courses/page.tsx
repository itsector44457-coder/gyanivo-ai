"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  BookOpen,
  Clock,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Database,
  RotateCcw,
} from "lucide-react";
import {
  getCourses,
  getCourseProviders,
  syncProviderCatalog,
  CourseDto,
  CourseProvider,
  CourseDifficulty,
} from "@/lib/api/courses";

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

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [providers, setProviders] = useState<CourseProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, string>>({});

  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("All");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catalogRes, providersRes] = await Promise.all([
        getCourses({ page: 1, limit: 100 }),
        getCourseProviders(),
      ]);
      setCourses(catalogRes.items);
      setProviders(providersRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async (providerCode: string) => {
    setSyncingProvider(providerCode);
    setSyncResults((prev) => ({ ...prev, [providerCode]: "syncing" }));
    try {
      const result = await syncProviderCatalog(providerCode);
      setSyncResults((prev) => ({
        ...prev,
        [providerCode]: `Synced: ${result.itemsFetched} fetched, ${result.itemsCreated} new, ${result.mappingsCreated} mapped (${result.durationMs}ms)`,
      }));
      await loadData();
    } catch (err) {
      setSyncResults((prev) => ({
        ...prev,
        [providerCode]: `Error: ${err instanceof Error ? err.message : "Sync failed"}`,
      }));
    } finally {
      setSyncingProvider(null);
    }
  };

  const providerNames = ["All", ...providers.map((p) => p.code)];

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.externalId.toLowerCase().includes(q) ||
      c.competencyMappings.some((m) => m.competencyName.toLowerCase().includes(q));
    const matchProv = providerFilter === "All" || c.providerCode === providerFilter;
    return matchSearch && matchProv;
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
        <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#1E3A8A] text-white rounded-lg">
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
            <h1 className="text-2xl font-black text-slate-900">Course Catalogue Management</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {courses.length} courses from {providers.length} providers with semantic competency mappings
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {providers.map((p) => {
          const isSyncing = syncingProvider === p.code;
          const syncMsg = syncResults[p.code];

          return (
            <div key={p.code} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-bold text-slate-900">{p.code}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{p.name}</p>
                </div>
                <span className="text-sm font-black text-blue-700">{p.courseCount}</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {Object.entries({
                  "Catalog Read": p.capabilities.catalogRead,
                  "Auth Sync": p.capabilities.authenticatedCatalogSync,
                  "Enrollment": p.capabilities.enrollmentRead,
                  "Completion": p.capabilities.completionRead,
                }).map(([label, val]) => (
                  <div key={label} className="flex items-center gap-1 text-[10px]">
                    {val ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                    )}
                    <span className={val ? "text-slate-700" : "text-slate-400"}>{label}</span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">{p.capabilities.authStatusNote}</p>

              <button
                onClick={() => handleSync(p.code)}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg bg-[#1E3A8A] text-white hover:bg-blue-900 disabled:opacity-60 transition"
              >
                {isSyncing ? (
                  <><Loader2 className="h-3 w-3 animate-spin" /> Syncing…</>
                ) : (
                  <><RefreshCw className="h-3 w-3" /> Sync Catalog</>
                )}
              </button>

              {syncMsg && syncMsg !== "syncing" && (
                <p className="text-[10px] text-emerald-700 mt-2 font-medium leading-relaxed">{syncMsg}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
            placeholder="Search courses, competencies, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {providerNames.map((p) => (
            <button
              key={p}
              onClick={() => setProviderFilter(p)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition ${
                providerFilter === p
                  ? "bg-[#1E3A8A] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Course</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Provider</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Difficulty</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Competency Mappings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-900 leading-snug max-w-xs">{c.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{c.externalId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {c.providerCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[c.difficultyLevel]}`}>
                      {c.difficultyLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="h-3 w-3" /> {formatDuration(c.durationMinutes)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {c.competencyMappings.length === 0 ? (
                        <span className="text-slate-400 italic text-[10px]">No mappings</span>
                      ) : (
                        c.competencyMappings.map((m) => (
                          <span
                            key={m.competencyId}
                            title={`${m.mappingMethod} | Relevance: ${Math.round(m.relevanceScore * 100)}% | ${m.evidence}`}
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              m.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {m.competencyCode} ({Math.round(m.relevanceScore * 100)}%)
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-xs">
                    No courses found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
