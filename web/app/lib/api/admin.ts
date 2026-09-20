// web/app/lib/api/admin.ts
// Admin API functions — calls require ADMIN role JWT

import { apiClient } from './client';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  systemRole: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    employeeCode?: string;
    designation?: string;
    department?: { name: string; code: string } | null;
    jobRole?: { name: string; code: string } | null;
  } | null;
  _count?: {
    competencyScores?: number;
    assessmentAttempts?: number;
  };
}

export interface AdminUsersResponse {
  users?: AdminUser[];
  // findAll may return array directly
}

// ── Endpoints ────────────────────────────────────────────────────────────────

/**
 * GET /users/admin/all — returns all users (ADMIN role required)
 */
export async function getAdminAllUsers(): Promise<AdminUser[]> {
  const res = await apiClient<AdminUser[] | AdminUsersResponse>('/users/admin/all');
  // API might return array directly or { users: [] }
  if (Array.isArray(res)) return res;
  const typed = res as AdminUsersResponse;
  return typed.users ?? [];
}

/**
 * GET /competencies — public, returns full catalog with domains
 */
export async function getAdminCompetenciesCatalog() {
  return apiClient<{
    success: boolean;
    domains: Array<{ id: number; code: string; name: string; description: string; _count?: { competencies: number } }>;
    competencies: Array<{ id: number; code: string; name: string; domainId: number; domain: { id: number; code: string; name: string } }>;
  }>('/competencies');
}
