"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Skill = {
  id: number;
  name: string;
  code: string;
  weight: number;
};

type WeakestSkill = {
  id: number;
  code: string;
  name: string;
  mastery: number;
};

type AdaptiveQuestion = {
  student: {
    id: number;
    name: string;
    classLevel: number;
  };

  adaptiveState: {
    averageMastery: number;
    selectedDifficulty: number;
    weakestSkill: WeakestSkill | null;
  };

  question: {
    id: number;
    question: string;
    difficulty: number;
    questionType: string;

    chapter: {
      id: number;
      name: string;
    };

    topic: {
      id: number;
      name: string;
    };

    skills: Skill[];
  };
};

type StepResult = {
  correct: boolean;
  mistakeType: string;
  skill: string | null;
  retry: boolean;
  message: string;

  attemptId: number;
  savedStepId: number;

  stepNumber: number;
  attemptNumber: number;

  finalStepNumber: number;

  attemptCompleted: boolean;

  nextStepNumber: number;
};

type CompletedStep = {
  stepNumber: number;
  value: string;
};

const API_URL = "http://localhost:5000";

export default function PracticePage() {
  const STUDENT_ID = 1;
  const CLASS_LEVEL = 7;
  const SUBJECT = "MATH";

  const [data, setData] =
    useState<AdaptiveQuestion | null>(null);

  const [attemptId, setAttemptId] =
    useState<number | null>(null);

  const [studentStep, setStudentStep] =
    useState("");

  const [currentStep, setCurrentStep] =
    useState(1);

  const [result, setResult] =
    useState<StepResult | null>(null);

  const [loadingQuestion, setLoadingQuestion] =
    useState(true);

  const [checkingStep, setCheckingStep] =
    useState(false);

  const [startingAttempt, setStartingAttempt] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [completedSteps, setCompletedSteps] =
    useState<CompletedStep[]>([]);

  const [questionStartedAt, setQuestionStartedAt] =
    useState(Date.now());

  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAdaptiveQuestion();
  }, []);

  async function loadAdaptiveQuestion() {
    try {
      setLoadingQuestion(true);
      setError(null);

      setData(null);
      setAttemptId(null);
      setStudentStep("");
      setResult(null);
      setCurrentStep(1);
      setCompletedSteps([]);

      const response = await fetch(
        `${API_URL}/questions/adaptive?studentId=${STUDENT_ID}&class=${CLASS_LEVEL}&subject=${SUBJECT}`,
        {
          method: "GET",
        }
      );

      const responseData =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            "Unable to load adaptive question"
        );
      }

      const adaptiveData =
        responseData as AdaptiveQuestion;

      setData(adaptiveData);

      await startAttempt(
        adaptiveData.question.id
      );

      setQuestionStartedAt(Date.now());

      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load question"
      );
    } finally {
      setLoadingQuestion(false);
    }
  }

  async function startAttempt(
    questionId: number
  ) {
    try {
      setStartingAttempt(true);

      const response = await fetch(
        `${API_URL}/attempts/start`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            studentId: STUDENT_ID,
            questionId,
          }),
        }
      );

      const responseData =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            "Unable to start attempt"
        );
      }

      setAttemptId(
        responseData.attemptId
      );
    } catch (err) {
      throw err;
    } finally {
      setStartingAttempt(false);
    }
  }

  async function checkStep() {
    if (!attemptId) {
      setError(
        "Attempt has not started yet."
      );

      return;
    }

    if (!studentStep.trim()) {
      setError(
        "Please enter your next step."
      );

      return;
    }

    try {
      setCheckingStep(true);
      setError(null);

      const timeTakenSec =
        Math.max(
          1,
          Math.round(
            (Date.now() -
              questionStartedAt) /
              1000
          )
        );

      const response = await fetch(
        `${API_URL}/attempts/${attemptId}/validate-step`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            studentStep:
              studentStep.trim(),

            stepNumber:
              currentStep,

            timeTakenSec,

            hintUsed: false,
          }),
        }
      );

      const validation =
        await response.json();

      if (!response.ok) {
        throw new Error(
          validation.message ||
            "Unable to validate step"
        );
      }

      setResult(validation);

      if (validation.correct) {
        setCompletedSteps(
          (previous) => [
            ...previous,
            {
              stepNumber:
                currentStep,

              value:
                studentStep.trim(),
            },
          ]
        );

        setStudentStep("");

        if (
          !validation.attemptCompleted
        ) {
          setCurrentStep(
            validation.nextStepNumber
          );

          setQuestionStartedAt(
            Date.now()
          );

          setTimeout(() => {
            inputRef.current?.focus();
          }, 150);
        }
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setCheckingStep(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Enter" &&
      !checkingStep
    ) {
      checkStep();
    }
  }

  function getDifficultyLabel(
    difficulty: number
  ) {
    if (difficulty === 1) {
      return "Easy";
    }

    if (difficulty === 2) {
      return "Medium";
    }

    return "Hard";
  }

  function getDifficultyClasses(
    difficulty: number
  ) {
    if (difficulty === 1) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (difficulty === 2) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  function getMasteryMessage(
    mastery: number
  ) {
    if (mastery >= 80) {
      return "Excellent progress";
    }

    if (mastery >= 60) {
      return "Building strong mastery";
    }

    if (mastery >= 40) {
      return "Learning in progress";
    }

    return "Let's strengthen the basics";
  }

  if (loadingQuestion) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-violet-200 blur-xl opacity-60" />

            <div className="relative h-16 w-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <div className="h-7 w-7 rounded-full border-[3px] border-slate-200 border-t-violet-600 animate-spin" />
            </div>
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            Gyanivo AI is preparing your question
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Analysing your mastery and selecting the best next problem...
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl">
            !
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Unable to load practice
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {error ||
              "Something went wrong while loading your question."}
          </p>

          <button
            onClick={
              loadAdaptiveQuestion
            }
            className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const mastery =
    data.adaptiveState.averageMastery;

  const progress =
    result?.finalStepNumber
      ? Math.min(
          100,
          Math.round(
            (completedSteps.length /
              result.finalStepNumber) *
              100
          )
        )
      : completedSteps.length > 0
        ? Math.min(
            90,
            completedSteps.length * 20
          )
        : 5;

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* TOP BACKGROUND GLOW */}

      <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-[420px] overflow-hidden">
        <div className="absolute -top-40 left-[10%] h-[360px] w-[360px] rounded-full bg-violet-200/50 blur-[100px]" />

        <div className="absolute -top-44 right-[10%] h-[420px] w-[420px] rounded-full bg-sky-200/50 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* NAVBAR */}

        <header className="mb-6 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white shadow-lg shadow-violet-200">
              G
            </div>

            <div>
              <h1 className="font-bold tracking-tight text-slate-950">
                Gyanivo AI
              </h1>

              <p className="text-xs text-slate-500">
                Adaptive Learning Engine
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />

            <span className="text-sm font-medium text-slate-600">
              AI Engine Active
            </span>
          </div>
        </header>

        {/* STUDENT + STATS */}

        <section className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
              <span className="rounded-full bg-violet-100 px-3 py-1">
                Adaptive Practice
              </span>

              <span className="text-slate-400">
                •
              </span>

              <span className="text-slate-500">
                Class {data.student.classLevel}
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Good to see you,{" "}
              {data.student.name}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Gyanivo is adjusting your questions in real time based on your mistakes, speed and concept mastery.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-[135px] rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mastery
              </p>

              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-bold text-slate-950">
                  {mastery}
                </span>

                <span className="mb-1 text-sm font-semibold text-slate-400">
                  %
                </span>
              </div>
            </div>

            <div className="min-w-[135px] rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Difficulty
              </p>

              <div
                className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-sm font-bold ${getDifficultyClasses(
                  data.adaptiveState
                    .selectedDifficulty
                )}`}
              >
                {getDifficultyLabel(
                  data.adaptiveState
                    .selectedDifficulty
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
          {/* MAIN PRACTICE CARD */}

          <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40">
            {/* PROGRESS HEADER */}

            <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                      Mathematics
                    </span>

                    <span className="text-xs font-medium text-slate-400">
                      {data.question.chapter.name}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {data.question.topic.name}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                  <p className="text-xs font-medium text-slate-500">
                    Current Step
                  </p>

                  <p className="text-lg font-bold text-slate-950">
                    {currentStep}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-medium">
                  <span className="text-slate-500">
                    Solution progress
                  </span>

                  <span className="text-slate-700">
                    {progress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* QUESTION */}

              <div className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-6 sm:p-8">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl" />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
                      Your Question
                    </p>

                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      ID #{data.question.id}
                    </span>
                  </div>

                  <h3 className="max-w-4xl text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                    {data.question.question}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Solve it one step at a time. Gyanivo checks your method, not just the final answer.
                  </p>
                </div>
              </div>

              {/* COMPLETED STEPS */}

              {completedSteps.length >
                0 && (
                <div className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">
                      Your solution
                    </h4>

                    <span className="text-xs font-medium text-emerald-600">
                      {
                        completedSteps.length
                      }{" "}
                      steps correct
                    </span>
                  </div>

                  <div className="space-y-3">
                    {completedSteps.map(
                      (step) => (
                        <div
                          key={
                            step.stepNumber
                          }
                          className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                            ✓
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                              Step{" "}
                              {
                                step.stepNumber
                              }
                            </p>

                            <p className="mt-1 break-words text-lg font-semibold text-slate-900">
                              {
                                step.value
                              }
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* INPUT AREA */}

              {!result?.attemptCompleted && (
                <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-950">
                        Enter your next step
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Don't jump to the final answer. Show how you're thinking.
                      </p>
                    </div>

                    <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-violet-100 px-3 text-sm font-bold text-violet-700">
                      {currentStep}
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      ref={inputRef}
                      value={
                        studentStep
                      }
                      onChange={(e) => {
                        setStudentStep(
                          e.target.value
                        );

                        setResult(
                          null
                        );
                      }}
                      onKeyDown={
                        handleKeyDown
                      }
                      placeholder="Example: 6x = 40 - 4"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 pr-14 text-lg font-medium text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />

                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      ↵
                    </div>
                  </div>

                  <button
                    onClick={
                      checkStep
                    }
                    disabled={
                      checkingStep ||
                      startingAttempt
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 font-bold text-white shadow-lg shadow-violet-200/60 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {checkingStep ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />

                        Analysing your step...
                      </>
                    ) : (
                      <>
                        Check My Step
                        <span>
                          →
                        </span>
                      </>
                    )}
                  </button>

                  <p className="mt-3 text-center text-xs text-slate-400">
                    Press Enter to submit
                  </p>
                </div>
              )}

              {/* RESULT */}

              {result && (
                <div
                  className={`mt-6 rounded-3xl border p-5 sm:p-6 ${
                    result.correct
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${
                        result.correct
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-400 text-white"
                      }`}
                    >
                      {result.correct
                        ? "✓"
                        : "!"}
                    </div>

                    <div className="flex-1">
                      <h4
                        className={`text-lg font-bold ${
                          result.correct
                            ? "text-emerald-900"
                            : "text-amber-900"
                        }`}
                      >
                        {result.correct
                          ? result.attemptCompleted
                            ? "Question completed!"
                            : "Excellent, this step is correct"
                          : "You're close — try again"}
                      </h4>

                      <p
                        className={`mt-2 text-sm leading-6 ${
                          result.correct
                            ? "text-emerald-800"
                            : "text-amber-800"
                        }`}
                      >
                        {
                          result.message
                        }
                      </p>

                      {!result.correct &&
                        result.mistakeType && (
                          <div className="mt-4 inline-flex rounded-lg border border-amber-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-amber-800">
                            Detected:{" "}
                            {
                              result.mistakeType
                            }
                          </div>
                        )}

                      {result.attemptCompleted && (
                        <button
                          onClick={
                            loadAdaptiveQuestion
                          }
                          className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                        >
                          Continue to next adaptive question →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="font-semibold text-red-800">
                    Something needs attention
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SIDEBAR */}

          <aside className="space-y-5">
            {/* AI COACH */}

            <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-xl shadow-indigo-200/40">
              <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-violet-500/30 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl ring-1 ring-white/20">
                    AI
                  </div>

                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-300/20">
                    Online
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  Gyanivo Tutor
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  I'll guide you without immediately revealing the answer.
                </p>

                <button
                  disabled
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:cursor-not-allowed"
                >
                  <span className="text-lg">
                    🎙
                  </span>
                  Ask AI Teacher
                </button>

                <p className="mt-3 text-center text-[11px] text-slate-400">
                  Voice conversation coming next
                </p>
              </div>
            </div>

            {/* MASTERY */}

            <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Learning Mastery
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-slate-950">
                    {mastery}%
                  </h3>
                </div>

                <div className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                  AI Score
                </div>
              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500"
                  style={{
                    width: `${mastery}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                {getMasteryMessage(
                  mastery
                )}
              </p>
            </div>

            {/* WEAKEST SKILL */}

            <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Focus Area
                </p>

                <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                  Priority
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                {data.adaptiveState
                  .weakestSkill
                  ?.name ??
                  "Learning profile building"}
              </h3>

              {data.adaptiveState
                .weakestSkill && (
                <>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Gyanivo is selecting more questions around this skill to strengthen your understanding.
                  </p>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">
                        Skill mastery
                      </span>

                      <span className="text-slate-900">
                        {
                          data
                            .adaptiveState
                            .weakestSkill
                            .mastery
                        }
                        %
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{
                          width: `${data.adaptiveState.weakestSkill.mastery}%`,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* SKILLS */}

            <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Skills Tested
              </p>

              <div className="mt-4 space-y-3">
                {data.question.skills.map(
                  (skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {
                            skill.name
                          }
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {
                            skill.code
                          }
                        </p>
                      </div>

                      <div className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-600 shadow-sm">
                        {skill.weight}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}