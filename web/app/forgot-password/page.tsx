"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Shield, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <div className="bg-[#172554] text-white px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-300" />
          <span>MoSPI Official Cadre Security Portal</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>

          <h2 className="text-xl font-bold text-slate-900">Reset Cadre Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your registered official email or NIC employee identifier.
          </p>

          {submitted ? (
            <div className="mt-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Password Reset Instructions Dispatched
              </div>
              <p>
                A secure OTP link has been sent to <strong>{email}</strong>. Please check your NIC government email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Email / Gov ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="officer.name@mospi.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] text-white text-sm font-bold shadow-md hover:bg-blue-900 transition"
              >
                Send Reset Link (Demo)
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-slate-500">
        Ministry of Statistics and Programme Implementation (MoSPI)
      </footer>
    </div>
  );
}
