"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useExamStore } from "@/stores/exam-store";
import { cn } from "@/lib/utils";

export function Timer() {
  const getRemainingSeconds = useExamStore((s) => s.getRemainingSeconds);
  const submitExam = useExamStore((s) => s.submitExam);
  const isComplete = useExamStore((s) => s.isComplete);
  const [remaining, setRemaining] = useState(() => getRemainingSeconds());

  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      const secs = getRemainingSeconds();
      setRemaining(secs);
      if (secs <= 0) {
        submitExam();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingSeconds, submitExam, isComplete]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const isWarning = remaining <= 300 && remaining > 60;
  const isCritical = remaining <= 60;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-sm font-semibold",
        isCritical && "bg-destructive/10 text-destructive animate-pulse",
        isWarning && "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        !isWarning && !isCritical && "text-muted-foreground",
      )}
    >
      <Clock className="h-4 w-4" />
      {display}
    </div>
  );
}
