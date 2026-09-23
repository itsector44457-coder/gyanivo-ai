"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  CheckCheck,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { RoleSwitcher } from "./RoleSwitcher";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTheme } from "@/lib/theme/ThemeProvider";

interface TopNavbarProps {
  onToggleMobileSidebar: () => void;
}

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "New assessment assigned",
    desc: "GIS Post Training Assessment (12 questions) is ready for you.",
    time: "10 min ago",
    icon: BookOpen,
    iconColor: "text-blue-500",
    read: false,
    href: "/employee/assessments",
  },
  {
    id: 2,
    title: "Course recommended",
    desc: "GIS Fundamentals flagged based on a 35-point competency gap.",
    time: "2 hours ago",
    icon: TrendingUp,
    iconColor: "text-amber-500",
    read: false,
    href: "/employee/courses",
  },
  {
    id: 3,
    title: "Competency score updated",
    desc: "Python for Data Analysis increased to 38 (+4) after your last session.",
    time: "Yesterday",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    read: true,
    href: "/employee/competencies",
  },
];

export function TopNavbar({ onToggleMobileSidebar }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Rahul Sharma";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const displayRole =
    user?.profile?.designation ||
    (user?.systemRole === "ADMIN" ? "Administrator"
      : user?.systemRole === "TRAINER" ? "Trainer"
      : "Statistical Officer");

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-5 dark:border-gray-700 dark:bg-gray-900">

      {/* left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <Breadcrumbs />
      </div>

      {/* center search */}
      <div className="mx-4 hidden max-w-sm flex-1 md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search competencies, courses, assessments…"
            className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-[13px] text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-600 dark:focus:border-blue-500 dark:focus:bg-gray-800 dark:focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* right */}
      <div className="flex items-center gap-1">
        <RoleSwitcher />

        {/* theme toggle */}
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
            )}
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
                    {unread > 0 && (
                      <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                        {unread} new
                      </span>
                    )}
                  </div>
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-64 divide-y divide-gray-50 overflow-y-auto dark:divide-gray-800">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => setShowNotifs(false)}
                        className={`flex gap-3 px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          !n.read ? "bg-blue-50/40 dark:bg-blue-500/5" : ""
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 ${n.iconColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold leading-snug text-gray-900 dark:text-gray-100">
                            {n.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500 dark:text-gray-400">
                            {n.desc}
                          </p>
                          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-600">{n.time}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 px-4 py-2.5 text-center dark:border-gray-800">
                  <Link
                    href="/employee/assessments"
                    onClick={() => setShowNotifs(false)}
                    className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    See all updates →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white dark:bg-blue-500">
              {initials}
            </div>
            <div className="hidden text-left xl:block">
              <p className="text-[12px] font-semibold leading-tight text-gray-900 dark:text-gray-100">{displayName}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">{displayRole}</p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-gray-400 dark:text-gray-600 xl:block" />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                <div className="border-b border-gray-100 px-3 pb-2.5 pt-1 dark:border-gray-800">
                  <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100">{displayName}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{user?.email || "—"}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/employee/profile"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <User className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
                    My profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Settings className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-gray-100 pt-1 dark:border-gray-800">
                  <button
                    onClick={async () => { setShowProfile(false); await logout(); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
