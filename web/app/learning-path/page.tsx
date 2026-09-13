"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BookOpen, ArrowRight } from "lucide-react";

export default function LearningPathGateway() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employee/learning-path");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col font-sans antialiased">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Redirecting to Learning Paths...</h2>
          <p className="text-xs text-slate-500">
            Accessing iGOT Karmayogi & NSSTA adaptive learning journeys.
          </p>
          <div className="pt-2">
            <Link
              href="/employee/learning-path"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition"
            >
              <span>Click here if not redirected</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
