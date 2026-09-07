"use client";

import React, { useEffect, useState } from "react";
import { Save, Pencil, Check, X, CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import {
  getJobRoles,
  getJobRoleCompetencies,
  updateJobRoleCompetencies,
  getCompetenciesCatalog,
  JobRolesResponse,
  CompetenciesCatalogResponse,
} from "@/lib/api/competencies";

interface MatrixCell {
  roleId: number;
  competencyId: number;
  score: number;
  isMandatory: boolean;
  priorityWeight: number;
}

export default function AdminRoleMatrixPage() {
  const [roles, setRoles] = useState<JobRolesResponse['roles']>([]);
  const [competencies, setCompetencies] = useState<CompetenciesCatalogResponse['competencies']>([]);
  const [matrixMap, setMatrixMap] = useState<Map<string, MatrixCell>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingCell, setEditingCell] = useState<{ roleId: number; compId: number } | null>(null);
  const [editScore, setEditScore] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rolesRes, catalogRes] = await Promise.all([
        getJobRoles(),
        getCompetenciesCatalog(),
      ]);

      if (rolesRes.success && catalogRes.success) {
        setRoles(rolesRes.roles);
        setCompetencies(catalogRes.competencies);

        // Fetch requirements for all roles in parallel
        const matrix = new Map<string, MatrixCell>();

        await Promise.all(
          rolesRes.roles.map(async (role) => {
            const roleCompRes = await getJobRoleCompetencies(role.id);
            if (roleCompRes.success && roleCompRes.role?.requirements) {
              roleCompRes.role.requirements.forEach((req) => {
                const key = `${role.id}_${req.competency.id}`;
                matrix.set(key, {
                  roleId: role.id,
                  competencyId: req.competency.id,
                  score: req.requiredScore,
                  isMandatory: req.isMandatory,
                  priorityWeight: req.priorityWeight,
                });
              });
            }
          })
        );

        setMatrixMap(matrix);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load role matrix from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCell = (roleId: number, compId: number) => {
    const key = `${roleId}_${compId}`;
    return matrixMap.get(key) || { roleId, competencyId: compId, score: 0, isMandatory: false, priorityWeight: 1.0 };
  };

  const startEdit = (roleId: number, compId: number) => {
    const cell = getCell(roleId, compId);
    setEditingCell({ roleId, compId });
    setEditScore(String(cell.score));
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const scoreVal = Math.min(100, Math.max(0, parseInt(editScore) || 0));
    const key = `${editingCell.roleId}_${editingCell.compId}`;

    setMatrixMap((prev) => {
      const updated = new Map(prev);
      const current = prev.get(key) || {
        roleId: editingCell.roleId,
        competencyId: editingCell.compId,
        score: scoreVal,
        isMandatory: true,
        priorityWeight: 1.0,
      };
      updated.set(key, { ...current, score: scoreVal });
      return updated;
    });

    setEditingCell(null);
  };

  const handleSaveRole = async (roleId: number) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Collect all non-zero requirements for this role
      const requirements: Array<{
        competencyId: number;
        requiredScore: number;
        priorityWeight: number;
        isMandatory: boolean;
      }> = [];

      competencies.forEach((comp) => {
        const key = `${roleId}_${comp.id}`;
        const cell = matrixMap.get(key);
        if (cell && cell.score > 0) {
          requirements.push({
            competencyId: comp.id,
            requiredScore: cell.score,
            priorityWeight: cell.priorityWeight || 1.0,
            isMandatory: cell.isMandatory ?? true,
          });
        }
      });

      await updateJobRoleCompetencies(roleId, requirements);
      setSuccessMessage("Role competency requirements successfully saved to PostgreSQL database.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to persist role requirements");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading live competency matrix from PostgreSQL...</p>
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
              Role-Competency Matrix
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              DATABASE PERSISTED
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Define mandatory target proficiency scores (0–100%) across cadre job roles. Changing a requirement immediately recalculates employee skill gaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload Matrix
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Matrix Error</p>
            <p className="opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Changes Saved</p>
            <p className="opacity-90 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Role Selector Actions */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-600">
          Click any cell to edit benchmark score. Click <strong>Save to DB</strong> to persist changes.
        </span>
        <div className="flex items-center gap-2">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSaveRole(r.id)}
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-700 text-white font-bold text-[11px] shadow-2xs hover:bg-blue-800 transition disabled:opacity-50"
            >
              <Save className="h-3 w-3" /> Save {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700">
            <tr>
              <th className="px-5 py-3.5 text-left min-w-[220px]">Competency</th>
              <th className="px-4 py-3.5 text-left">Domain</th>
              {roles.map((r) => (
                <th key={r.id} className="px-4 py-3.5 text-center min-w-[130px]">
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {competencies.map((comp) => (
              <tr key={comp.id} className="hover:bg-slate-50/80 transition">
                <td className="px-5 py-3 font-semibold text-slate-900">
                  <div>{comp.name}</div>
                  <span className="text-[10px] font-mono text-slate-400">{comp.code}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-[11px]">
                  {comp.domain?.name}
                </td>
                {roles.map((r) => {
                  const cell = getCell(r.id, comp.id);
                  const isEditing =
                    editingCell?.roleId === r.id && editingCell?.compId === comp.id;

                  return (
                    <td
                      key={r.id}
                      className="px-4 py-3 text-center"
                      onClick={() => !isEditing && startEdit(r.id, comp.id)}
                    >
                      {isEditing ? (
                        <div
                          className="inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editScore}
                            onChange={(e) => setEditScore(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                            className="w-14 px-1.5 py-0.5 text-center text-xs font-bold border border-blue-600 rounded outline-none focus:ring-1 focus:ring-blue-300"
                            autoFocus
                          />
                          <button
                            onClick={commitEdit}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setEditingCell(null)}
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                            cell.score >= 75
                              ? "bg-blue-100 text-blue-900 hover:bg-blue-200"
                              : cell.score >= 50
                              ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
                              : cell.score > 0
                              ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "text-slate-300 hover:text-slate-600"
                          }`}
                        >
                          {cell.score > 0 ? `${cell.score}%` : "—"}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
