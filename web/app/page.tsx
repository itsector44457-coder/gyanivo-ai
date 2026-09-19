"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileQuestion,
  GraduationCap,
  LineChart,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCog,
  Users,
  WandSparkles,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Competency Gap Detection",
    description:
      "Identify role-wise skill gaps using competency frameworks and diagnostic assessments.",
  },
  {
    icon: Target,
    title: "Personalized Learning Path",
    description:
      "AI creates an individual learning journey based on role, competency and current skill level.",
  },
  {
    icon: GraduationCap,
    title: "iGOT Karmayogi Integration",
    description:
      "Recommend relevant courses and learning resources aligned with competency gaps.",
  },
  {
    icon: BrainCircuit,
    title: "Adaptive Assessments",
    description:
      "Question difficulty automatically adapts according to learner performance.",
  },
  {
    icon: FileQuestion,
    title: "AI Quiz Generation",
    description:
      "Generate MCQs and assessments from training manuals, PDFs and learning material.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Track competency improvement, learning progress, scores and certification status.",
  },
];

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Assess",
    description: "Take a diagnostic assessment to understand current competency.",
  },
  {
    number: "02",
    icon: Search,
    title: "Detect Skill Gaps",
    description: "AI compares current proficiency with required role competencies.",
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Learn",
    description: "Get personalized learning and iGOT Karmayogi recommendations.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track Progress",
    description: "Measure improvement through adaptive assessments and analytics.",
  },
];

const roles = [
  {
    icon: Users,
    title: "Employee",
    description:
      "Assess skills, discover gaps and follow a personalized learning journey.",
    link: "/dashboard",
    button: "Employee Portal",
  },
  {
    icon: GraduationCap,
    title: "Trainer",
    description:
      "Upload materials, generate AI questions and monitor learner performance.",
    link: "/trainer",
    button: "Trainer Portal",
  },
  {
    icon: UserCog,
    title: "Administrator",
    description:
      "Manage competency frameworks, users, learning resources and analytics.",
    link: "/admin",
    button: "Admin Portal",
  },
];

