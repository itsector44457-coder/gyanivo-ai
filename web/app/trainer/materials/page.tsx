"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Upload,
  Search,
  FileText,
  Sparkles,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Badge, PrototypeBadge } from "@/components/ui/Badge";
import {
  getStoredTrainingMaterials,
  saveStoredTrainingMaterials,
} from "@/lib/trainerStorage";
import { TrainingMaterial } from "@/types";

export default function TrainerMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [materials, setMaterials] = useState<TrainingMaterial[]>([]);

  useEffect(() => {
    setMaterials(getStoredTrainingMaterials());

    const handleUpdate = () => {
      setMaterials(getStoredTrainingMaterials());
    };

    window.addEventListener("gyanivo_materials_updated", handleUpdate);
    return () => {
      window.removeEventListener("gyanivo_materials_updated", handleUpdate);
    };
  }, []);

  const filtered = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.programme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this training document from the repository?")) {
      const updated = materials.filter((m) => m.id !== id);
      setMaterials(updated);
      saveStoredTrainingMaterials(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Official Training Materials
            </h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Repository of NSSTA curricula, survey guidelines, and official technical manuals processed by the AI pipeline
          </p>
        </div>

        <Link
          href="/trainer/materials/upload"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-900 transition"
        >
          <Upload className="h-4 w-4" />
          Upload New Material
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents, programmes, files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          {filtered.length} Documents Active
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700">
            <tr>
              <th className="px-5 py-3.5">Material Document</th>
              <th className="px-5 py-3.5">Programme</th>
              <th className="px-5 py-3.5">Domain</th>
              <th className="px-5 py-3.5">Uploaded</th>
              <th className="px-5 py-3.5 text-center">Pages / Chunks</th>
              <th className="px-5 py-3.5 text-center">Questions</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((mat) => (
              <tr key={mat.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>{mat.fileName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate">
                    {mat.title}
                  </p>
                </td>
                <td className="px-5 py-4">{mat.programme}</td>
                <td className="px-5 py-4 font-medium text-slate-700">{mat.competencyDomain}</td>
                <td className="px-5 py-4 text-slate-500">{mat.uploadedAt}</td>
                <td className="px-5 py-4 text-center font-mono text-[11px]">
                  {mat.pageCount}p / {mat.chunksCount}c
                </td>
                <td className="px-5 py-4 text-center font-extrabold text-blue-900">
                  {mat.questionsGeneratedCount}
                </td>
                <td className="px-5 py-4">
                  <Badge variant="success">Ready</Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/trainer/question-bank?doc=${encodeURIComponent(mat.fileName)}`}
                      className="px-2 py-1 rounded bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Questions
                    </Link>
                    <Link
                      href={`/trainer/question-review?doc=${encodeURIComponent(mat.fileName)}`}
                      className="px-2 py-1 rounded bg-blue-700 font-bold text-white hover:bg-blue-800 shadow-2xs"
                    >
                      Review
                    </Link>
                    <button
                      onClick={() => handleDelete(mat.id)}
                      aria-label="Delete material"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
