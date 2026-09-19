"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import {
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
   DATA
========================================================= */

const features = [
  {
    number: "01",
    icon: UserCog,

    title: "Competency Profiling",

    short:
      "Understand what skills an employee needs for their current role.",

    simple:
      "Disha AI first understands the employee's role and the competencies required to perform that job effectively.",

    example:
      "Example: A Data Analyst may require Statistical Methods, Data Analysis, Survey Techniques and Data Visualization.",

    result:
      "Creates a clear skill profile for every employee.",

    badge: "Know Required Skills",
  },

  {
    number: "02",
    icon: ClipboardCheck,

    title: "Diagnostic Assessment",

    short:
      "Check the employee's current knowledge before recommending training.",

    simple:
      "The employee takes a short assessment based on the competencies required for their role.",

    example:
      "If the employee performs well in Data Analysis but struggles with Sampling Methods, Disha AI captures that difference.",

    result:
      "Measures the employee's current competency level.",

    badge: "Measure Current Level",
  },

  {
    number: "03",
    icon: Search,

    title: "AI Skill Gap Detection",

    short:
      "Find exactly where the employee needs improvement.",

    simple:
      "Disha compares the required competency level with the employee's actual assessment performance.",

    example:
      "Required Sampling competency = 80%, Current level = 45%. Disha marks it as a high-priority skill gap.",

    result:
      "Training focuses only on skills that actually need improvement.",

    badge: "Detect the Gap",
  },

  {
    number: "04",
    icon: Target,

    title: "Personalized Learning Path",

    short:
      "Every employee receives a learning journey based on their own gaps.",

    simple:
      "Instead of giving the same training to everyone, Disha creates a different learning path for every employee.",

    example:
      "Employee A may receive Sampling → Survey Design while Employee B receives Python → Data Visualization.",

    result:
      "Less unnecessary training and more relevant learning.",

    badge: "Learn What Matters",
  },

  {
    number: "05",
    icon: GraduationCap,

    title: "iGOT Karmayogi Recommendations",

    short:
      "Recommend relevant government learning resources for detected skill gaps.",

    simple:
      "After identifying a gap, Disha can map that competency to suitable courses and learning resources available through iGOT Karmayogi.",

    example:
      "Sampling Methods gap → recommend an appropriate survey methodology course.",

    result:
      "Connects competency needs directly with learning resources.",

    badge: "Right Course • Right Person",
  },

  {
    number: "06",
    icon: BrainCircuit,

    title: "Adaptive Assessments",

    short:
      "Question difficulty changes according to the learner's performance.",

    simple:
      "Disha does not give every learner exactly the same fixed assessment. It adjusts the next question according to previous answers.",

    example:
      "Correct medium question → harder question. Wrong question → easier or concept-focused question.",

    result:
      "Produces a more accurate understanding of actual ability.",

    badge: "Smart Difficulty",
  },

  {
    number: "07",
    icon: FileQuestion,

    title: "AI Question Generation",

    short:
      "Upload training material and automatically create useful assessment questions.",

    simple:
      "Trainers can upload PDFs, manuals or learning material. AI reads the material and creates questions based on its content.",

    example:
      "Upload a Survey Methodology PDF → generate MCQs, answers and difficulty levels.",

    result:
      "Reduces the trainer's manual question creation workload.",

    badge: "PDF → Questions",
  },

  {
    number: "08",
    icon: TrendingUp,

    title: "Knowledge Mastery Tracking",

    short:
      "Track whether a learner actually understands a competency over time.",

    simple:
      "Disha does not judge mastery from only one score. It keeps updating the learner's estimated knowledge as more answers are submitted.",

    example:
      "Repeated correct answers increase mastery confidence; repeated mistakes reduce it.",

    result:
      "Shows actual learning progress instead of only test marks.",

    badge: "Continuous Learning",
  },

  {
    number: "09",
    icon: BarChart3,

    title: "Progress & Workforce Analytics",

    short:
      "See individual and organization-level competency progress.",

    simple:
      "Employees see their growth, while trainers and administrators can understand competency trends across teams.",

    example:
      "Admin can identify that Survey Sampling is a common skill gap across a department.",

    result:
      "Supports better training and workforce planning decisions.",

    badge: "Data-Driven Decisions",
  },
];