const stats = [
  { value: "10,000+", label: "Officials Empowered" },
  { value: "25,000+", label: "Competency Assessments" },
  { value: "8,500+", label: "Learning Paths" },
  { value: "60%", label: "Learning Improvement" },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden bg-white text-slate-900 font-sans antialiased">

        {/* =========================================================
            HERO
        ========================================================= */}

        <section className="relative overflow-hidden bg-gradient-to-br from-[#f7fbff] via-white to-[#eef7ff]">
          {/* background blobs */}
          <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1450px] gap-14 px-5 py-16 sm:px-7 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-24">

            {/* LEFT */}
            <div className="flex flex-col justify-center">

              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
                <Sparkles className="h-4 w-4" />
                SIH26101
                <span className="h-1 w-1 rounded-full bg-blue-400" />
                AI for Official Statistical System
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[65px]">
                AI-Enabled Competency
                <span className="block bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Building for India&apos;s
                </span>
                Official Statistical System
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Identify competency gaps, deliver personalized learning,
                conduct adaptive assessments and build a future-ready
                statistical workforce using AI.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-1"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/how-it-works"
                  className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 py-3.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                    <Play className="h-3.5 w-3.5 fill-blue-700" />
                  </span>
                  See How It Works
                </Link>
              </div>

              <div className="mt-9 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  "Role Based",
                  "AI Powered",
                  "iGOT Aligned",
                  "Data Driven",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-600"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT HERO */}
            <div className="relative flex items-center justify-center">

              <div className="relative w-full max-w-[650px]">

                {/* IMAGE */}
                <div className="overflow-hidden rounded-[34px] border border-white bg-white p-2 shadow-[0_30px_100px_rgba(37,99,235,.16)]">
                  <img
                    src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=85"
                    alt="India"
                    className="h-[470px] w-full rounded-[28px] object-cover"
                  />

                  <div className="absolute inset-2 rounded-[28px] bg-gradient-to-t from-[#061b47]/80 via-[#061b47]/10 to-transparent" />

                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
                      Building a Data-Driven India
                    </p>

                    <h3 className="mt-2 max-w-sm text-2xl font-black text-white">
                      Better Data. Stronger People. Smarter Decisions.
                    </h3>
                  </div>
                </div>

                {/* competency card */}
                <div className="absolute -left-6 top-10 hidden w-56 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-xl backdrop-blur lg:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Competency Score
                      </p>
                      <p className="text-xl font-black text-slate-900">
                        72%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" />
                  </div>
                </div>

                {/* skill gap card */}
                <div className="absolute -right-5 top-28 hidden rounded-2xl bg-white p-4 shadow-xl lg:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                      <Search className="h-4 w-4 text-red-500" />
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500">Detected</p>
                      <p className="text-sm font-bold text-slate-900">
                        5 Skill Gaps
                      </p>
                    </div>
                  </div>
                </div>

                {/* recommendation */}
                <div className="absolute -bottom-7 left-16 hidden w-[330px] rounded-3xl border border-blue-100 bg-white p-5 shadow-2xl sm:block">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        AI Recommendation
                      </p>
                      <p className="font-bold text-slate-900">
                        Advanced Survey Methods
                      </p>
                    </div>

                    <WandSparkles className="h-5 w-5 text-violet-600" />
                  </div>

                  <div className="flex gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">
                      iGOT Karmayogi
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                      Recommended
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PROBLEM + SOLUTION
        ========================================================= */}

        <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">
          <div className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 lg:grid-cols-2">

            <div className="p-7 lg:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                The Challenge
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Building statistical capability is not one-size-fits-all.
              </h2>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ["Skill Gaps", "Changing data needs require new-age skills."],
                  [
                    "Generic Training",
                    "Same training cannot solve role-specific gaps.",
                  ],
                  [
                    "Limited Assessment",
                    "Traditional assessments provide limited visibility.",
                  ],
                  [
                    "Disconnected Learning",
                    "Training and competency systems work separately.",
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-7 text-white lg:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
                How Disha AI Solves It
              </p>

              <h2 className="mt-3 text-3xl font-black">
                From skill gaps to measurable competency growth.
              </h2>

              <div className="mt-8 space-y-5">
                {[
                  "AI-powered competency gap analysis",
                  "Role-based personalized learning recommendations",
                  "Adaptive assessments based on learner performance",
                  "AI-generated MCQs from training materials",
                  "iGOT Karmayogi aligned learning paths",
                  "Continuous competency & progress analytics",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Check className="h-4 w-4" />
                    </div>

                    <p className="text-sm font-medium text-blue-50">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            FEATURES
        ========================================================= */}

        <section className="bg-[#f8fbff] py-20">
          <div className="mx-auto max-w-[1450px] px-5 sm:px-7 lg:px-10">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
                  Key Features
                </span>

                <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                  One intelligent platform for continuous competency development
                </h2>
              </div>

              <Link
                href="/features"
                className="flex w-fit items-center gap-2 text-sm font-bold text-blue-700"
              >
                Explore All Features
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group rounded-[26px] border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100"
                  >
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>

                    <h3 className="mt-5 text-lg font-black">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {feature.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600 opacity-0 transition group-hover:opacity-100">
                      Learn More
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* =========================================================
            HOW IT WORKS
        ========================================================= */}

        <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
              How It Works
            </span>

            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-4xl">
              A smarter journey from assessment to competency
            </h2>
          </div>

          <div className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <div className="absolute left-[12%] right-[12%] top-10 hidden h-px bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 lg:block" />

            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative rounded-[26px] border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span className="absolute right-6 top-5 text-4xl font-black text-slate-100">
                    {step.number}
                  </span>

                  <h3 className="mt-6 text-lg font-black">{step.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

        </section>

        {/* =========================================================
            ROLE BASED PORTAL
        ========================================================= */}

        <section className="bg-gradient-to-b from-white to-blue-50 py-20">
          <div className="mx-auto max-w-[1450px] px-5 sm:px-7 lg:px-10">

            <div>
              <span className="text-sm font-bold uppercase tracking-[0.22em] text-violet-600">
                Role Based Experience
              </span>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                One platform. Different experiences.
              </h2>

              <p className="mt-3 max-w-2xl text-slate-500">
                Every stakeholder gets tools designed specifically for their role
                in the Official Statistical System.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {roles.map((role, index) => {
                const Icon = role.icon;

                return (
                  <div
                    key={role.title}
                    className="rounded-[30px] border border-white bg-white p-7 shadow-xl shadow-blue-100/60"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                          index === 0
                            ? "bg-blue-100 text-blue-600"
                            : index === 1
                            ? "bg-violet-100 text-violet-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <span className="text-xs font-bold text-slate-300">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-black">{role.title}</h3>

                    <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-500">
                      {role.description}
                    </p>

                    <Link
                      href={role.link}
                      className="mt-7 flex items-center gap-2 text-sm font-bold text-blue-700"
                    >
                      Explore {role.button}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* =========================================================
            DASHBOARD PREVIEW
        ========================================================= */}

        <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

          <div className="grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">

            <div>
              <span className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
                AI-Powered Analytics
              </span>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Turn assessments into meaningful competency insights.
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-500">
                Disha AI continuously analyzes competency scores, learning
                activities and assessments to highlight strengths, gaps and
                improvement areas.
              </p>

              <div className="mt-7 space-y-4">
                {[
                  "Competency-wise proficiency tracking",
                  "Skill gap severity analysis",
                  "Learning recommendation engine",
                  "Assessment score trends",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/analytics"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                View Analytics
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* FAKE DASHBOARD */}
            <div className="rounded-[32px] border border-blue-100 bg-[#f8fbff] p-4 shadow-2xl shadow-blue-100 sm:p-6">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">
                    Employee Competency Dashboard
                  </p>

                  <h3 className="mt-1 font-black">
                    Data Analyst • NSO
                  </h3>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                  Active Learner
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-xs text-slate-500">Overall Competency</p>
                  <p className="mt-3 text-3xl font-black text-blue-700">72%</p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[72%] rounded-full bg-blue-600" />
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-xs text-slate-500">Skill Gaps</p>
                  <p className="mt-3 text-3xl font-black text-red-500">5</p>
                  <p className="mt-2 text-xs text-slate-400">
                    2 high priority
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-xs text-slate-500">Learning Progress</p>
                  <p className="mt-3 text-3xl font-black text-emerald-500">
                    60%
                  </p>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[60%] rounded-full bg-emerald-500" />
                  </div>
                </div>

              </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h4 className="text-sm font-black">Competency Areas</h4>
                  <LineChart className="h-5 w-5 text-blue-600" />
                </div>

                {[
                  ["Statistical Methods", "78%"],
                  ["Data Analysis", "65%"],
                  ["Survey & Sampling", "52%"],
                  ["Data Management", "80%"],
                  ["Data Visualization", "68%"],
                ].map(([name, score]) => (
                  <div key={name} className="mb-4">
                    <div className="mb-2 flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">
                        {name}
                      </span>
                      <span className="font-bold">{score}</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                        style={{
                          width: score,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h4 className="text-sm font-black">
                  Recommended Learning
                </h4>

                {[
                  "Advanced Survey Methods",
                  "Data Quality Assurance",
                  "Data Visualisation",
                ].map((course) => (
                  <div
                    key={course}
                    className="mt-4 rounded-xl border border-slate-100 p-4"
                  >
                    <p className="text-xs font-bold">{course}</p>
                    <p className="mt-1 text-[10px] text-blue-600">
                      iGOT Karmayogi
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          IMPACT
      ========================================================= */}

      <section className="bg-[#071d49] py-16 text-white">
        <div className="mx-auto max-w-[1450px] px-5 sm:px-7 lg:px-10">

          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
              Our Impact
            </span>

            <h2 className="mt-3 text-3xl font-black">
              Building a more competent statistical workforce
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 text-center backdrop-blur"
              >
                <p className="text-3xl font-black text-white sm:text-4xl">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs font-medium text-blue-200 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}

      <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 px-7 py-12 text-white sm:px-12 lg:px-16">

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                <ShieldCheck className="h-4 w-4" />
                SIH26101
              </div>

              <h2 className="mt-4 max-w-3xl text-3xl font-black sm:text-4xl">
                Ready to modernize statistical workforce learning?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100">
                Assess. Learn. Improve. Build a stronger data-driven India
                with Disha AI.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700"
              >
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/about"
                className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white"
              >
                Learn More
              </Link>
            </div>

          </div>
        </div>

      </section>

      </main>
      <Footer />
    </>
  );
}
