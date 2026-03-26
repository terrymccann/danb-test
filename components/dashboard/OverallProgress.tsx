"use client"

import { useProgressStore } from "@/stores/progress-store"
import { domainConfigs } from "@/data/learn/index"
import type { ExamType } from "@/types/exam"

function getTotalSessions(domain: ExamType): number {
  const config = domainConfigs.find((c) => c.domain === domain)
  if (!config) return 0
  return config.subDomains.reduce((sum, sd) => sum + sd.sessions.length, 0)
}

export function OverallProgress() {
  const { getDomainStats, getOverallReadiness } = useProgressStore()

  const domains: { domain: ExamType; label: string; colorVar: string }[] = [
    { domain: "gc", label: "General Chairside", colorVar: "--domain-gc" },
    { domain: "rhs", label: "Radiation Health & Safety", colorVar: "--domain-rhs" },
    { domain: "ice", label: "Infection Control", colorVar: "--domain-ice" },
  ]

  const stats = domains.map((d) => ({
    ...d,
    stats: getDomainStats(d.domain, getTotalSessions(d.domain)),
  }))

  const readiness = getOverallReadiness()
  const hasData = stats.some(
    (s) => s.stats.sessionsCompleted > 0 || s.stats.examAttempts > 0
  )

  // Calculate proportional widths for the segmented bar
  const totalCompletion = stats.reduce(
    (sum, s) => sum + s.stats.completionPercentage,
    0
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">CDA Readiness</span>
        <span className="text-sm font-medium">{readiness}%</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden flex">
        {hasData &&
          stats.map((s) => {
            const width =
              totalCompletion > 0
                ? (s.stats.completionPercentage / totalCompletion) *
                  readiness
                : 0
            return (
              <div
                key={s.domain}
                className="h-full transition-all duration-500"
                style={{
                  width: `${width}%`,
                  backgroundColor: `var(${s.colorVar})`,
                }}
              />
            )
          })}
      </div>
      {hasData ? (
        <div className="flex gap-4 mt-2">
          {stats.map((s) => (
            <div key={s.domain} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: `var(${s.colorVar})` }}
              />
              {s.label} {s.stats.completionPercentage}%
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mt-2">
          Take your first exam or learning session to start tracking progress
        </p>
      )}
    </div>
  )
}