const workflow = [
  {
    number: "01",
    title: "Employee Role",
    text: "System identifies competencies required for the employee's role.",
    icon: Users,
  },

  {
    number: "02",
    title: "Assessment",
    text: "Employee completes a competency-based diagnostic assessment.",
    icon: ClipboardCheck,
  },

  {
    number: "03",
    title: "AI Analysis",
    text: "Disha compares required competency with actual performance.",
    icon: BrainCircuit,
  },

  {
    number: "04",
    title: "Skill Gaps",
    text: "Weak competencies and their severity are identified.",
    icon: Search,
  },

  {
    number: "05",
    title: "Learning Path",
    text: "Personalized learning resources are recommended.",
    icon: BookOpen,
  },

  {
    number: "06",
    title: "Re-Assessment",
    text: "Progress is measured and mastery levels are continuously updated.",
    icon: TrendingUp,
  },
];

const technologies = [
  {
    icon: Layers3,
    title: "Competency Engine",
    technical: "Rule + competency mapping",
    simple:
      "Decides what an employee should know according to their role.",
  },

  {
    icon: FileText,
    title: "RAG",
    technical: "Retrieval-Augmented Generation",
    simple:
      "Lets AI create questions using the uploaded training material instead of random knowledge.",
  },

  {
    icon: Gauge,
    title: "Adaptive Engine",
    technical: "Dynamic difficulty selection",
    simple:
      "Chooses the next question based on how well the learner is performing.",
  },

  {
    icon: BrainCircuit,
    title: "BKT",
    technical: "Bayesian Knowledge Tracing",
    simple:
      "Continuously estimates whether the learner has actually mastered a skill.",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden bg-white text-slate-900 font-sans antialiased">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-[#f5f9ff] via-white to-[#edf6ff]">
          {/* background */}
          <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-[120px]" />

          <div className="pointer-events-none absolute right-0 top-0 h-[450px] w-[450px] rounded-full bg-violet-200/30 blur-[130px]" />

          <div className="relative mx-auto grid max-w-[1450px] items-center gap-14 px-5 py-20 sm:px-7 lg:grid-cols-[1fr_.9fr] lg:px-10 lg:py-28">

            {/* LEFT */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-bold text-blue-700 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />

                Disha AI Features

                <span className="h-1 w-1 rounded-full bg-blue-400" />

                SIH26101
              </div>

              <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[62px]">
                From Skill Gap
                <br />

                <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  To Skill Growth.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Disha AI understands what an employee
                <strong className="font-bold text-slate-800">
                  {" "}
                  needs to know
                </strong>
                , checks what they
                <strong className="font-bold text-slate-800">
                  {" "}
                  currently know
                </strong>
                , identifies the
                <strong className="font-bold text-slate-800">
                  {" "}
                  gap
                </strong>
                , and then builds a personalized path to improve it.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#features"
                  className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5"
                >
                  Explore Features

                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/how-it-works"
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                >
                  How It Works
                </Link>
              </div>
            </div>

            {/* RIGHT SIMPLE VISUAL */}

            <div className="relative">
              <div className="rounded-[34px] border border-blue-100 bg-white p-5 shadow-[0_30px_100px_rgba(37,99,235,.13)] sm:p-7">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      Disha AI
                    </p>

                    <h3 className="mt-1 text-lg font-black">
                      Personalized Competency Journey
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                    <BrainCircuit className="h-5 w-5 text-blue-600" />
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  <JourneyItem
                    icon={UserCog}
                    title="Your Role"
                    value="Data Analyst"
                    color="blue"
                  />

                  <Connector />

                  <JourneyItem
                    icon={ClipboardCheck}
                    title="Diagnostic Assessment"
                    value="68% Score"
                    color="violet"
                  />

                  <Connector />

                  <JourneyItem
                    icon={Search}
                    title="Skill Gap Detected"
                    value="Sampling Methods"
                    color="red"
                  />

                  <Connector />

                  <JourneyItem
                    icon={GraduationCap}
                    title="Recommended Learning"
                    value="Survey Methodology"
                    color="emerald"
                  />

                  <Connector />

                  <JourneyItem
                    icon={TrendingUp}
                    title="Mastery Improved"
                    value="45% → 78%"
                    color="cyan"
                  />
                </div>
              </div>

              <div className="absolute -right-5 -top-5 hidden rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-xl sm:block">
                <div className="flex items-center gap-2">
                  <WandSparkles className="h-4 w-4 text-violet-600" />

                  <span className="text-xs font-bold">
                    AI Personalized
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUPER SIMPLE EXPLANATION
        ===================================================== */}

        <section className="mx-auto max-w-[1450px] px-5 py-16 sm:px-7 lg:px-10">

          <div className="rounded-[32px] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-7 sm:p-10 lg:p-12">

          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-center">

            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                In Simple Words
              </p>

              <h2 className="mt-2 text-3xl font-black">
                What exactly does Disha AI do?
              </h2>
            </div>

            <div className="rounded-[25px] bg-white p-6 shadow-sm sm:p-8">
              <p className="text-lg leading-9 text-slate-600">
                Think of
                <span className="font-black text-blue-700">
                  {" "}
                  Disha AI
                </span>{" "}
                like a personal skill coach for government employees.
              </p>

              <p className="mt-4 leading-8 text-slate-500">
                It finds what skills your job requires, checks your current
                knowledge, discovers what you are weak in and recommends
                exactly what you should learn next.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-bold">
                <SmallChip text="Know Role" />
                <ChevronRight className="h-3 w-3 text-slate-300" />

                <SmallChip text="Assess Skill" />
                <ChevronRight className="h-3 w-3 text-slate-300" />

                <SmallChip text="Find Gap" />
                <ChevronRight className="h-3 w-3 text-slate-300" />

                <SmallChip text="Learn" />
                <ChevronRight className="h-3 w-3 text-slate-300" />

                <SmallChip text="Improve" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="features"
        className="bg-[#f8fbff] py-20"
      >
        <div className="mx-auto max-w-[1450px] px-5 sm:px-7 lg:px-10">

          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              Core Features
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Every feature solves a real
              <span className="text-blue-600"> learning problem.</span>
            </h2>

            <p className="mt-5 max-w-2xl leading-7 text-slate-500">
              No complicated AI jargon. Here is exactly what every part of
              Disha AI does and why it matters.
            </p>
          </div>

          <div className="mt-14 space-y-6">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white transition duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50"
                >
                  <div className="grid lg:grid-cols-[130px_1fr_1fr]">

                    {/* NUMBER */}

                    <div className="flex items-center gap-4 border-b border-slate-100 p-6 lg:flex-col lg:items-start lg:border-b-0 lg:border-r lg:p-8">
                      <span className="text-4xl font-black text-slate-100 transition group-hover:text-blue-100">
                        {feature.number}
                      </span>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>

                    {/* MAIN */}

                    <div className="border-b border-slate-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">

                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
                        {feature.badge}
                      </span>

                      <h3 className="mt-4 text-2xl font-black text-slate-950">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm font-semibold text-blue-600">
                        {feature.short}
                      </p>

                      <p className="mt-5 text-sm leading-7 text-slate-500">
                        {feature.simple}
                      </p>
                    </div>

                    {/* EXAMPLE */}

                    <div className="bg-slate-50/60 p-6 sm:p-8">

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.17em] text-slate-400">
                          Simple Example
                        </p>

                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {feature.example}
                        </p>
                      </div>

                      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                        <div className="flex gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">
                              Benefit
                            </p>

                            <p className="mt-1 text-xs font-semibold leading-5 text-emerald-900">
                              {feature.result}
                            </p>
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
          WORKFLOW
      ===================================================== */}

      <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
            Complete Journey
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-4xl">
            How all these features work together
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            Disha AI is not a collection of separate features. Each feature
            passes intelligence to the next step.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">

          {workflow.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.number}
                className="relative rounded-[25px] border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                {index < workflow.length - 1 && (
                  <div className="absolute -right-4 top-10 z-10 hidden h-px w-4 bg-blue-200 lg:block">
                    <ArrowRight className="absolute -right-1 -top-[7px] h-3 w-3 text-blue-300" />
                  </div>
                )}

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <Icon className="h-5 w-5" />
                </div>

                <p className="mt-5 text-[10px] font-black text-blue-500">
                  STEP {item.number}
                </p>

                <h3 className="mt-2 text-sm font-black">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  {item.text}
                </p>
              </div>
            );
          })}

        </div>

        {/* EXAMPLE */}

        <div className="mt-12 overflow-hidden rounded-[30px] bg-[#071d49] p-7 text-white sm:p-10">

          <div className="grid gap-8 lg:grid-cols-[.6fr_1.4fr] lg:items-center">

            <div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-200">
                Real Example
              </span>

              <h3 className="mt-4 text-2xl font-black">
                Meet Rahul,
                <br />
                a Data Analyst
              </h3>

              <p className="mt-4 text-sm leading-7 text-blue-100/70">
                See how Disha turns one assessment into a complete learning
                journey.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              <ExampleCard
                label="Required"
                value="Sampling Methods"
                sub="Target competency: 80%"
              />

              <ExampleCard
                label="Assessment"
                value="Current Score: 45%"
                sub="High priority gap detected"
              />

              <ExampleCard
                label="AI Recommendation"
                value="Survey Methodology"
                sub="Suggested learning module"
              />

              <ExampleCard
                label="After Learning"
                value="Mastery: 78%"
                sub="Competency improvement tracked"
              />

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TECH MADE SIMPLE
      ===================================================== */}

      <section className="bg-gradient-to-b from-[#f8fbff] to-white py-20">

        <div className="mx-auto max-w-[1450px] px-5 sm:px-7 lg:px-10">

          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">

            <div>
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-violet-100">
                <Zap className="h-6 w-6 text-violet-600" />
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-violet-600">
                AI Under The Hood
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Powerful technology,
                <span className="text-violet-600">
                  {" "}
                  simple experience.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">
                Users do not need to understand AI models. Disha handles the
                intelligence in the background while keeping the user
                experience simple.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {technologies.map((tech) => {
                const Icon = tech.icon;

                return (
                  <div
                    key={tech.title}
                    className="rounded-[25px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                        <Icon className="h-5 w-5 text-violet-600" />
                      </div>

                      <div>
                        <h3 className="text-sm font-black">
                          {tech.title}
                        </h3>

                        <p className="text-[10px] font-semibold text-violet-500">
                          {tech.technical}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-6 text-slate-500">
                      {tech.simple}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ROLE BASED
      ===================================================== */}

      <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
            Who Gets What?
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Features designed for every role
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">

          {/* EMPLOYEE */}

          <RoleCard
            icon={Users}
            title="Employee"
            description="Everything needed to understand and improve personal competencies."
            items={[
              "View competency profile",
              "Take diagnostic assessments",
              "See skill gaps",
              "Get personalized learning path",
              "Receive course recommendations",
              "Track mastery and progress",
            ]}
          />

          {/* TRAINER */}

          <RoleCard
            icon={GraduationCap}
            title="Trainer"
            description="Tools to create better assessments and support employee learning."
            items={[
              "Upload training materials",
              "Generate questions using AI",
              "Review AI-generated questions",
              "Manage question bank",
              "Create assessments",
              "Monitor learner performance",
            ]}
          />

          {/* ADMIN */}

          <RoleCard
            icon={ShieldCheck}
            title="Administrator"
            description="Organization-wide control over competencies, users and learning."
            items={[
              "Manage users and roles",
              "Define competency frameworks",
              "Map roles to competencies",
              "Track workforce skill gaps",
              "Monitor training effectiveness",
              "View organization analytics",
            ]}
          />

        </div>
      </section>

      {/* =====================================================
          WHY DIFFERENT
      ===================================================== */}

      <section className="bg-[#071d49] py-20 text-white">

        <div className="mx-auto max-w-[1450px] px-5 sm:px-7 lg:px-10">

          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-center">

            <div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">
                Why Disha AI?
              </span>

              <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                Not just another
                <span className="text-cyan-300">
                  {" "}
                  LMS.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-blue-100/70">
                Traditional LMS platforms mainly deliver courses. Disha AI
                first understands the skill gap and then decides what learning
                should happen.
              </p>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/10">

              <ComparisonRow
                label="Training"
                normal="Same training for everyone"
                disha="Personalized by skill gap"
              />

              <ComparisonRow
                label="Assessment"
                normal="Fixed difficulty"
                disha="Adaptive difficulty"
              />

              <ComparisonRow
                label="Questions"
                normal="Created manually"
                disha="AI generated from material"
              />

              <ComparisonRow
                label="Progress"
                normal="Only course completion"
                disha="Actual competency mastery"
              />

              <ComparisonRow
                label="Recommendation"
                normal="Generic course catalogue"
                disha="Role + gap based learning"
              />

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="mx-auto max-w-[1450px] px-5 py-20 sm:px-7 lg:px-10">

        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-7 py-12 text-white sm:px-12 lg:px-16">

          <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                <ShieldCheck className="h-4 w-4" />

                Disha AI • SIH26101
              </div>

              <h2 className="mt-4 max-w-3xl text-3xl font-black sm:text-4xl">
                Assess. Understand. Learn. Improve.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100">
                One intelligent learning journey for building a stronger
                statistical workforce.
              </p>
            </div>

            <Link
              href="/login"
              className="group flex w-fit items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5"
            >
              Get Started

              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
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

function JourneyItem({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  color: "blue" | "violet" | "red" | "emerald" | "cyan";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    red: "bg-red-50 text-red-500",
    emerald: "bg-emerald-50 text-emerald-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <p className="mt-1 truncate text-sm font-black text-slate-800">
          {value}
        </p>
      </div>

      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
    </div>
  );
}

function Connector() {
  return (
    <div className="ml-[21px] h-4 w-px bg-gradient-to-b from-blue-200 to-slate-200" />
  );
}

function SmallChip({
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

function ExampleCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-300">
        {label}
      </p>

      <p className="mt-2 text-sm font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-blue-100/60">
        {sub}
      </p>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  description,
  items,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="group rounded-[30px] border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>

      <h3 className="mt-6 text-2xl font-black">
        {title}
      </h3>

      <p className="mt-3 min-h-[55px] text-sm leading-7 text-slate-500">
        {description}
      </p>

      <div className="my-6 h-px bg-slate-100" />

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>

            <span className="text-xs font-semibold text-slate-600">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  normal,
  disha,
}: {
  label: string;
  normal: string;
  disha: string;
}) {
  return (
    <div className="grid border-b border-white/10 last:border-b-0 sm:grid-cols-[.5fr_1fr_1fr]">

      <div className="bg-white/[0.03] p-4 text-xs font-black text-blue-200 sm:p-5">
        {label}
      </div>

      <div className="border-t border-white/10 p-4 sm:border-l sm:border-t-0 sm:p-5">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
          Traditional LMS
        </p>

        <p className="text-xs text-slate-400">
          {normal}
        </p>
      </div>

      <div className="border-t border-white/10 bg-blue-500/[0.07] p-4 sm:border-l sm:border-t-0 sm:p-5">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-cyan-300">
          Disha AI
        </p>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-300" />

          <p className="text-xs font-semibold text-white">
            {disha}
          </p>
        </div>
      </div>
    </div>
  );
}
