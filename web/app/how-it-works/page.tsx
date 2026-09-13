"use client";

import Link from "next/link";
import type { ElementType } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Database,
  FileQuestion,
  FileText,
  Gauge,
  GraduationCap,
  Layers3,
  Lightbulb,
  LineChart,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserCog,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";

/* =========================================================
   MAIN FLOW
========================================================= */

const mainFlow = [
  {
    number: "01",
    icon: UserCog,
    title: "Understand the Employee",
    text: "Sketu identifies the employee's role and the competencies required for that role.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Assess Current Knowledge",
    text: "A diagnostic assessment measures the employee's current competency level.",
  },
  {
    number: "03",
    icon: Search,
    title: "Detect Skill Gaps",
    text: "Required competency and actual proficiency are compared to find exact gaps.",
  },
  {
    number: "04",
    icon: Target,
    title: "Build Learning Path",
    text: "AI recommends personalized courses and learning resources based on the gaps.",
  },
  {
    number: "05",
    icon: TrendingUp,
    title: "Track Improvement",
    text: "Adaptive assessments and mastery tracking continuously measure progress.",
  },
];

/* =========================================================
   DETAILED STEPS
========================================================= */

const detailedSteps = [
  {
    number: "01",
    icon: UserCog,
    title: "Role & Competency Mapping",
    badge: "Starting Point",
    description:
      "Every learning journey starts by understanding what an employee is expected to know for their role.",

    howItWorks: [
      "Employee signs in to Sketu AI.",
      "System identifies department, designation and assigned role.",
      "Role is mapped with required competencies.",
      "Each competency receives an expected proficiency level.",
    ],

    example:
      "A Data Analyst may require Statistical Methods, Survey Sampling, Data Analysis, Data Visualization and Data Management.",

    output: "Required Competency Profile",
  },

  {
    number: "02",
    icon: ClipboardCheck,
    title: "Diagnostic Assessment",
    badge: "Know Current Level",
    description:
      "Sketu checks what the employee already knows before recommending any training.",

    howItWorks: [
      "Questions are selected from competency-specific question banks.",
      "Different competencies are evaluated individually.",
      "Each answer contributes to the employee's initial proficiency.",
      "The system creates a baseline competency score.",
    ],

    example:
      "The employee scores 82% in Data Analysis but only 45% in Survey Sampling.",

    output: "Current Competency Score",
  },

  {
    number: "03",
    icon: BrainCircuit,
    title: "Adaptive Assessment Engine",
    badge: "Smart Assessment",
    description:
      "Instead of giving everyone the same fixed paper, Sketu adjusts question difficulty according to performance.",

    howItWorks: [
      "Assessment begins with a medium-level question.",
      "Correct answers can move the learner to harder questions.",
      "Incorrect answers can trigger easier or concept-focused questions.",
      "Already attempted questions are avoided.",
    ],

    example:
      "A learner answers a medium Sampling question correctly, so the next question can move to a higher difficulty level.",

    output: "More Accurate Ability Estimate",
  },

  {
    number: "04",
    icon: Search,
    title: "AI Competency Gap Detection",
    badge: "Find The Gap",
    description:
      "Sketu compares what the role requires with what the employee currently demonstrates.",

    howItWorks: [
      "Required proficiency is fetched from the role framework.",
      "Current proficiency comes from assessments and mastery data.",
      "The difference is calculated competency-wise.",
      "The gap is classified by severity.",
    ],

    example:
      "Required Sampling proficiency = 80%. Current proficiency = 45%. Skill gap = 35%, marked high priority.",

    output: "Skill Gap + Severity",
  },

  {
    number: "05",
    icon: Target,
    title: "Personalized Learning Path",
    badge: "Learn What Matters",
    description:
      "Sketu creates a learning path specifically for the employee instead of assigning generic training.",

    howItWorks: [
      "High-priority gaps are addressed first.",
      "Learning modules are arranged in a logical sequence.",
      "Already mastered topics can be skipped.",
      "The path changes as competency levels improve.",
    ],

    example:
      "Employee A receives Sampling → Survey Design, while Employee B receives Python → Data Visualization.",

    output: "Personalized Learning Journey",
  },

  {
    number: "06",
    icon: GraduationCap,
    title: "iGOT Karmayogi Recommendations",
    badge: "Right Learning Resource",
    description:
      "Detected competency gaps are connected to relevant courses and official learning resources.",

    howItWorks: [
      "The system identifies the weak competency.",
      "Relevant course tags and learning objectives are matched.",
      "Suitable learning resources are recommended.",
      "Completed learning contributes to progress tracking.",
    ],

    example:
      "Survey Sampling gap can lead to a recommendation for a relevant Survey Methodology learning module.",

    output: "Recommended Courses",
  },

  {
    number: "07",
    icon: FileQuestion,
    title: "AI Question Generation using RAG",
    badge: "Trainer Intelligence",
    description:
      "Trainers can upload official training material and use AI to create grounded assessment questions.",

    howItWorks: [
      "Trainer uploads PDF, manual or study material.",
      "Document content is processed into searchable chunks.",
      "Relevant sections are retrieved according to competency.",
      "AI generates questions using the retrieved material.",
      "Trainer reviews questions before publishing them.",
    ],

    example:
      "Upload a Survey Methodology manual and generate competency-specific MCQs with answers and difficulty levels.",

    output: "Reviewed Question Bank",
  },

  {
    number: "08",
    icon: LineChart,
    title: "Knowledge Mastery Tracking",
    badge: "Continuous Intelligence",
    description:
      "Sketu continuously estimates whether the employee has actually mastered each competency.",

    howItWorks: [
      "Every answer updates the learner's competency state.",
      "Correct answers increase confidence in mastery.",
      "Incorrect answers reduce or adjust that confidence.",
      "Future assessments use the updated mastery level.",
    ],

    example:
      "Repeated correct answers in Sampling can move estimated mastery from 45% to 62%, then 74%.",

    output: "Updated Mastery Probability",
  },

  {
    number: "09",
    icon: BarChart3,
    title: "Progress & Workforce Analytics",
    badge: "Decision Intelligence",
    description:
      "Individual learning data is converted into useful insights for employees, trainers and administrators.",

    howItWorks: [
      "Employees see competency improvement and learning progress.",
      "Trainers see assessment and learner performance.",
      "Admins see workforce-wide competency trends.",
      "Common organizational skill gaps become visible.",
    ],

    example:
      "An administrator may discover that Survey Sampling is a common skill gap across multiple teams.",

    output: "Actionable Analytics",
  },
];

