"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Shield,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Check,
  Copy,
} from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";
import { useAuth } from "../lib/auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("employee.demo@local.test");
  const [password, setPassword] = useState("DemoPassword123!");
  const [selectedRole, setSelectedRole] = useState<"EMPLOYEE" | "TRAINER" | "ADMIN">("EMPLOYEE");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  const handlePersonaSelect = (role: "EMPLOYEE" | "TRAINER" | "ADMIN") => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === "EMPLOYEE") {
      setEmail("employee.demo@local.test");
      setPassword("DemoPassword123!");
    } else if (role === "TRAINER") {
      setEmail("trainer.demo@local.test");
      setPassword("DemoPassword123!");
    } else {
      setEmail("admin.demo@local.test");
      setPassword("DemoPassword123!");
    }
  };

  const copyCredentials = (role: string, em: string, pass: string) => {
    navigator.clipboard.writeText(`Email: ${em}\nPassword: ${pass}`);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setErrorMessage(result.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Unable to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      {/* Top Govt / MoSPI Bar */}
      <div className="bg-[#172554] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-blue-900">
        <div className="flex items-center gap-2 font-medium">
          <Shield className="h-4 w-4 text-blue-300" />
          <span>Government of India • Ministry of Statistics and Programme Implementation</span>
        </div>
        <div className="flex items-center gap-2">
          <PrototypeBadge label="SIH26101 PROTOTYPE" />
        </div>
      </div>

      {/* Main Login Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-b from-[#1E3A8A] to-[#172554] p-6 text-white text-center relative">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md mb-3">
              <Sparkles className="h-7 w-7 text-amber-300" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Sketu AI</h2>
            <p className="text-xs font-semibold text-blue-200 tracking-wider uppercase mt-0.5">
              Competency Intelligence & Assessment Platform
            </p>
            <p className="text-[11px] text-blue-100/80 mt-2 max-w-xs mx-auto leading-relaxed">
              Personalised competency development for India&apos;s Official Statistical System (MoSPI).
            </p>
          </div>

          {/* Persona Quick Selector (Development / Demo Convenience) */}
          <div className="px-6 pt-5 pb-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <KeyRound className="h-3 w-3 text-blue-600" />
                Select Role Account (One-Click Auto-Fill):
              </p>
              <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                DB-Backed
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePersonaSelect("EMPLOYEE")}
                className={`px-2.5 py-2 rounded-xl border text-left text-[11px] font-medium transition ${
                  selectedRole === "EMPLOYEE"
                    ? "bg-[#1E3A8A] text-white border-blue-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold">Rahul</div>
                <div className={`text-[10px] ${selectedRole === "EMPLOYEE" ? "text-blue-200" : "text-slate-500"}`}>
                  Employee
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSelect("TRAINER")}
                className={`px-2.5 py-2 rounded-xl border text-left text-[11px] font-medium transition ${
                  selectedRole === "TRAINER"
                    ? "bg-[#1E3A8A] text-white border-blue-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold">Dr. P. Rao</div>
                <div className={`text-[10px] ${selectedRole === "TRAINER" ? "text-blue-200" : "text-slate-500"}`}>
                  Trainer
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSelect("ADMIN")}
                className={`px-2.5 py-2 rounded-xl border text-left text-[11px] font-medium transition ${
                  selectedRole === "ADMIN"
                    ? "bg-[#1E3A8A] text-white border-blue-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="font-bold">Director</div>
                <div className={`text-[10px] ${selectedRole === "ADMIN" ? "text-blue-200" : "text-slate-500"}`}>
                  Admin
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold">{errorMessage}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium text-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium text-slate-800 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember session
              </label>
              <Link
                href="/forgot-password"
                className="font-medium text-blue-700 hover:text-blue-900"
              >
                Forgot password?
              </Link>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] text-white text-sm font-bold shadow-md hover:bg-blue-900 transition disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Sketu AI</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Security Guarantee Badge */}
            <div className="pt-2">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-[11px] text-slate-600">
                <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Enterprise Security</strong> • 256-Bit TLS • OWASP Compliant • Role-Based Access Control
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-2 text-[10px] uppercase font-bold text-slate-400">
                Or Continue With
              </span>
            </div>

            {/* Govt SSO Prototype Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  alert("Government SSO Integration: Prototype Ready. In production, this authenticates against Parichay / Jan Parichay MoSPI identity portal.");
                }}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <Shield className="h-4 w-4 text-blue-700" />
                Continue with Government SSO (Parichay)
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-200 bg-white">
        Sketu AI • National Statistical Office • Subordinate Statistical Service (SSS) & ISS Cadre Portal
      </footer>
    </div>
  );
}
