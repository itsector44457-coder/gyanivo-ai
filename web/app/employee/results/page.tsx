"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EmployeeResultsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employee/assessments");
  }, [router]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      <p className="text-xs text-slate-500 font-medium">Redirecting to Assessment Center...</p>
    </div>
  );
}
