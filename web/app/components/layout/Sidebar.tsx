"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Award,
  AlertTriangle,
  Compass,
  BookOpen,
  FileCheck2,
  TrendingUp,
  History,
  Upload,
  Layers,
  HelpCircle,
  FileSpreadsheet,
  Sliders,
  Users,
  Building2,
  Briefcase,
  GitFork,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
  Cpu,
} from "lucide-react";
import { UserRole } from "@/types";
import { useAuth } from "@/lib/auth/AuthContext";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getCurrentRole = (): UserRole => {
    if (pathname.startsWith("/trainer")) return "TRAINER";
    if (pathname.startsWith("/admin")) return "ADMIN";
    return "EMPLOYEE";
  };

  const role = getCurrentRole();

  const employeeLinks = [
    { href: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/copilot", label: "Disha AI Copilot", icon: Bot, badge: "AI" },
    { href: "/employee/competencies", label: "Competency Index", icon: Award },
    { href: "/employee/skill-gaps", label: "Skill Gap Analysis", icon: AlertTriangle, badge: "Gaps" },
    { href: "/employee/learning-path", label: "Adaptive Path", icon: Compass },
    { href: "/employee/courses", label: "Recommended Training", icon: BookOpen },
    { href: "/employee/assessments", label: "Evaluations", icon: FileCheck2 },
    { href: "/employee/progress", label: "Performance & Growth", icon: TrendingUp },
    { href: "/employee/learning-history", label: "Training History", icon: History },
  ];

  const trainerLinks = [
    { href: "/trainer/dashboard", label: "Trainer Hub", icon: LayoutDashboard },
    { href: "/copilot", label: "Cadre AI Copilot", icon: Bot, badge: "RAG" },
    { href: "/trainer/materials", label: "Training Materials", icon: Upload },
    { href: "/trainer/materials/upload", label: "500p Ingestion Pipeline", icon: Cpu, badge: "AI" },
    { href: "/trainer/question-review", label: "Question Verification", icon: FileSpreadsheet, badge: "Review" },
    { href: "/trainer/question-bank", label: "Question Repository", icon: Layers },
    { href: "/ai-engine", label: "Psychometrics Lab", icon: Cpu, badge: "CAT" },
    { href: "/trainer/assessments", label: "Assessment Schemes", icon: FileCheck2 },
    { href: "/trainer/assessment-builder", label: "Assessment Assembler", icon: Sliders },
    { href: "/trainer/analytics", label: "Cadre Performance", icon: BarChart3 },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Command Centre", icon: LayoutDashboard },
    { href: "/copilot", label: "Cadre AI Copilot", icon: Bot, badge: "AI" },
    { href: "/ai-engine", label: "AI Psychometrics", icon: Cpu, badge: "Lab" },
    { href: "/admin/employees", label: "Cadre Directory", icon: Users },
    { href: "/admin/departments", label: "Divisions & Units", icon: Building2 },
    { href: "/admin/job-roles", label: "Cadre Roles", icon: Briefcase },
    { href: "/admin/role-matrix", label: "Role-Competency Matrix", icon: GitFork, badge: "Matrix" },
    { href: "/admin/competencies", label: "Framework Catalog", icon: Award },
    { href: "/admin/skill-gaps", label: "Organisation Skill Gaps", icon: AlertTriangle },
    { href: "/admin/courses", label: "Course Management", icon: BookOpen },
    { href: "/admin/course-mappings", label: "Course Mappings", icon: Sliders },
    { href: "/admin/assessments", label: "Compliance Monitor", icon: FileCheck2 },
    { href: "/admin/analytics", label: "Ministry Analytics", icon: BarChart3 },
    { href: "/admin/audit-logs", label: "System Audit Logs", icon: ShieldCheck },
    { href: "/admin/settings", label: "Configuration", icon: Settings },
  ];

  const links =
    role === "EMPLOYEE"
      ? employeeLinks
      : role === "TRAINER"
      ? trainerLinks
      : adminLinks;

  const roleName =
    role === "EMPLOYEE"
      ? "Employee Portal"
      : role === "TRAINER"
      ? "Trainer Workspace"
      : "Admin Command";

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : role === "EMPLOYEE"
    ? "Rahul Sharma"
    : role === "TRAINER"
    ? "Dr. S. Rao"
    : "Cadre Administrator";

  const displaySubtitle = user?.profile?.designation || (role === "EMPLOYEE"
    ? "Statistical Officer (NSO)"
    : role === "TRAINER"
    ? "Master Trainer (NSSTA)"
    : "MoSPI HQ • SSS Cadre");

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const content = (
    <aside
      className={`flex h-full flex-col bg-[#172554] text-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } select-none`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-blue-900/60 bg-blue-950/40">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white p-0.5 shadow-md overflow-hidden">
              <img src="/Disha_AI_Logo.svg" alt="Disha AI Logo" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                Disha AI
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  MoSPI
                </span>
              </h1>
              <p className="text-[10px] font-medium text-blue-200 truncate">
                {roleName}
              </p>
            </div>
          </Link>
        )}

        {isCollapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white p-0.5 shadow-md overflow-hidden">
            <img src="/Disha_AI_Logo.svg" alt="Disha AI Logo" className="h-full w-full object-contain" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md hover:bg-blue-800 text-blue-200 transition"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-4 scrollbar-thin scrollbar-thumb-blue-900">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== `/${role.toLowerCase()}/dashboard` && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              title={isCollapsed ? link.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white font-bold shadow-sm shadow-blue-950/40"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              />
              {!isCollapsed && (
                <span className="truncate flex-1">{link.label}</span>
              )}
              {!isCollapsed && link.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-blue-900/60 text-blue-200 border border-blue-700/50"
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Officer Profile */}
      <div className="border-t border-blue-900/60 p-3 bg-blue-950/80">
        <div
          className={`flex items-center gap-3 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 font-bold text-xs text-white border border-blue-400/40">
            {initials}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {displaySubtitle}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">{content}</div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-full">{content}</div>
        </div>
      )}
    </>
  );
}