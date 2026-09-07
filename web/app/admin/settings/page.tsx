"use client";

import React, { useState } from "react";
import { Settings, Shield, Link2, Database, Bell, Key, Check } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

const sections = [
  {
    id: "integrations",
    icon: Link2,
    title: "Integrations",
    items: [
      {
        key: "sso",
        label: "SSO (Single Sign-On)",
        description: "NIC SSO / MoSPI enterprise SSO integration",
        enabled: false,
        badge: "SSO INTEGRATION READY · PROTOTYPE",
        badgeColor: "bg-amber-100 text-amber-800",
      },
      {
        key: "igot",
        label: "iGOT Karmayogi Course API",
        description: "Live course catalogue and completion sync from iGOT platform",
        enabled: false,
        badge: "SAMPLE CATALOGUE · NOT LIVE",
        badgeColor: "bg-orange-100 text-orange-800",
      },
      {
        key: "hrms",
        label: "HRMS / NIC Employee Directory",
        description: "Employee profile sync from government HRMS",
        enabled: false,
        badge: "PROTOTYPE · DEMO DATA",
        badgeColor: "bg-amber-100 text-amber-800",
      },
    ],
  },
  {
    id: "platform",
    icon: Settings,
    title: "Platform Configuration",
    items: [
      {
        key: "ai_questions",
        label: "AI Question Generation",
        description: "Automatically generate assessment questions from uploaded training materials",
        enabled: true,
        badge: null,
        badgeColor: "",
      },
      {
        key: "human_review",
        label: "Mandatory Human-in-Loop Review",
        description: "All AI-generated questions require trainer approval before publishing",
        enabled: true,
        badge: null,
        badgeColor: "",
      },
      {
        key: "adaptive",
        label: "Adaptive Assessment Engine",
        description: "Dynamically adjust question difficulty based on officer performance",
        enabled: true,
        badge: null,
        badgeColor: "",
      },
      {
        key: "notifications",
        label: "Email / SMS Notifications",
        description: "Send assessment reminders and completion alerts to officers",
        enabled: false,
        badge: null,
        badgeColor: "",
      },
    ],
  },
  {
    id: "security",
    icon: Shield,
    title: "Security & Compliance",
    items: [
      {
        key: "audit_trail",
        label: "Immutable Audit Trail",
        description: "Log all framework changes, competency updates, and admin actions",
        enabled: true,
        badge: null,
        badgeColor: "",
      },
      {
        key: "data_residency",
        label: "Data Residency (India Only)",
        description: "All data stored within NIC India-hosted cloud infrastructure",
        enabled: true,
        badge: null,
        badgeColor: "",
      },
    ],
  },
];

export default function AdminSettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((s) => s.items.forEach((item) => { initial[item.key] = item.enabled; }));
    return initial;
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: string) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">System Settings</h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">Platform configuration, integration toggles, and security settings for MoSPI admins</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${saved ? "bg-emerald-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          {saved ? <><Check className="w-4 h-4" /> Saved</> : "Save Settings"}
        </button>
      </div>

      {/* Integration notice banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-900">Prototype Demo Mode</p>
          <p className="text-xs text-amber-700 mt-0.5">
            This is a SIH26101 demonstration build. SSO, iGOT, and HRMS integrations are architecture-ready but not live. All employee data is prototype demo data only.
          </p>
        </div>
      </div>

      {sections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div key={section.id} className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
              <SectionIcon className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-800">{section.title}</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {section.items.map((item) => (
                <div key={item.key} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      {item.badge && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                  <button
                    onClick={() => toggle(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${toggles[item.key] ? "bg-blue-600" : "bg-slate-200"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggles[item.key] ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Version info */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800">System Information</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div><p className="text-slate-500">Platform</p><p className="font-bold text-slate-800">Gyanivo AI v1.0</p></div>
          <div><p className="text-slate-500">SIH Problem</p><p className="font-bold text-slate-800">SIH26101</p></div>
          <div><p className="text-slate-500">Ministry</p><p className="font-bold text-slate-800">MoSPI</p></div>
          <div><p className="text-slate-500">Build Type</p><p className="font-bold text-amber-700">Prototype Demo</p></div>
        </div>
      </div>
    </div>
  );
}
