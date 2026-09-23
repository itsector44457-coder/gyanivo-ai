"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Award, AlertTriangle, Compass, BookOpen, FileCheck2,
  TrendingUp, History, Upload, Layers, FileSpreadsheet, Sliders, Users,
  Building2, Briefcase, GitFork, BarChart3, ShieldCheck, Settings,
  ChevronLeft, ChevronRight, Bot, Cpu, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

type NavLink = { href: string; label: string; icon: React.ElementType; tag?: string };

const employeeLinks: NavLink[] = [
  { href: "/employee/dashboard",        label: "Dashboard",          icon: LayoutDashboard },
  { href: "/copilot",                   label: "AI Copilot",         icon: Bot,             tag: "AI" },
  { href: "/employee/competencies",     label: "My competencies",    icon: Award },
  { href: "/employee/skill-gaps",       label: "Skill gaps",         icon: AlertTriangle },
  { href: "/employee/learning-path",    label: "Learning path",      icon: Compass },
  { href: "/employee/courses",          label: "Courses",            icon: BookOpen },
  { href: "/employee/assessments",      label: "Assessments",        icon: FileCheck2 },
  { href: "/employee/progress",         label: "Progress",           icon: TrendingUp },
  { href: "/employee/learning-history", label: "Completed training", icon: History },
];

const trainerLinks: NavLink[] = [
  { href: "/trainer/dashboard",          label: "Dashboard",         icon: LayoutDashboard },
  { href: "/copilot",                    label: "AI Copilot",        icon: Bot,             tag: "AI" },
  { href: "/trainer/materials",          label: "Materials",         icon: Upload },
  { href: "/trainer/materials/upload",   label: "Upload PDF",        icon: Cpu,             tag: "AI" },
  { href: "/trainer/question-review",    label: "Review questions",  icon: FileSpreadsheet },
  { href: "/trainer/question-bank",      label: "Question bank",     icon: Layers },
  { href: "/trainer/assessments",        label: "Assessments",       icon: FileCheck2 },
  { href: "/trainer/assessment-builder", label: "Create assessment", icon: Sliders },
  { href: "/trainer/analytics",          label: "Performance",       icon: BarChart3 },
];

const adminLinks: NavLink[] = [
  { href: "/admin/dashboard",       label: "Dashboard",       icon: LayoutDashboard },
  { href: "/copilot",               label: "AI Copilot",      icon: Bot,             tag: "AI" },
  { href: "/admin/employees",       label: "Officers",        icon: Users },
  { href: "/admin/departments",     label: "Departments",     icon: Building2 },
  { href: "/admin/job-roles",       label: "Job roles",       icon: Briefcase },
  { href: "/admin/role-matrix",     label: "Role matrix",     icon: GitFork },
  { href: "/admin/competencies",    label: "Competencies",    icon: Award },
  { href: "/admin/skill-gaps",      label: "Skill gaps",      icon: AlertTriangle },
  { href: "/admin/courses",         label: "Courses",         icon: BookOpen },
  { href: "/admin/course-mappings", label: "Course mappings", icon: Sliders },
  { href: "/admin/assessments",     label: "Assessments",     icon: FileCheck2 },
  { href: "/admin/analytics",       label: "Analytics",       icon: BarChart3 },
  { href: "/admin/audit-logs",      label: "Audit logs",      icon: ShieldCheck },
  { href: "/admin/settings",        label: "Settings",        icon: Settings },
];

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = pathname.startsWith("/trainer") ? "TRAINER" : pathname.startsWith("/admin") ? "ADMIN" : "EMPLOYEE";
  const links = role === "TRAINER" ? trainerLinks : role === "ADMIN" ? adminLinks : employeeLinks;

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : role === "TRAINER" ? "Dr. S. Rao" : role === "ADMIN" ? "Admin" : "Rahul Sharma";
  const displaySub =
    user?.profile?.designation ||
    (role === "TRAINER" ? "Master Trainer" : role === "ADMIN" ? "MoSPI HQ" : "Statistical Officer");
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const isActive = (href: string) =>
    pathname === href || (href !== `/${role.toLowerCase()}/dashboard` && pathname.startsWith(href));

  const content = (
    <aside
      className={`flex h-full flex-col bg-[#0f1f3d] text-white transition-[width] duration-300 ease-in-out dark:bg-gray-950 dark:border-r dark:border-gray-800 ${
        isCollapsed ? "w-[60px]" : "w-60"
      }`}
    >
      {/* brand */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 px-3 dark:border-gray-800">
        {!isCollapsed && (
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <img src="/Disha_AI_Logo.png" alt="Disha AI" className="h-8 w-8 shrink-0 object-contain" />
            <div className="min-w-0 leading-none">
              <p className="text-sm font-semibold tracking-tight text-white">Disha AI</p>
              <p className="mt-0.5 text-[10px] text-white/40">
                {role === "TRAINER" ? "Trainer workspace" : role === "ADMIN" ? "Admin panel" : "Officer portal"}
              </p>
            </div>
          </Link>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <img src="/Disha_AI_Logo.png" alt="Disha AI" className="h-8 w-8 object-contain" />
          </div>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white lg:flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              title={isCollapsed ? link.label : undefined}
              className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-blue-600/90 text-white"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <Icon className={`h-[17px] w-[17px] shrink-0 ${active ? "text-white" : "text-white/50 group-hover:text-white/80"}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{link.label}</span>
                  {link.tag && (
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                      active ? "bg-white/20 text-white" : "bg-blue-500/20 text-blue-300"
                    }`}>
                      {link.tag}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* user footer */}
      <div className="shrink-0 border-t border-white/8 p-3 dark:border-gray-800">
        <div className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white dark:bg-blue-500">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-white">{displayName}</p>
              <p className="truncate text-[10px] text-white/40">{displaySub}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block shrink-0">{content}</div>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-60">{content}</div>
        </div>
      )}
    </>
  );
}
