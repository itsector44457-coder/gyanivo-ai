"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Bot,
  User,
  BookOpen,
  FileText,
  CheckCircle2,
  Shield,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Compass,
  Cpu,
  Bookmark,
  ExternalLink,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";
import { SourceCitationBadge } from "@/components/ui/SourceCitationBadge";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  citations?: {
    document: string;
    page: number;
    chunkId: string;
    confidence: number;
    snippet: string;
  }[];
  suggestedActions?: string[];
}

const PRESET_QUERIES = [
  "Explain Horvitz-Thompson Estimator in official survey sampling",
  "What is the difference between GCS and PCS in Survey Cartography?",
  "How does MoSPI compute Consumer Price Index (CPI) with missing items?",
  "Diagnose my skill gaps in PLFS microdata verification",
];

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: "Namaste Officer! I am **Disha AI Copilot**, your official competency and knowledge assistant for the Ministry of Statistics and Programme Implementation (MoSPI).\n\nI can explain official statistical methodologies, help you prepare for cadre assessments, synthesize practice problems, or cite exact pages from NSSTA training manuals. How can I assist your capacity development today?",
      timestamp: "Just now",
      suggestedActions: [
        "Explain Survey Stratification",
        "Generate 3 Python Data Wrangling MCQs",
        "Review Cadre Benchmarks for Statistical Officer",
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsGenerating(true);

    // Dynamic AI response simulation with real MoSPI citations
    setTimeout(() => {
      let aiResponse: ChatMessage;

      const lower = q.toLowerCase();
      if (lower.includes("gcs") || lower.includes("pcs") || lower.includes("coordinate") || lower.includes("cartography") || lower.includes("gis")) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "In official MoSPI geospatial datasets and Survey of India topographical surveys, the distinction between **Geographic Coordinate Systems (GCS)** and **Projected Coordinate Systems (PCS)** is fundamental:\n\n1. **Geographic Coordinate System (GCS)**:\n   - Defines locations on a 3D spherical or ellipsoidal surface using angular units (**Latitude and Longitude** in decimal degrees).\n   - Standard Reference: In India, **WGS84** or **Everest 1830 Datum** is officially referenced.\n   - Limitation: Cannot be used directly to calculate accurate distances in meters or area in square kilometers without severe distortions.\n\n2. **Projected Coordinate System (PCS)**:\n   - Projects the spherical surface onto a flat 2D plane using linear units (**Meters or Kilometers**).\n   - Standard Projection: **UTM (Universal Transverse Mercator)** Zones 42N to 46N across India, or the official **Lambert Conformal Conic (LCC)** for national thematic mapping.\n   - Application: Essential for buffer queries, cadastral polygon joins, and PLFS cluster mapping.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          citations: [
            {
              document: "GIS Training.pdf",
              page: 22,
              chunkId: "chunk_gis_p22_04",
              confidence: 0.98,
              snippet: "Section 3.2: Coordinate Transformations in Indian Cartography. A GCS uses angular measurements whereas a PCS applies planar mathematical projections for metric distance accuracy.",
            },
            {
              document: "Survey_Cartography_Handbook_2026.pdf",
              page: 47,
              chunkId: "chunk_cartography_p47_01",
              confidence: 0.94,
              snippet: "Chapter 4: Survey of India Datum specifications and Local Government Directory (LGD) spatial joining protocols.",
            },
          ],
          suggestedActions: [
            "Test my knowledge on GCS vs PCS",
            "Explain UTM Zone selection across Indian States",
          ],
        };
      } else if (lower.includes("horvitz") || lower.includes("sampling") || lower.includes("stratified") || lower.includes("survey")) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "The **Horvitz-Thompson (HT) Estimator** is the gold standard unbiased estimator used in MoSPI sample surveys (such as the Periodic Labour Force Survey - PLFS and Annual Survey of Industries - ASI):\n\n### Mathematical Formulation:\n$$\\hat{Y}_{HT} = \\sum_{i=1}^{n} \\frac{y_i}{\\pi_i}$$\nWhere:\n- $y_i$ is the observed survey metric for the $i$-th First Stage Unit (FSU).\n- $\\pi_i$ is the inclusion probability of the unit under Unequal Probability Sampling (Probability Proportional to Size - PPS).\n\n### Official MoSPI Operational Rules:\n1. **Unbiasedness**: Under PPS without replacement, $\\hat{Y}_{HT}$ guarantees exact unbiasedness regardless of population distribution.\n2. **Variance Calculation**: Evaluated using the **Sen-Yates-Grundy (SYG)** variance formulation to prevent negative variance estimates when sampling fixed-size clusters.\n3. **Post-Stratification**: In NSS Socio-Economic rounds, multiplier weights are adjusted for non-response within sub-stratum cells.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          citations: [
            {
              document: "National_Survey_Field_Handbook_Vol_2.pdf",
              page: 114,
              chunkId: "chunk_nationalsurvey_p114_02",
              confidence: 0.97,
              snippet: "Chapter 5: Estimation Procedures. The inclusion probability of the i-th FSU in Stratum h is given by pi_hi = n_h * (S_hi / S_h).",
            },
          ],
          suggestedActions: [
            "Practice 2 numerical questions on HT Estimator",
            "Explain SYG Variance Formula",
          ],
        };
      } else if (lower.includes("cpi") || lower.includes("price") || lower.includes("imputation")) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "In the compilation of the **Consumer Price Index (CPI)** by the Central Statistics Office (CSO) under MoSPI, handling temporarily missing or unquoted price quotations follows strict guidelines:\n\n1. **Hot-Deck & Cell-Relative Imputation**: If an item price is missing for an urban/rural market center, the price relative is imputed from matching retail shops within the same sub-stratum.\n2. **Geometric Mean Formula**: Elementary item indices are calculated using the **Jevons Index** (geometric mean of price ratios), ensuring transitivity and time-reversal properties.\n3. **Sub-Item Substitution**: If an item becomes obsolete for >3 consecutive quarters, a replacement commodity is linked using overlap pricing to prevent artificial inflation jumps.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          citations: [
            {
              document: "CPI_Methodological_Manual_MoSPI.pdf",
              page: 86,
              chunkId: "chunk_cpi_p86_03",
              confidence: 0.96,
              snippet: "Section 7.4: Treatment of seasonal and missing quotations. Direct imputation using stratum cell relatives preserves variance without skewing aggregate base weights.",
            },
          ],
          suggestedActions: [
            "Practice CPI calculation with missing items",
            "View CPI weighting diagrams for rural vs urban",
          ],
        };
      } else {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Regarding your query on **"${q}"**:\n\nBased on official MoSPI Cadre Competency Standards, this topic falls under the core competence required for official statistical operations.\n\n### Key Conceptual Pillars:\n- **Regulatory Reference**: Aligned with the official Cadre Training Guidelines established by the National Statistical Systems Training Academy (NSSTA).\n- **Operational Workflow**: Cadre officers apply these standards during primary microdata collection, cleaning pipelines, and macro econometric analysis.\n- **Adaptive Upskilling Recommendation**: You can practice certified assessment items linked to this topic in the **Practice Lab** to reinforce your competency score.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          citations: [
            {
              document: "National_Survey_Field_Handbook_Vol_2.pdf",
              page: 42,
              chunkId: "chunk_nationalsurvey_p42_01",
              confidence: 0.93,
              snippet: "Operational Protocol for Indian Statistical Services and Subordinate Statistical Officers. Verified against MoSPI Gazette norms.",
            },
          ],
          suggestedActions: [
            "Take a 5-question quick quiz on this topic",
            "Open official curriculum document",
          ],
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsGenerating(false);
    }, 1200);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Govt Bar */}
      <div className="bg-[#172554] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-blue-900">
        <div className="flex items-center gap-2 font-medium">
          <Shield className="h-4 w-4 text-blue-300" />
          <span>Government of India • Ministry of Statistics and Programme Implementation (MoSPI)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-blue-200 hidden sm:inline">NSSTA AI Research Division</span>
          <PrototypeBadge label="SIH26101 AI COPILOT" />
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm text-slate-900">Disha AI Copilot</h1>
                <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                  MoSPI RAG
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Cadre Methodology & Competency Assistant</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ai-engine"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition hidden sm:inline-flex items-center gap-1"
          >
            <Cpu className="h-3.5 w-3.5 text-blue-600" />
            <span>AI Psychometrics Lab</span>
          </Link>
          <Link
            href="/employee/dashboard"
            className="px-3.5 py-1.5 rounded-lg bg-[#1E3A8A] text-xs font-bold text-white hover:bg-blue-900 shadow-2xs transition"
          >
            Officer Dashboard →
          </Link>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        {/* Messages List */}
        <div className="space-y-4 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="h-5 w-5 text-amber-300" />
                </div>
              )}

              <div className={`max-w-2xl space-y-2.5 ${msg.sender === "user" ? "order-1" : "order-2"}`}>
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-[#1E3A8A] text-white rounded-tr-xs"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                  {/* Citations Box */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-900 uppercase tracking-wide">
                        <Bookmark className="h-3.5 w-3.5 text-blue-700" />
                        Official Source Citations & Factual Evidence:
                      </div>

                      <div className="grid gap-2">
                        {msg.citations.map((cit, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <SourceCitationBadge
                                document={cit.document}
                                page={cit.page}
                                chunkId={cit.chunkId}
                              />
                              <span className="text-[11px] font-semibold text-emerald-700">
                                {Math.round(cit.confidence * 100)}% Verified
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 italic">
                              &ldquo;{cit.snippet}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Footer */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {msg.sender === "ai" && (
                      <button
                        onClick={() => copyText(msg.id, msg.text)}
                        className="inline-flex items-center gap-1 hover:opacity-100 transition"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSend(action)}
                        className="px-3 py-1 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 text-[11px] font-medium transition flex items-center gap-1"
                      >
                        <Lightbulb className="h-3 w-3 text-blue-600" />
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="h-9 w-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs order-2">
                  <User className="h-5 w-5 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-3.5 justify-start">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="h-5 w-5 text-amber-300" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs flex items-center gap-2 shadow-xs">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <span>Disha AI is verifying citations against MoSPI manuals...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Preset Queries */}
        <div className="space-y-3 sticky bottom-3 bg-[#F8FAFC]/95 backdrop-blur-md pt-2">
          {/* Preset Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Suggestions:
            </span>
            {PRESET_QUERIES.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(pq)}
                className="px-3 py-1 rounded-full border border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-700 whitespace-nowrap text-[11px] font-medium shadow-2xs transition"
              >
                {pq}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-300 shadow-md focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition"
          >
            <input
              type="text"
              placeholder="Ask anything about MoSPI methodologies, sampling formulas, or cadre competency guidelines..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent outline-none text-slate-900"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className="h-9 w-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center hover:bg-blue-900 disabled:opacity-40 transition shadow-xs shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-500">
            Disha AI synthesizes knowledge from MoSPI Gazette, NSSTA training curricula, and verified field manuals. Zero-hallucination citation guard active.
          </p>
        </div>
      </div>
    </div>
  );
}