/* =========================================================
   ROLE DATA
========================================================= */

const roles = [
  {
    icon: Users,
    title: "Employee",
    subtitle: "Learn & Improve",
    items: [
      "View competency profile",
      "Take diagnostic assessment",
      "See detected skill gaps",
      "Follow personalized learning path",
      "Take adaptive assessments",
      "Track mastery improvement",
    ],
  },

  {
    icon: GraduationCap,
    title: "Trainer",
    subtitle: "Create & Evaluate",
    items: [
      "Upload learning material",
      "Generate questions using AI",
      "Review generated questions",
      "Build assessments",
      "Manage question bank",
      "Monitor learner progress",
    ],
  },

  {
    icon: ShieldCheck,
    title: "Administrator",
    subtitle: "Manage & Analyze",
    items: [
      "Manage employees and roles",
      "Define competency frameworks",
      "Map roles with competencies",
      "Analyze workforce skill gaps",
      "Monitor training effectiveness",
      "View organization analytics",
    ],
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden bg-white text-slate-900 font-sans antialiased">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-[#f5f9ff] via-white to-[#edf7ff]">
          <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-[130px]" />

          <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-200/30 blur-[140px]" />

          <div className="relative mx-auto grid max-w-[1450px] items-center gap-14 px-5 py-20 sm:px-7 lg:grid-cols-[1fr_.95fr] lg:px-10 lg:py-28">

            {/* LEFT */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-bold text-blue-700 shadow-sm backdrop-blur">
                <BrainCircuit className="h-4 w-4" />

                How Sketu AI Works

                <span className="h-1 w-1 rounded-full bg-blue-400" />

                SIH26101
              </div>

              <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.07] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[64px]">
                From Knowing the Role
                <br />

                <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  To Building Mastery.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Sketu AI continuously understands the employee, assesses their
                knowledge, identifies competency gaps, recommends the right
                learning and measures whether actual improvement happened.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#complete-flow"
                  className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5"
                >
                  See Complete Flow

                  <ArrowDown className="h-4 w-4 transition group-hover:translate-y-1" />
                </Link>

                <Link
                  href="/features"
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  Explore Features
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Role Based",
                  "Adaptive",
                  "Personalized",
                  "Continuous",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-500"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT FLOW VISUAL */}

            <div className="relative mx-auto w-full max-w-[610px]">

              <div className="rounded-[34px] border border-blue-100 bg-white p-5 shadow-[0_35px_100px_rgba(37,99,235,.13)] sm:p-7">

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      Sketu Intelligence Loop
                    </p>

                    <h3 className="mt-1 text-lg font-black">
                      Continuous Competency Development
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                    <Network className="h-5 w-5 text-blue-600" />
                  </div>
                </div>

                <div className="space-y-3">

                  <FlowItem
                    icon={UserCog}
                    label="Role"
                    value="Data Analyst"
                    index="01"
                  />

                  <FlowArrow />

                  <FlowItem
                    icon={ClipboardCheck}
                    label="Assessment"
                    value="Current competency measured"
                    index="02"
                  />

                  <FlowArrow />

                  <FlowItem
                    icon={Search}
                    label="AI Analysis"
                    value="Skill gaps detected"
                    index="03"
                  />

                  <FlowArrow />

                  <FlowItem
                    icon={BookOpen}
                    label="Learning"
                    value="Personalized path generated"
                    index="04"
                  />

                  <FlowArrow />

                  <FlowItem
                    icon={TrendingUp}
                    label="Progress"
                    value="Mastery continuously updated"
                    index="05"
                  />

                </div>

                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                      <Zap className="h-4 w-4 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-xs font-black text-emerald-900">
                        Continuous Feedback Loop
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-emerald-700">
                        New assessment results update mastery and change future
                        recommendations.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="absolute -right-5 -top-5 hidden rounded-2xl border border-violet-100 bg-white px-4 py-3 shadow-xl sm:block">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />

                  <span className="text-xs font-bold">
                    AI Powered
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            SIMPLE EXPLANATION
        ===================================================== */}

        <section className="mx-auto max-w-[1450px] px-5 py-16 sm:px-7 lg:px-10">

          <div className="grid gap-8 rounded-[34px] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-7 sm:p-10 lg:grid-cols-[.65fr_1.35fr] lg:items-center lg:p-12">

            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Simple Explanation
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Think of Sketu AI as a personal skill coach.
              </h2>
            </div>

            <div className="rounded-[26px] bg-white p-6 shadow-sm sm:p-8">

              <p className="text-lg leading-9 text-slate-600">
                First it asks:
                <strong className="text-slate-900">
                  {" "}
                  “What should you know?”
                </strong>
              </p>

              <p className="mt-2 text-lg leading-9 text-slate-600">
                Then:
                <strong className="text-slate-900">
                  {" "}
                  “What do you already know?”
                </strong>
              </p>

              <p className="mt-2 text-lg leading-9 text-slate-600">
                Then:
                <strong className="text-blue-700">
                  {" "}
                  “What is missing?”
                </strong>
              </p>

              <p className="mt-2 text-lg leading-9 text-slate-600">
                Finally:
                <strong className="text-emerald-700">
                  {" "}
                  “What should you learn next?”
                </strong>
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-2 text-[11px] font-bold">

                <SmallBadge text="Role" />
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

                <SmallBadge text="Assess" />
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

                <SmallBadge text="Gap" />
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

                <SmallBadge text="Learn" />
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

                <SmallBadge text="Re-Assess" />
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

                <SmallBadge text="Improve" />

              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            MAIN 5 STEP FLOW
        ===================================================== */}

        <section
          id="complete-flow"
          className="bg-[#f8fbff] py-20"
        >
          <div className="mx-auto max-w-[1450px] px-5 sm:px-7 lg:px-10">

            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                End-to-End Flow
              </p>

              <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                One continuous
                <span className="text-blue-600">
                  {" "}
                  competency loop.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500">
                Sketu does not stop after recommending a course. It continuously
                reassesses the employee and updates their learning journey.
              </p>
            </div>

            <div className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">

              <div className="absolute left-[10%] right-[10%] top-10 hidden h-px bg-gradient-to-r from-blue-100 via-blue-400 to-blue-100 lg:block" />

              {mainFlow.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="group relative rounded-[28px] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100"
                  >
                    <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                      <Icon className="h-6 w-6" />
                    </div>

                    <span className="absolute right-5 top-4 text-4xl font-black text-slate-100">
                      {step.number}
                    </span>

                    <h3 className="mt-6 text-lg font-black">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-xs leading-6 text-slate-500">
                      {step.text}
                    </p>

                    {index !== mainFlow.length - 1 && (
                      <ArrowRight className="absolute -right-3 top-8 z-20 hidden h-5 w-5 rounded-full bg-white text-blue-400 lg:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            DETAILED WORKING
        ===================================================== */}

        <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              Detailed Working
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              What happens
              <span className="text-blue-600">
                {" "}
                behind every step?
              </span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              Here is the complete journey from employee login to competency
              improvement.
            </p>
          </div>

          <div className="relative mt-14">

            <div className="absolute bottom-0 left-[31px] top-0 hidden w-px bg-gradient-to-b from-blue-200 via-blue-400 to-blue-100 md:block" />

            <div className="space-y-8">

              {detailedSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="relative md:pl-24"
                  >
                    {/* TIMELINE ICON */}

                    <div className="absolute left-0 top-7 z-10 hidden h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-white shadow-lg shadow-blue-200 md:flex">
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* CARD */}

                    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50">

                      <div className="grid lg:grid-cols-[1.1fr_.9fr]">

                        {/* LEFT */}

                        <div className="p-6 sm:p-8 lg:p-9">

                          <div className="flex flex-wrap items-center gap-3">

                            <span className="text-xs font-black text-blue-500">
                              STEP {step.number}
                            </span>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
                              {step.badge}
                            </span>

                          </div>

                          <h3 className="mt-4 text-2xl font-black sm:text-3xl">
                            {step.title}
                          </h3>

                          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                            {step.description}
                          </p>

                          <div className="mt-7">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                              How it works
                            </p>

                            <div className="mt-4 space-y-3">
                              {step.howItWorks.map((item) => (
                                <div
                                  key={item}
                                  className="flex gap-3"
                                >
                                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                                  </div>

                                  <p className="text-xs leading-6 text-slate-600">
                                    {item}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT */}

                        <div className="border-t border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/50 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-9">

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-500">
                              Simple Example
                            </p>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                              {step.example}
                            </p>
                          </div>

                          <div className="mt-7 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              </div>

                              <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-600">
                                  Output
                                </p>

                                <p className="mt-1 text-sm font-black text-slate-800">
                                  {step.output}
                                </p>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </section>

        {/* =====================================================
            ADAPTIVE ASSESSMENT
        ===================================================== */}

        <section className="bg-[#071d49] py-20 text-white">

          <div className="mx-auto max-w-[1450px] px-5 sm:px-7 lg:px-10">

            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">

              {/* LEFT */}

              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Gauge className="h-6 w-6 text-cyan-300" />
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                  Adaptive Assessment
                </p>

                <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                  The assessment changes
                  <span className="text-cyan-300">
                    {" "}
                    with the learner.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100/70">
                  Two employees do not need to follow exactly the same difficulty
                  path. Sketu dynamically adjusts questions according to
                  performance.
                </p>
              </div>

              {/* FLOW */}

              <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur sm:p-8">

                <div className="text-center">
                  <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-blue-100">
                    Start with Medium Question
                  </span>
                </div>

                <div className="mx-auto my-5 h-8 w-px bg-white/20" />

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* CORRECT */}

                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">

                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />

                      <span className="text-sm font-black text-emerald-200">
                        Correct Answer
                      </span>
                    </div>

                    <div className="my-4 h-px bg-emerald-300/10" />

                    <p className="text-xs leading-6 text-emerald-100/70">
                      Confidence increases.
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white">
                      Medium

                      <ArrowRight className="h-3.5 w-3.5" />

                      Harder Question
                    </div>
                  </div>

                  {/* WRONG */}

                  <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 p-5">

                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-5 w-5 text-orange-300" />

                      <span className="text-sm font-black text-orange-200">
                        Incorrect Answer
                      </span>
                    </div>

                    <div className="my-4 h-px bg-orange-300/10" />

                    <p className="text-xs leading-6 text-orange-100/70">
                      System investigates the concept further.
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white">
                      Medium

                      <ArrowRight className="h-3.5 w-3.5" />

                      Easier / Related
                    </div>
                  </div>

                </div>

                <div className="mx-auto my-5 h-8 w-px bg-white/20" />

                <div className="rounded-2xl bg-blue-500/20 p-5 text-center">
                  <p className="text-xs font-black text-blue-100">
                    Result: Better estimate of actual competency
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RAG PIPELINE
        ===================================================== */}

        <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-600">
              AI Question Generation
            </p>

            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-4xl">
              How PDF becomes a
              <span className="text-violet-600">
                {" "}
                trusted assessment.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500">
              Sketu uses uploaded learning material as the knowledge source so AI
              questions remain grounded in the provided content.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">

            <PipelineCard
              icon={Upload}
              number="01"
              title="Upload"
              text="Trainer uploads official PDF or training material."
            />

            <PipelineCard
              icon={FileText}
              number="02"
              title="Process"
              text="Document is cleaned and divided into useful chunks."
            />

            <PipelineCard
              icon={Database}
              number="03"
              title="Retrieve"
              text="Relevant content is found for the selected competency."
            />

            <PipelineCard
              icon={WandSparkles}
              number="04"
              title="Generate"
              text="AI creates questions, answers and difficulty levels."
            />

            <PipelineCard
              icon={CheckCircle2}
              number="05"
              title="Review"
              text="Trainer reviews and approves questions before use."
            />

          </div>

          <div className="mt-10 rounded-[28px] border border-violet-100 bg-violet-50/50 p-6 sm:p-8">

            <div className="flex flex-col gap-5 md:flex-row md:items-center">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600">
                <Layers3 className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="font-black">
                  Why use RAG?
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Instead of asking AI to create questions from general memory,
                  relevant content from the uploaded official material is first
                  retrieved and supplied to the model. This keeps question
                  generation more grounded in the source material.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            BKT
        ===================================================== */}

        <section className="bg-gradient-to-b from-[#f8fbff] to-white py-20">

          <div className="mx-auto grid max-w-[1450px] gap-12 px-5 sm:px-7 lg:grid-cols-[.9fr_1.1fr] lg:px-10">

            {/* LEFT */}

            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                <BrainCircuit className="h-6 w-6 text-indigo-600" />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-indigo-600">
                Knowledge Tracing
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                A score tells us what happened.
                <span className="text-indigo-600">
                  {" "}
                  Mastery tells us what was learned.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">
                Sketu keeps updating the estimated mastery of a competency as the
                employee answers more questions.
              </p>

              <div className="mt-7 space-y-3">

                {[
                  "Initial mastery starts from diagnostic performance",
                  "Every new answer updates the competency estimate",
                  "Repeated success increases mastery confidence",
                  "Future learning adapts using updated mastery",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />

                    <p className="text-sm text-slate-600">
                      {item}
                    </p>
                  </div>
                ))}

              </div>
            </div>

            {/* RIGHT */}

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-blue-100/40 sm:p-8">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">
                    Competency
                  </p>

                  <h3 className="mt-1 text-lg font-black">
                    Survey Sampling
                  </h3>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">
                  Live Mastery
                </span>
              </div>

              <div className="mt-8">

                <MasteryRow
                  label="Initial Diagnostic"
                  value={45}
                />

                <MasteryRow
                  label="After Question 1"
                  value={52}
                />

                <MasteryRow
                  label="After Question 2"
                  value={61}
                />

                <MasteryRow
                  label="After Learning"
                  value={69}
                />

                <MasteryRow
                  label="Re-Assessment"
                  value={78}
                />

              </div>

              <div className="mt-7 rounded-2xl bg-emerald-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                      Improvement
                    </p>

                    <p className="mt-1 text-sm font-black text-emerald-900">
                      45% → 78%
                    </p>
                  </div>

                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            REAL EXAMPLE
        ===================================================== */}

        <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

          <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 text-white">

            <div className="grid lg:grid-cols-[.65fr_1.35fr]">

              {/* LEFT */}

              <div className="p-7 sm:p-10 lg:p-12">

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                  Real Scenario
                </span>

                <h2 className="mt-5 text-3xl font-black">
                  Meet Rahul,
                  <br />
                  Data Analyst
                </h2>

                <p className="mt-5 text-sm leading-7 text-blue-100/80">
                  Rahul&apos;s complete Sketu AI journey can be understood in
                  less than a minute.
                </p>

                <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.07] p-5">
                  <p className="text-[10px] uppercase tracking-wider text-blue-300">
                    Final Result
                  </p>

                  <p className="mt-2 text-2xl font-black">
                    Sampling Mastery
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-lg font-black text-red-200">
                      45%
                    </span>

                    <ArrowRight className="h-5 w-5 text-blue-300" />

                    <span className="text-3xl font-black text-emerald-300">
                      78%
                    </span>
                  </div>
                </div>

              </div>

              {/* RIGHT */}

              <div className="bg-white/[0.06] p-7 sm:p-10 lg:p-12">

                <div className="space-y-4">

                  <StoryStep
                    number="1"
                    title="Role Identified"
                    text="Rahul works as a Data Analyst."
                  />

                  <StoryStep
                    number="2"
                    title="Competency Requirement"
                    text="His role requires 80% proficiency in Survey Sampling."
                  />

                  <StoryStep
                    number="3"
                    title="Diagnostic Assessment"
                    text="Rahul demonstrates only 45% proficiency."
                  />

                  <StoryStep
                    number="4"
                    title="Gap Detected"
                    text="Sketu detects a 35% high-priority competency gap."
                  />

                  <StoryStep
                    number="5"
                    title="Learning Recommended"
                    text="A relevant Survey Methodology module is recommended."
                  />

                  <StoryStep
                    number="6"
                    title="Adaptive Re-Assessment"
                    text="Question difficulty changes based on Rahul's performance."
                  />

                  <StoryStep
                    number="7"
                    title="Mastery Updated"
                    text="Rahul reaches an estimated mastery level of 78%."
                  />

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            ROLE FLOW
        ===================================================== */}

        <section className="bg-[#f8fbff] py-20">

          <div className="mx-auto max-w-[1450px] px-5 sm:px-7 lg:px-10">

            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                Role Based Workflow
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Every role has its own journey.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">

              {roles.map((role) => {
                const Icon = role.icon;

                return (
                  <div
                    key={role.title}
                    className="rounded-[30px] border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100"
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>

                      <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-500">
                        {role.subtitle}
                      </span>

                    </div>

                    <h3 className="mt-6 text-2xl font-black">
                      {role.title}
                    </h3>

                    <div className="mt-6 space-y-3">

                      {role.items.map((item, index) => (
                        <div
                          key={item}
                          className="flex items-center gap-3"
                        >

                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-black text-blue-600">
                            {index + 1}
                          </span>

                          <span className="text-xs font-semibold text-slate-600">
                            {item}
                          </span>

                        </div>
                      ))}

                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </section>

        {/* =====================================================
            SYSTEM INTELLIGENCE
        ===================================================== */}

        <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-center">

            <div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                <Network className="h-6 w-6 text-violet-600" />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-violet-600">
                Intelligence Layer
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Multiple engines.
                <span className="text-violet-600">
                  {" "}
                  One learning experience.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                Different AI and learning components work together behind the
                scenes while the employee sees one simple experience.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <TechCard
                icon={Layers3}
                title="Competency Engine"
                subtitle="What should the employee know?"
                text="Maps job roles with required skills and target proficiency."
              />

              <TechCard
                icon={Gauge}
                title="Adaptive Engine"
                subtitle="What should we ask next?"
                text="Selects question difficulty according to learner performance."
              />

              <TechCard
                icon={FileText}
                title="RAG Engine"
                subtitle="What content should AI use?"
                text="Retrieves relevant uploaded material before generating questions."
              />

              <TechCard
                icon={BrainCircuit}
                title="Knowledge Tracing"
                subtitle="Has the learner mastered it?"
                text="Continuously updates estimated competency mastery."
              />

              <TechCard
                icon={Target}
                title="Recommendation Engine"
                subtitle="What should they learn next?"
                text="Maps detected skill gaps to personalized learning resources."
              />

              <TechCard
                icon={BarChart3}
                title="Analytics Engine"
                subtitle="What is improving?"
                text="Transforms competency and learning data into actionable insights."
              />

            </div>
          </div>
        </section>

        {/* =====================================================
          FINAL LOOP
      ===================================================== */}

        <section className="bg-[#071d49] py-16 text-white">

          <div className="mx-auto max-w-[1450px] px-5 sm:px-7 lg:px-10">

            <div className="text-center">

              <Sparkles className="mx-auto h-7 w-7 text-cyan-300" />

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
                The Sketu AI Loop
              </p>

              <h2 className="mx-auto mt-3 max-w-4xl text-3xl font-black sm:text-4xl">
                Assess → Detect → Learn → Re-Assess → Improve
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-blue-100/70">
                Every cycle produces better competency data, better learning
                recommendations and better workforce capability.
              </p>

            </div>

            <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-3">

              {[
                "Role",
                "Assessment",
                "Skill Gap",
                "Learning",
                "Adaptive Test",
                "Mastery",
                "Analytics",
              ].map((item, index, array) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <span className="rounded-xl border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-bold">
                    {item}
                  </span>

                  {index < array.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-blue-400" />
                  )}
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* =====================================================
          CTA
      ===================================================== */}

        <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-7 py-12 text-white sm:px-12 lg:px-16">

            <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

              <div>

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                  <ShieldCheck className="h-4 w-4" />

                  Sketu AI • SIH26101
                </div>

                <h2 className="mt-4 max-w-3xl text-3xl font-black sm:text-4xl">
                  Now see Sketu AI in action.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100">
                  Start with a competency assessment and experience the complete
                  personalized learning journey.
                </p>

              </div>

              <div className="flex flex-wrap gap-3">

                <Link
                  href="/login"
                  className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5"
                >
                  Get Started

                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/features"
                  className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Explore Features
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

/* =========================================================
   COMPONENTS
========================================================= */

function FlowItem({
  icon: Icon,
  label,
  value,
  index,
}: {
  icon: ElementType;
  label: string;
  value: string;
  index: string;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-blue-100 hover:bg-blue-50/50">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-blue-500">
            {index}
          </span>

          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>
        </div>

        <p className="mt-1 truncate text-sm font-black text-slate-800">
          {value}
        </p>
      </div>

      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

    </div>
  );
}

function FlowArrow() {
  return (
    <div className="ml-[21px] flex h-4 items-center">
      <div className="h-full w-px bg-gradient-to-b from-blue-300 to-slate-200" />
    </div>
  );
}

function SmallBadge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-700">
      {text}
    </span>
  );
}

function PipelineCard({
  icon: Icon,
  number,
  title,
  text,
}: {
  icon: ElementType;
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group relative rounded-[26px] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-2 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100">

      <span className="absolute right-5 top-4 text-3xl font-black text-slate-100">
        {number}
      </span>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
        <Icon className="h-5 w-5 text-violet-600" />
      </div>

      <h3 className="mt-5 text-base font-black">
        {title}
      </h3>

      <p className="mt-3 text-xs leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function MasteryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="mb-5">

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs font-semibold text-slate-600">
          {label}
        </span>

        <span className="text-xs font-black text-indigo-600">
          {value}%
        </span>

      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-400"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}

function StoryStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-cyan-200">
        {number}
      </div>

      <div>
        <p className="text-sm font-black text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-100/70">
          {text}
        </p>
      </div>

    </div>
  );
}

function TechCard({
  icon: Icon,
  title,
  subtitle,
  text,
}: {
  icon: ElementType;
  title: string;
  subtitle: string;
  text: string;
}) {
  return (
    <div className="rounded-[25px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-center gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
          <Icon className="h-5 w-5 text-violet-600" />
        </div>

        <div>
          <h3 className="text-sm font-black">
            {title}
          </h3>

          <p className="text-[10px] font-bold text-violet-500">
            {subtitle}
          </p>
        </div>

      </div>

      <p className="mt-4 text-xs leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}
