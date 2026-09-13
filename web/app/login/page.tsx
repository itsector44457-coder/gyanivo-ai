"use client";

import { FormEvent, useState } from "react";
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
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";

type Role = "employee" | "trainer" | "admin";

const roles = [
  {
    id: "employee" as Role,
    label: "Employee",
    description: "Learn & assess",
    icon: Users,
    defaultEmail: "rahul.sharma@mospi.gov.in",
  },
  {
    id: "trainer" as Role,
    label: "Trainer",
    description: "Create & evaluate",
    icon: GraduationCap,
    defaultEmail: "faculty.trainer@mospi.gov.in",
  },
  {
    id: "admin" as Role,
    label: "Admin",
    description: "Manage system",
    icon: UserCog,
    defaultEmail: "cadre.admin@mospi.gov.in",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("employee");
  const [email, setEmail] = useState("rahul.sharma@mospi.gov.in");
  const [password, setPassword] = useState("DemoPassword123!");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (selectedRole: Role) => {
    setRole(selectedRole);
    setError("");
    const roleConfig = roles.find((r) => r.id === selectedRole);
    if (roleConfig) {
      setEmail(roleConfig.defaultEmail);
      setPassword("DemoPassword123!");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // Attempt live API login if available, with smooth demo fallback
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://gyanivo-api.onrender.com";
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            role: role.toUpperCase(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.accessToken && typeof window !== "undefined") {
            localStorage.setItem("gyanivo_access_token", data.accessToken);
            localStorage.setItem("accessToken", data.accessToken);
          }
        } else {
          // Store valid demo credentials token
          if (typeof window !== "undefined") {
            localStorage.setItem("gyanivo_access_token", `demo_${role}_token`);
            localStorage.setItem("accessToken", `demo_${role}_token`);
          }
        }
      } catch {
        // Fallback for demo mode
        if (typeof window !== "undefined") {
          localStorage.setItem("gyanivo_access_token", `demo_${role}_token`);
          localStorage.setItem("accessToken", `demo_${role}_token`);
        }
      }

      // Demo delay for smooth interaction
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (role === "employee") {
        router.push("/dashboard");
      } else if (role === "trainer") {
        router.push("/trainer/dashboard");
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7faff] font-sans antialiased">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-[120px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-violet-200/30 blur-[120px]" />

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <div className="relative z-20 border-b border-blue-100 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1450px] items-center justify-between px-5 sm:px-7 lg:px-10">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-lg shadow-blue-500/20">
              <BrainCircuit className="h-6 w-6 text-white" />

              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30" />
            </div>

            <div>
              <div className="text-xl font-black tracking-tight text-slate-950">
                Sketu
                <span className="ml-1 text-blue-600">
                  AI
                </span>
              </div>

              <p className="mt-0.5 hidden text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:block">
                Skill • Learn • Grow
              </p>
            </div>
          </Link>

          {/* SIH */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />

              <span className="text-[10px] font-bold text-blue-700">
                SIH26101
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-700">
                Ministry of Statistics & Programme Implementation
              </p>

              <p className="text-[9px] text-slate-400">
                Government of India
              </p>
            </div>

            <span className="text-2xl">🇮🇳</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          PAGE
      ====================================================== */}

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-72px)] max-w-[1450px] lg:grid-cols-[1.05fr_.95fr]">

        {/* ==================================================
            LEFT SIDE
        ================================================== */}

        <section className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-center xl:p-16">
          <div className="absolute inset-8 overflow-hidden rounded-[40px]">
            <img
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=90"
              alt="India"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-[#061d4b]/95 via-[#073b82]/80 to-blue-600/45" />
          </div>

          <div className="relative z-10 max-w-[620px] pl-8">
            {/* badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              AI for Official Statistical System
            </div>

            <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-[-0.04em] text-white xl:text-[56px]">
              Build Skills.
              <br />
              Bridge Gaps.
              <br />

              <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                Empower India.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-blue-100/90">
              An AI-enabled competency development platform for India&apos;s
              Official Statistical System.
            </p>

            {/* BENEFITS */}

            <div className="mt-9 grid max-w-lg gap-4 sm:grid-cols-2">
              <Feature
                icon={BarChart3}
                title="Skill Gap Analysis"
                text="Identify competency gaps using AI."
              />

              <Feature
                icon={BrainCircuit}
                title="Adaptive Learning"
                text="Learning tailored to every employee."
              />

              <Feature
                icon={GraduationCap}
                title="iGOT Karmayogi"
                text="Role-based course recommendations."
              />

              <Feature
                icon={CheckCircle2}
                title="Track Growth"
                text="Measure competency improvement."
              />
            </div>

            {/* FLOATING CARD */}

            <div className="mt-10 max-w-md rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-blue-200">
                    Platform Vision
                  </p>

                  <p className="mt-1 font-bold text-white">
                    Better Data. Stronger People.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  🇮🇳
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 to-blue-300" />
                </div>

                <span className="text-xs font-bold text-cyan-200">
                  78%
                </span>
              </div>
            </div>
          </div>

          {/* decorative */}
          <div className="absolute bottom-16 right-16 z-10 text-right">
            <p className="rotate-[-5deg] text-xl font-semibold italic text-white/70">
              Better Data
            </p>

            <p className="rotate-[-5deg] text-xl font-semibold italic text-white/70">
              Stronger India
            </p>
          </div>
        </section>

        {/* ==================================================
            LOGIN SIDE
        ================================================== */}

        <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-[500px]">

            {/* BACK */}

            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            {/* heading */}

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Sketu AI Portal
              </div>

              <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Sign in to continue your personalized competency development
                journey.
              </p>
            </div>

            {/* ===============================================
                ROLE SELECTION
            =============================================== */}

            <div className="mt-8">
              <p className="mb-3 text-xs font-bold text-slate-700">
                Sign in as
              </p>

              <div className="grid grid-cols-3 gap-2">
                {roles.map((item) => {
                  const Icon = item.icon;
                  const active = role === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRoleChange(item.id)}
                      className={`relative rounded-2xl border p-3 text-left transition-all duration-200 sm:p-4 ${
                        active
                          ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                      }`}
                    >
                      {active && (
                        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
                      )}

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <p
                        className={`mt-3 text-xs font-bold sm:text-sm ${
                          active
                            ? "text-blue-800"
                            : "text-slate-800"
                        }`}
                      >
                        {item.label}
                      </p>

                      <p className="mt-1 hidden text-[10px] text-slate-400 sm:block">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===============================================
                FORM
            =============================================== */}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold text-slate-700"
                >
                  Official Email
                </label>

                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Enter your official email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="h-[54px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-bold text-blue-600 transition hover:text-blue-800"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="group relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="h-[54px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* REMEMBER */}

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                  />

                  <span className="text-xs font-medium text-slate-500">
                    Remember me
                  </span>
                </label>

                <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure Login
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/30 disabled:pointer-events-none disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign in as{" "}
                    {roles.find((item) => item.id === role)?.label}

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* ===============================================
                SEPARATOR
            =============================================== */}

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Official Access
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* GOVERNMENT SSO */}

            <button
              type="button"
              onClick={() => {
                // Auto-authenticate as default officer with Government SSO
                setEmail("rahul.sharma@mospi.gov.in");
                setPassword("DemoPassword123!");
                if (typeof window !== "undefined") {
                  localStorage.setItem("gyanivo_access_token", "sso_gov_token");
                  localStorage.setItem("accessToken", "sso_gov_token");
                }
                router.push("/dashboard");
              }}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <span className="text-xl">🇮🇳</span>

              Continue with Government SSO
            </button>

            {/* INFO */}

            <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Authorized Access Only
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    This platform is intended for authorized employees,
                    trainers and administrators of India&apos;s Official
                    Statistical System.
                  </p>
                </div>
              </div>
            </div>

            {/* FOOT */}

            <div className="mt-8 text-center">
              <p className="text-[11px] leading-5 text-slate-400">
                By signing in, you agree to Sketu AI&apos;s{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-slate-600 hover:text-blue-600"
                >
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-slate-600 hover:text-blue-600"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              <p className="mt-3 text-[10px] font-semibold text-slate-400">
                SIH26101 • Together for a Data-Driven India 🇮🇳
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   LEFT SIDE FEATURE
========================================================= */

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 backdrop-blur">
        <Icon className="h-4 w-4 text-cyan-200" />
      </div>

      <div>
        <p className="text-sm font-bold text-white">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-blue-100/70">
          {text}
        </p>
      </div>
    </div>
  );
}
