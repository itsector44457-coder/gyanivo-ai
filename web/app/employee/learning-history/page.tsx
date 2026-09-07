"use client";

import React from "react";
import { History, Award, CheckCircle2, FileText, Download } from "lucide-react";
import { PrototypeBadge } from "@/components/ui/Badge";

export default function EmployeeLearningHistoryPage() {
  const historyItems = [
    {
      id: "h-1",
      title: "GIS Baseline Diagnostic Assessment",
      type: "Adaptive Assessment",
      date: "12 May 2026",
      score: "25%",
      source: "GIS Training.pdf",
      duration: "15 mins",
      status: "Verified",
    },
    {
      id: "h-2",
      title: "SQL Diagnostic Exam for Census Tables",
      type: "Diagnostic Assessment",
      date: "18 May 2026",
      score: "71%",
      source: "MoSPI_Database_Architecture.pdf",
      duration: "20 mins",
      status: "Verified",
    },
    {
      id: "h-3",
      title: "Advanced Statistics for SSS Officers",
      type: "Post-Training Certification",
      date: "20 May 2026",
      score: "78%",
      source: "NSSTA_Official_Statistics_Vol2.pdf",
      duration: "30 mins",
      status: "Certified",
    },
    {
      id: "h-4",
      title: "Python Data Scrubbing Lab",
      type: "Practice Module",
      date: "10 Jul 2026",
      score: "85%",
      source: "Python_Data_Science_Handbook.pdf",
      duration: "45 mins",
      status: "Verified",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Learning History & Audit Trail
            </h1>
            <PrototypeBadge />
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Chronological record of completed modules, diagnostic evaluations, and issued certifications
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-700">
            <tr>
              <th className="px-5 py-3.5">Activity</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5 text-center">Score</th>
              <th className="px-5 py-3.5">Source Document</th>
              <th className="px-5 py-3.5">Duration</th>
              <th className="px-5 py-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {historyItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-slate-900">{item.title}</td>
                <td className="px-5 py-4 text-slate-500">{item.type}</td>
                <td className="px-5 py-4">{item.date}</td>
                <td className="px-5 py-4 text-center font-black text-blue-900">{item.score}</td>
                <td className="px-5 py-4 font-mono text-[11px] text-slate-500">{item.source}</td>
                <td className="px-5 py-4">{item.duration}</td>
                <td className="px-5 py-4 text-right">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
