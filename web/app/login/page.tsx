"use client";

import { FormEvent, useState } from "react";
import type { ElementType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

type Role = "employee" | "trainer" | "admin";

type LoginResponse = {
  success?: boolean;
  accessToken?: string;
  user?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    systemRole?: string;
  };
  message?: string | string[];
};

const roles = [
  {
    id: "employee" as Role,
    label: "Employee",
    description: "Learn & assess",
    icon: Users,
    defaultEmail: "employee.demo@local.test",
  },
  {
    id: "trainer" as Role,
    label: "Trainer",
    description: "Create & evaluate",
    icon: GraduationCap,
    defaultEmail: "trainer.demo@local.test",
  },
  {
    id: "admin" as Role,
    label: "Admin",
    description: "Manage system",
    icon: UserCog,
    defaultEmail: "admin.demo@local.test",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("employee");
  const [email, setEmail] = useState("employee.demo@local.test");
  const [password, setPassword] = useState("DemoPassword123!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (selected: Role) => {
    setRole(selected);
    setError("");
    const found = roles.find((r) => r.id === selected);
    if (found) {
      setEmail(found.defaultEmail);
      setPassword("DemoPassword123!");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) { setError("Please enter your email address."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    try {
      setLoading(true);
      const rawApiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000";
      const apiUrl = rawApiUrl.replace(/\/+$/, "");

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data: LoginResponse | null = await response.json().catch(() => null);

      if (!response.ok) {
        let msg = "Login failed. Please check your credentials.";
        if (Array.isArray(data?.message)) msg = data.message.join(", ");
        else if (typeof data?.message === "string") msg = data.message;
        throw new Error(msg);
      }

      if (!data?.accessToken) throw new Error("No access token returned.");
      if (!data?.user?.systemRole) throw new Error("User role not returned.");

      if (typeof window !== "undefined") {
        localStorage.setItem("gyanivo_access_token", data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
      }

      const serverRole = data.user.systemRole.trim().toUpperCase();
      if (serverRole === "EMPLOYEE") { router.replace("/employee/dashboard"); return; }
      if (serverRole === "TRAINER") { router.replace("/trainer/dashboard"); return; }
      if (serverRole === "ADMIN" || serverRole === "SUPER_ADMIN") { router.replace("/admin/dashboard"); return; }
      throw new Error(`Unsupported account role: ${serverRole}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGovernmentSSO = () => {
    setError("Government SSO isn't connected yet. Please use the demo credentials for now.");
  };

  return (
    <main className="relative min-h-screen bg-[#f9fafb] dark:bg-gray-950">

      {/* ambient blobs */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-100/40 blur-[120px] dark:bg-blue-500/10" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-indigo-100/40 blur-[120px] dark:bg-indigo-500/10" />

      {/* ── top bar ── */}
      <div className="relative z-10 border-b border-gray-200/70 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center">
              <img src="/Disha_AI_Logo.png" alt="Disha AI" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="text-[17px] font-bold tracking-tight text-gray-950 dark:text-white">
                Disha<span className="ml-0.5 text-blue-600 dark:text-blue-400">AI</span>
              </span>
              <p className="hidden text-[9px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600 sm:block">
                Skill · Learn · Grow
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1 dark:border-blue-500/20 dark:bg-blue-500/10">
              <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300">SIH26101</span>
            </div>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-500">
              Ministry of Statistics · Govt. of India
            </p>
            <span className="text-base">🇮🇳</span>
          </div>
        </div>
      </div>

      {/* ── page grid ── */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl lg:grid-cols-2 dark:bg-gray-950">

        {/* ══ LEFT — editorial panel ══ */}
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center">
          <div className="absolute inset-8 overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=90"
              alt="India"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c1f4a]/92 via-[#0d2d6e]/75 to-blue-600/30" />
          </div>

          <div className="relative z-10 px-16 py-14">

            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-medium text-blue-100 backdrop-blur-sm">
              AI for India's Official Statistical System
            </div>

            <h1 className="max-w-md text-4xl font-bold leading-tight text-white xl:text-5xl">
              Build skills.
              <br />
              <span className="serif italic text-blue-200">Bridge gaps.</span>
              <br />
              Empower India.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-blue-100/80">
              An AI-enabled competency development platform designed for
              every official in India's statistical system.
            </p>

            {/* feature grid */}
            <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
              <PanelFeature icon={BarChart3} title="Skill gap analysis" text="Know exactly where to improve." />
              <PanelFeature icon={BrainCircuit} title="Adaptive learning" text="Courses that adjust to you." />
              <PanelFeature icon={GraduationCap} title="iGOT Karmayogi" text="Role-based recommendations." />
              <PanelFeature icon={CheckCircle2} title="Track growth" text="Measure real competency gains." />
            </div>

            {/* quote card */}
            <div className="mt-10 max-w-sm rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
              <p className="text-sm font-medium leading-relaxed text-white/90">
                "Better data starts with better people."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-px w-6 bg-blue-300/50" />
                <p className="text-[11px] text-blue-200">Disha AI Platform Vision</p>
              </div>
            </div>

          </div>
        </section>

        {/* ══ RIGHT — login form ══ */}
        <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14 dark:bg-gray-950">
          <div className="w-full max-w-[440px]">

            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 transition hover:text-gray-700 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>

            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Sign in to continue your competency journey.
              </p>
            </div>

            {/* role selector */}
            <div className="mt-8">
              <p className="mb-2.5 text-xs font-semibold text-gray-600 dark:text-gray-400">Sign in as</p>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((item) => {
                  const Icon = item.icon;
                  const active = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRoleChange(item.id)}
                      className={`relative rounded-xl border p-3 text-left transition-all ${
                        active
                          ? "border-blue-500 bg-blue-50/80 shadow-sm dark:border-blue-500 dark:bg-blue-500/10"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                      }`}
                    >
                      {active && (
                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                      )}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        active ? "bg-blue-600 text-white dark:bg-blue-500" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className={`mt-2.5 text-xs font-semibold ${
                        active ? "text-blue-800 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {item.label}
                      </p>
                      <p className="mt-0.5 hidden text-[10px] text-gray-400 dark:text-gray-600 sm:block">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">

              {/* email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Official email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="your@email.gov.in"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[11px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* remember + secure */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-blue-600 dark:border-gray-600"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Remember me</span>
                </label>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure
                </span>
              </div>

              {/* error */}
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in as {roles.find((r) => r.id === role)?.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

            </form>

            {/* divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">or</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>

            {/* gov SSO */}
            <button
              type="button"
              onClick={handleGovernmentSSO}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700"
            >
              <span className="text-lg">🇮🇳</span>
              Continue with Government SSO
            </button>

            {/* info notice */}
            <div className="mt-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Authorised access only</p>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-gray-500">
                  This platform is for authorised employees, trainers and administrators
                  of India's Official Statistical System.
                </p>
              </div>
            </div>

            {/* footer note */}
            <p className="mt-7 text-center text-[11px] leading-5 text-gray-400 dark:text-gray-600">
              By signing in you agree to our{" "}
              <Link href="/terms" className="font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">Privacy Policy</Link>.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}

/* ── left panel feature card ──────────────────────── */

function PanelFeature({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/8 p-3.5 backdrop-blur-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-4 w-4 text-blue-200" />
      </div>
      <div>
        <p className="text-xs font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-blue-100/60">{text}</p>
      </div>
    </div>
  );
}
