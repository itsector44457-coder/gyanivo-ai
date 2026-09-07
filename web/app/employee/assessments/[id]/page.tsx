"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  FileText,
  ChevronRight,
  AlertCircle,
  Loader2,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  submitAssessmentAnswer,
  getMyAssessments,
  startDiagnosticAssessment,
  SanitizedQuestion,
  SubmitAnswerResponse,
  QuestionDifficulty,
} from "@/lib/api/assessments";

export default function AssessmentPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const attemptId = parseInt(rawId, 10);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [competencyName, setCompetencyName] = useState("Diagnostic Assessment");
  const [competencyCode, setCompetencyCode] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<SanitizedQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submissionFeedback, setSubmissionFeedback] = useState<SubmitAnswerResponse['data'] | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Initialize assessment session
  useEffect(() => {
    async function initSession() {
      if (isNaN(attemptId)) {
        setError("Invalid assessment attempt ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // If integer is a competency ID or attempt ID, load session
        const res = await getMyAssessments();
        if (res.success && res.data) {
          // Check if it matches an in-progress attempt
          const active = res.data.inProgressAttempts.find((a) => a.attemptId === attemptId);
          if (active) {
            setCompetencyName(active.competencyName);
            // Request question via startDiagnostic
            const startRes = await startDiagnosticAssessment(active.competencyId);
            if (startRes.success && startRes.data) {
              setCompetencyName(startRes.data.competencyName);
              setCompetencyCode(startRes.data.competencyCode);
              setCurrentQuestion(startRes.data.question);
            }
          } else {
            // Check available diagnostics by competency ID
            const avail = res.data.availableDiagnostics.find((d) => d.competencyId === attemptId || d.activeAttemptId === attemptId);
            if (avail) {
              const startRes = await startDiagnosticAssessment(avail.competencyId);
              if (startRes.success && startRes.data) {
                setCompetencyName(startRes.data.competencyName);
                setCompetencyCode(startRes.data.competencyCode);
                setCurrentQuestion(startRes.data.question);
              }
            } else {
              // Direct start fallback
              const startRes = await startDiagnosticAssessment(attemptId);
              if (startRes.success && startRes.data) {
                setCompetencyName(startRes.data.competencyName);
                setCompetencyCode(startRes.data.competencyCode);
                setCurrentQuestion(startRes.data.question);
              }
            }
          }
        }
        questionStartTimeRef.current = Date.now();
      } catch (err: any) {
        setError(err.message || "Failed to initialize assessment player");
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, [attemptId]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentQuestion) return;

    try {
      setSubmitting(true);
      setError(null);
      const responseTimeMs = Date.now() - questionStartTimeRef.current;

      const res = await submitAssessmentAnswer(
        attemptId,
        currentQuestion.id,
        selectedOption,
        responseTimeMs,
      );

      if (res.success && res.data) {
        setSubmissionFeedback(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to evaluate answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!submissionFeedback) return;

    if (submissionFeedback.isCompleted) {
      router.push(`/employee/results/${attemptId}`);
      return;
    }

    if (submissionFeedback.nextQuestion) {
      setCurrentQuestion(submissionFeedback.nextQuestion);
      setSelectedOption(null);
      setSubmissionFeedback(null);
      questionStartTimeRef.current = Date.now();
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Preparing adaptive question calibration...</p>
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl space-y-4 my-12 text-center">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
        <h2 className="text-base font-black text-slate-900">Assessment Session Unavailable</h2>
        <p className="text-xs text-slate-600">{error}</p>
        <Link
          href="/employee/assessments"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800"
        >
          Return to Assessment Center
        </Link>
      </div>
    );
  }

  const difficultyBadgeColor =
    currentQuestion?.difficulty === "HARD"
      ? "bg-rose-100 text-rose-800 border-rose-200"
      : currentQuestion?.difficulty === "MEDIUM"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-blue-100 text-blue-800 border-blue-200";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/employee/assessments"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
            title="Exit Session"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-900">{competencyName}</h1>
              {competencyCode && (
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {competencyCode}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Question {currentQuestion?.questionNumber} of {currentQuestion?.totalQuestions} • Adaptive Calibration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${difficultyBadgeColor}`}>
            Difficulty: {currentQuestion?.difficulty}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {formatTimer(elapsedSeconds)}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Evaluation Notice</p>
            <p className="opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Question Card */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Item #{currentQuestion.questionNumber}</span>
              <span>Single Choice Question</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQuestion.questionText}
            </p>
          </div>

          {/* Options Grid */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const hasSubmitted = !!submissionFeedback;
              const hasAnswerFeedback = !!submissionFeedback?.correctOption;
              const isCorrectOption = hasAnswerFeedback && submissionFeedback?.correctOption === option.id;
              const isSelectedWrong = hasAnswerFeedback && isSelected && !submissionFeedback?.isCorrect;

              let optionStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
              if (isSelected && !hasSubmitted) {
                optionStyle = "border-blue-600 bg-blue-50/60 text-blue-950 ring-2 ring-blue-600/20";
              } else if (hasSubmitted) {
                if (hasAnswerFeedback) {
                  if (isCorrectOption) {
                    optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20";
                  } else if (isSelectedWrong) {
                    optionStyle = "border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-500/20";
                  } else {
                    optionStyle = "border-slate-200 bg-slate-50/60 text-slate-400 opacity-60";
                  }
                } else {
                  // Diagnostic Mode (Answer hidden to prevent mid-test leakage)
                  if (isSelected) {
                    optionStyle = "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20 font-bold";
                  } else {
                    optionStyle = "border-slate-200 bg-slate-50/40 text-slate-400 opacity-60";
                  }
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() => !hasSubmitted && setSelectedOption(option.id)}
                  disabled={hasSubmitted || submitting}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition cursor-pointer disabled:cursor-default ${optionStyle}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition ${
                      isSelected && !hasSubmitted
                        ? "bg-blue-700 text-white"
                        : hasAnswerFeedback && isCorrectOption
                        ? "bg-emerald-600 text-white"
                        : hasAnswerFeedback && isSelectedWrong
                        ? "bg-rose-600 text-white"
                        : isSelected && hasSubmitted
                        ? "bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {option.id}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold leading-relaxed mt-0.5">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Immediate Evaluation Feedback Box */}
          {submissionFeedback && (
            <div
              className={`p-5 rounded-2xl border space-y-3 transition ${
                submissionFeedback.correctOption
                  ? submissionFeedback.isCorrect
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                    : "bg-rose-50/80 border-rose-200 text-rose-950"
                  : "bg-blue-50/80 border-blue-200 text-blue-950"
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {submissionFeedback.correctOption ? (
                    submissionFeedback.isCorrect ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="font-black text-sm text-emerald-900">Correct Answer</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-rose-600" />
                        <span className="font-black text-sm text-rose-900">
                          Incorrect (Correct: {submissionFeedback.correctOption})
                        </span>
                      </>
                    )
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <span className="font-black text-sm text-blue-900">Response Recorded & Calibrated</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">
                    Estimated Proficiency: <strong className="font-black">{submissionFeedback.estimatedMastery}%</strong>
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                    Next Difficulty: {submissionFeedback.nextDifficulty}
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                {submissionFeedback.explanation ||
                  "Response and timing data processed by Bayesian Knowledge Tracing. Detailed item breakdowns are available upon assessment completion."}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
              {submissionFeedback ? "Answer evaluated via Bayesian Knowledge Tracing" : "Select an option and submit to calibrate competency"}
            </span>

            {!submissionFeedback ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption || submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-xs font-bold shadow-md hover:bg-blue-900 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    Submit Answer <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition ${
                  submissionFeedback.isCompleted
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-[#1E3A8A] hover:bg-blue-900"
                }`}
              >
                {submissionFeedback.isCompleted ? (
                  <>
                    <Award className="h-4 w-4" />
                    View Final Assessment Results →
                  </>
                ) : (
                  <>
                    Next Question →
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
