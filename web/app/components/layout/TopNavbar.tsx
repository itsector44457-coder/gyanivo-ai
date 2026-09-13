"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  CheckCheck,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Info,
} from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { RoleSwitcher } from "./RoleSwitcher";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth/AuthContext";

interface TopNavbarProps {
  onToggleMobileSidebar: () => void;
}

export function TopNavbar({ onToggleMobileSidebar }: TopNavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Assessment Assigned",
      desc: "GIS Post Training Assessment (12 questions) is scheduled for NSO cadre.",
      time: "10 mins ago",
      icon: <BookOpen className="h-4 w-4 text-blue-600" />,
      read: false,
      href: "/employee/assessments",
    },
    {
      id: 2,
      title: "Priority Training Recommended",
      desc: "GIS Fundamentals course recommended based on 35-point detected competency gap.",
      time: "2 hours ago",
      icon: <TrendingUp className="h-4 w-4 text-amber-600" />,
      read: false,
      href: "/employee/courses",
    },
    {
      id: 3,
      title: "Competency Index Recalculated",
      desc: "Python for Data Analysis increased to 38 (+4) following practice module.",
      time: "1 day ago",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      read: false,
      href: "/employee/competencies",
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Rahul Sharma";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const displayRole = user?.profile?.designation || (user?.systemRole === "ADMIN" ? "MoSPI HQ Administrator" : user?.systemRole === "TRAINER" ? "NSSTA Faculty" : "Statistical Officer (NSO)");

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
        {/* Left Section: Mobile Menu Trigger + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Breadcrumbs />
        </div>

        {/* Center / Search Section */}
        <div className="hidden md:flex items-center max-w-md w-full mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search competencies, courses, assessments, official guidelines..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 transition"
            />
          </div>
        </div>

        {/* Right Section: Actions, Notifications, Role, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Persona Switcher for Hackathon Demo */}
          <RoleSwitcher />

          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            title="MoSPI Platform Guide & Architecture"
            aria-label="Help and documentation"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">
                        Official Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <CheckCheck className="h-3 w-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-1">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => setShowNotifications(false)}
                        className={`flex gap-3 p-2.5 rounded-lg text-left transition hover:bg-slate-50 ${
                          !n.read ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">{n.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 leading-snug">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                            {n.desc}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-2 mt-2 text-center">
                    <Link
                      href="/employee/assessments"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      View All Official Updates →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 transition"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E3A8A] text-xs font-bold text-white shadow-2xs">
                {initials}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <p className="font-bold text-slate-900 leading-tight">{displayName}</p>
                <p className="text-[10px] text-slate-500">{displayRole}</p>
              </div>
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{displayName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{user?.email || "MOSPI-NSO-8842"}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      {user?.systemRole ? `System Role: ${user.systemRole}` : "Subordinate Statistical Service"}
                    </p>
                  </div>

                  <Link
                    href="/employee/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition"
                  >
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    My Officer Profile
                  </Link>

                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-500" />
                    System Settings
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={async () => {
                      setShowProfileMenu(false);
                      await logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Help Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Sketu AI — Platform Guidance"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-blue-900">
              <Info className="h-4 w-4 text-blue-700" />
              Smart India Hackathon 2026 • PS SIH26101
            </p>
            <p className="text-[11px] leading-relaxed">
              Ministry of Statistics and Programme Implementation (MoSPI) — AI-enabled Competency
              Intelligence, Adaptive Skill-Gap Analytics and Learning Platform.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1.5">
              The 8-Stage Competency Intelligence Cycle:
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-slate-700">
              <li><strong>Role Definition & Benchmarks:</strong> Cadre-level proficiency targets.</li>
              <li><strong>Diagnostic Assessment:</strong> Initial baseline evaluation.</li>
              <li><strong>Competency Scoring:</strong> Multi-domain profiling (Statistical, Technical, Governance).</li>
              <li><strong>Skill Gap Detection:</strong> Delta analysis against role benchmarks.</li>
              <li><strong>Targeted Recommendation:</strong> iGOT Karmayogi & NSSTA module matching.</li>
              <li><strong>Adaptive Learning:</strong> Dynamic progression based on mastery.</li>
              <li><strong>Evaluation & Verification:</strong> Pre vs post-training score lift.</li>
              <li><strong>Competency Update:</strong> Continuous closed-loop evolution.</li>
            </ol>
          </div>
        </div>
      </Modal>
    </>
  );
}
