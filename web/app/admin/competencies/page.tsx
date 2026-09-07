"use client";

import React, { useEffect, useState } from "react";
import { Search, ChevronDown, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { getCompetenciesCatalog, CompetenciesCatalogResponse } from "@/lib/api/competencies";

export default function AdminCompetenciesPage() {
  const [data, setData] = useState<CompetenciesCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [expanded, setExpanded] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCompetenciesCatalog(
        domain !== "All" ? domain : undefined,
        search || undefined,
      );
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load competency framework");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const domainFilters = [
    "All",
    ...(data?.domains?.map((d) => d.code) || []),
  ];

  const filteredCompetencies = (data?.competencies || []).filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchDomain = domain === "All" || c.domain?.code === domain;
    return matchSearch && matchDomain;
  });

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading competency framework from PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Competency Framework</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              DATABASE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            MoSPI SIH26101 competency taxonomy — {data?.competencies?.length ?? 0} competencies across {data?.domains?.length ?? 0} domains
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error loading competency catalog</p>
            <p className="mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Domain summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.domains?.map((d) => (
          <button
            key={d.id}
            onClick={() => setDomain(domain === d.code ? "All" : d.code)}
            className={`p-4 rounded-xl border text-left transition shadow-2xs ${
              domain === d.code
                ? "bg-blue-700 border-blue-800 text-white"
                : "bg-white border-slate-200 text-slate-800 hover:border-blue-300"
            }`}
          >
            <p className="text-xs font-black leading-tight">{d.name}</p>
            <p className={`text-[10px] mt-1 ${domain === d.code ? "text-blue-100" : "text-slate-400"}`}>
              {d._count?.competencies ?? "—"} competencies
            </p>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <form onSubmit={handleSearch} className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search competencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
          />
        </form>
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => setDomain("All")}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              domain === "All"
                ? "bg-[#1E3A8A] text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Domains
          </button>
          {data?.domains?.map((d) => (
            <button
              key={d.id}
              onClick={() => setDomain(domain === d.code ? "All" : d.code)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                domain === d.code
                  ? "bg-[#1E3A8A] text-white font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {d.code}
            </button>
          ))}
        </div>
      </div>

      {/* Competency List */}
      <div className="space-y-2">
        {filteredCompetencies.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">
            {search ? `No competencies match "${search}"` : "No competencies found in this domain."}
          </div>
        )}
        {filteredCompetencies.map((comp) => (
          <div
            key={comp.id}
            className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden hover:border-blue-200 transition"
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setExpanded(expanded === comp.id ? null : comp.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{comp.name}</span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {comp.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500">{comp.domain?.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    expanded === comp.id ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {expanded === comp.id && (
              <div className="px-5 pb-4 border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                {comp.description ? (
                  <p className="leading-relaxed">{comp.description}</p>
                ) : (
                  <p className="italic text-slate-400">No description provided. Edit via Competency Admin API.</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-bold border border-blue-200">
                    Domain: {comp.domain?.name}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold">
                    ID: {comp.id}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
