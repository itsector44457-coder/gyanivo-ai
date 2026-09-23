"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight, BarChart3, BookOpen, BrainCircuit, Check, CheckCircle2,
  ClipboardCheck, FileQuestion, GraduationCap, LineChart, Search,
  ShieldCheck, Sparkles, Target, TrendingUp, UserCog, Users, WandSparkles,
} from "lucide-react";

const features = [
  { icon: Search,      title: "Competency Gap Detection",    description: "Identify role-wise skill gaps using competency frameworks and diagnostic assessments.", color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
  { icon: Target,      title: "Personalized Learning Path",  description: "AI builds an individual learning journey based on role, competency level, and career goals.", color: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" },
  { icon: GraduationCap, title: "iGOT Karmayogi Integration", description: "Surfaces relevant courses aligned with your specific competency gaps — no manual searching.", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
  { icon: BrainCircuit, title: "Adaptive Assessments",       description: "Question difficulty adjusts in real time so every test feels appropriately challenging.", color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  { icon: FileQuestion, title: "AI Quiz Generation",         description: "Trainers upload PDFs and training manuals — the platform handles the rest.", color: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" },
  { icon: BarChart3,   title: "Progress Analytics",          description: "Track competency improvement, learning progress, scores and certification status.", color: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" },
];

const steps = [
  { number: "01", icon: ClipboardCheck, title: "Assess",        description: "Take a diagnostic to understand where you actually stand." },
  { number: "02", icon: Search,         title: "Find the gaps", description: "AI compares your proficiency against your role's requirements." },
  { number: "03", icon: BookOpen,       title: "Learn",         description: "Follow a personalized path with iGOT Karmayogi recommendations." },
  { number: "04", icon: TrendingUp,     title: "Track growth",  description: "Adaptive assessments show measurable improvement over time." },
];

const roles = [
  { icon: Users,      title: "Employee",      description: "Assess your skills, see where the gaps are, and follow a learning path built around your role.", link: "/dashboard", button: "Employee Portal", accent: "blue" },
  { icon: GraduationCap, title: "Trainer",    description: "Upload training materials, generate assessments with AI, and track how your learners are progressing.", link: "/trainer", button: "Trainer Portal", accent: "violet" },
  { icon: UserCog,    title: "Administrator", description: "Manage competency frameworks, users and learning resources across the entire organisation.", link: "/admin", button: "Admin Portal", accent: "emerald" },
];

const stats = [
  { value: "10,000+", label: "Officials empowered" },
  { value: "25,000+", label: "Assessments completed" },
  { value: "8,500+",  label: "Learning paths created" },
  { value: "60%",     label: "Average learning improvement" },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">

        {/* ── hero ── */}
        <section className="relative bg-[#f8fafc] dark:bg-gray-900">
          <div className="pointer-events-none absolute -left-48 -top-24 h-[520px] w-[520px] rounded-full bg-blue-100/50 blur-[140px] dark:bg-blue-500/10" />
          <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-sky-100/40 blur-[120px] dark:bg-sky-500/10" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:pb-28 lg:pt-24">
            <div className="flex flex-col justify-center">
              <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                SIH 26101 · AI for India&apos;s Statistical System
              </div>

              <h1 className="max-w-xl text-[42px] font-bold leading-[1.1] tracking-tight text-gray-950 dark:text-white sm:text-5xl lg:text-[58px]">
                AI-powered skills for
                <span className="serif ml-2 italic text-blue-700 dark:text-blue-400">India&apos;s</span>
                <br />statistical workforce
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-500 dark:text-gray-400 sm:text-[17px]">
                Disha AI detects competency gaps, builds personalised learning paths, and tracks real progress — so every official in India&apos;s statistical system keeps growing.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/dashboard" className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600">
                  Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400">
                  See how it works
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-gray-400 dark:text-gray-600">
                {["Role-based", "Adaptive AI", "iGOT aligned", "Data-driven"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[560px]">
                <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
                  <img src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=85" alt="India statistical workforce" className="h-[420px] w-full object-cover" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#0c2252]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-200">Building a data-driven India</p>
                    <p className="mt-1.5 text-xl font-bold leading-snug text-white">Better data. Stronger people.<br />Smarter decisions.</p>
                  </div>
                </div>

                <div className="absolute -left-5 top-8 hidden w-52 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10 lg:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Competency</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">72%</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-full w-[72%] rounded-full bg-blue-600 dark:bg-blue-500" />
                  </div>
                </div>

                <div className="absolute -bottom-6 left-10 hidden w-72 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10 sm:block">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400">AI Recommendation</p>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">Advanced Survey Methods</p>
                    </div>
                    <WandSparkles className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">iGOT Karmayogi</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Recommended</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── problem/solution ── */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 lg:grid lg:grid-cols-2">
            <div className="p-8 dark:bg-gray-900 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-500">The challenge</p>
              <h2 className="mt-3 text-2xl font-bold leading-snug text-gray-900 dark:text-white sm:text-3xl">
                Statistical capability can&apos;t be built with generic training.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Roles differ. Skills differ. One-size-fits-all programmes leave critical gaps unaddressed.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  ["Evolving skill needs", "Data-intensive roles demand skills that traditional curricula don't cover."],
                  ["Generic delivery",     "The same training for every role can't close individual gaps."],
                  ["Shallow assessment",   "Multiple-choice tests tell you a score, not what to do next."],
                  ["Disconnected systems", "Training and competency tracking have historically worked in silos."],
                ].map(([title, desc]) => (
                  <div key={title as string} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title as string}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-500">{desc as string}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a3461] p-8 text-white dark:bg-blue-950 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">How Disha AI solves it</p>
              <h2 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">From skill gaps to measurable competency growth.</h2>
              <ul className="mt-8 space-y-4">
                {[
                  "AI-powered competency gap analysis by role",
                  "Personalised learning paths, not generic syllabi",
                  "Adaptive assessments that respond to performance",
                  "AI-generated MCQs from your own training materials",
                  "iGOT Karmayogi course alignment built in",
                  "Continuous analytics on competency progression",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/30">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                    <span className="text-sm text-blue-50">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── features ── */}
        <section className="bg-gray-50 py-20 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">What it does</p>
              <h2 className="mt-3 text-3xl font-bold leading-snug text-gray-900 dark:text-white sm:text-4xl">
                One platform. <span className="serif italic text-blue-700 dark:text-blue-400">Continuous</span> growth.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">Six capabilities, working together, so nothing falls through the cracks.</p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="group rounded-2xl border border-gray-200 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800 dark:hover:border-blue-500/40">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400">
                      Learn more <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-right">
              <Link href="/features" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 link-underline dark:text-blue-400">
                Explore all features <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── how it works ── */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">How it works</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Four steps to real competency.</h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              The whole journey — from knowing nothing to showing measurable progress — happens inside one platform.
            </p>
          </div>

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-9 hidden h-px bg-gray-200 dark:bg-gray-800 lg:block" />
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 dark:bg-blue-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="absolute right-5 top-4 select-none text-3xl font-bold text-gray-100 dark:text-gray-800">{step.number}</span>
                  <h3 className="mt-5 text-base font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── role portals ── */}
        <section className="bg-[#f8fafc] py-20 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">Built for every stakeholder</p>
              <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">One platform, three different experiences.</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Whether you&apos;re learning, teaching, or running the system — you get tools shaped around your actual job.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {roles.map((role, i) => {
                const Icon = role.icon;
                const iconBg: Record<string, string> = {
                  blue:    "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
                  violet:  "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
                  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
                };
                const linkColor: Record<string, string> = {
                  blue:    "text-blue-700 dark:text-blue-400",
                  violet:  "text-violet-700 dark:text-violet-400",
                  emerald: "text-emerald-700 dark:text-emerald-400",
                };
                return (
                  <div key={role.title} className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-7 transition duration-200 hover:border-gray-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800 dark:hover:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg[role.accent]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="select-none text-xs font-bold text-gray-200 dark:text-gray-700">0{i + 1}</span>
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">{role.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{role.description}</p>
                    <Link href={role.link} className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${linkColor[role.accent]}`}>
                      {role.button} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── dashboard preview ── */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Analytics</p>
              <h2 className="mt-3 text-3xl font-bold leading-snug text-gray-900 dark:text-white sm:text-4xl">Assessments that actually tell you something.</h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Disha AI continuously analyses competency scores, learning activities and assessments to surface strengths, flag gaps and recommend the right next step.
              </p>
              <ul className="mt-7 space-y-3">
                {["Competency-wise proficiency tracking", "Skill gap severity analysis", "AI-powered learning recommendations", "Assessment score trends over time"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />{item}
                  </li>
                ))}
              </ul>
              <Link href="/analytics" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white">
                View analytics <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-xl ring-1 ring-black/5 dark:border-gray-800 dark:bg-gray-900 dark:ring-white/5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-gray-400">Employee dashboard</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">Data Analyst · NSO</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                  Active learner
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Overall competency", value: "72%", color: "text-blue-700 dark:text-blue-400", bar: "bg-blue-600 dark:bg-blue-500", pct: "72%" },
                  { label: "Skill gaps",          value: "5",   color: "text-red-500", sub: "2 high priority" },
                  { label: "Learning progress",   value: "60%", color: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", pct: "60%" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                    <p className="text-[10px] text-gray-400">{stat.label}</p>
                    <p className={`mt-2.5 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    {stat.bar ? (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <div className={`h-full rounded-full ${stat.bar}`} style={{ width: stat.pct }} />
                      </div>
                    ) : (
                      <p className="mt-2 text-[10px] text-gray-400">{stat.sub}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-[1.3fr_1fr]">
                <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Competency areas</p>
                    <LineChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  {[["Statistical Methods", 78], ["Data Analysis", 65], ["Survey & Sampling", 52], ["Data Management", 80], ["Data Visualisation", 68]].map(([name, score]) => (
                    <div key={name as string} className="mb-3">
                      <div className="mb-1.5 flex justify-between text-[11px]">
                        <span className="text-gray-600 dark:text-gray-400">{name as string}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{score as number}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <div className="h-full rounded-full bg-blue-500 dark:bg-blue-400" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
                  <p className="mb-4 text-sm font-semibold text-gray-800 dark:text-gray-200">Recommended</p>
                  {["Advanced Survey Methods", "Data Quality Assurance", "Data Visualisation"].map((course) => (
                    <div key={course} className="mb-2.5 rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                      <p className="text-[11px] font-semibold leading-snug text-gray-900 dark:text-gray-100">{course}</p>
                      <p className="mt-1 text-[10px] text-blue-600 dark:text-blue-400">iGOT Karmayogi</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── stats ── */}
        <section className="bg-[#0f2140] py-16 text-white dark:bg-gray-900 dark:border-y dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Building a more capable statistical workforce.</h2>
              <p className="text-sm text-blue-300 dark:text-gray-500 md:text-right">Numbers from the platform so far.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 dark:border-gray-800 dark:bg-gray-800">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm text-blue-300 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── cta ── */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl bg-blue-600 px-8 py-14 dark:bg-blue-900 sm:px-12 lg:px-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-blue-200">
                  <ShieldCheck className="h-4 w-4" /> SIH26101
                </div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to modernise your<br />statistical workforce?</h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-blue-100">Assess. Learn. Improve. Build a stronger, data-driven India with Disha AI.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 dark:bg-gray-100 dark:text-blue-800">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="inline-flex items-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                  Contact us
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
