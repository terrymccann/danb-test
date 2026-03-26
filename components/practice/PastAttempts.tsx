"use client"

import { Badge } from "@/components/ui/badge"
import { useProgressStore } from "@/stores/progress-store"
import { examConfigs } from "@/lib/exam-config"
import type { ExamType } from "@/types/exam"

const domainColorVar: Record<ExamType, string> = {
  gc: "var(--domain-gc)",
  rhs: "var(--domain-rhs)",
  ice: "var(--domain-ice)",
}

const examTypes: ExamType[] = ["gc", "rhs", "ice"]

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function PastAttempts() {
  const examAttempts = useProgressStore((s) => s.examAttempts)

  return (
    <div className="space-y-6">
      {examTypes.map((type) => {
        const config = examConfigs[type]
        const attempts = examAttempts
          .filter((a) => a.examType === type)
          .slice(-3)
          .reverse()

        return (
          <div key={type}>
            <h3
              className="text-sm font-semibold mb-2 pl-2"
              style={{ borderLeft: `3px solid ${domainColorVar[type]}` }}
            >
              {config.code} &mdash; {config.title}
            </h3>
            {attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground ml-4">
                No attempts yet
              </p>
            ) : (
              <ul className="space-y-1 ml-4">
                {attempts.map((attempt, i) => (
                  <li
                    key={`${attempt.date}-${i}`}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="text-muted-foreground min-w-[10rem]">
                      {formatDate(attempt.date)}
                    </span>
                    <span className="font-medium">
                      {Math.round(attempt.score)}%
                    </span>
                    <Badge
                      className={
                        attempt.passed
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }
                    >
                      {attempt.passed ? "Pass" : "Fail"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
