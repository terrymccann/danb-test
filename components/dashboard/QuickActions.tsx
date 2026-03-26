"use client"

import Link from "next/link"
import { BookOpen, FileText, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useProgressStore } from "@/stores/progress-store"
import { domainConfigs } from "@/data/learn/index"
import { getRecommendations } from "@/lib/recommendations"
import type { ExamType } from "@/types/exam"
import type { SessionMeta } from "@/types/learn"

function getTotalSessions(domain: ExamType): number {
  const config = domainConfigs.find((c) => c.domain === domain)
  if (!config) return 0
  return config.subDomains.reduce((sum, sd) => sum + sd.sessions.length, 0)
}

function getAllSessions(): SessionMeta[] {
  return domainConfigs.flatMap((c) =>
    c.subDomains.flatMap((sd) => sd.sessions)
  )
}

export function QuickActions() {
  const { getDomainStats, examAttempts, sessionCompletions } =
    useProgressStore()

  // Find incomplete domain for "Continue Learning"
  const domains: ExamType[] = ["gc", "rhs", "ice"]
  const incompleteDomain = domains.find((d) => {
    const stats = getDomainStats(d, getTotalSessions(d))
    return stats.completionPercentage < 100
  })
  const incompleteDomainConfig = incompleteDomain
    ? domainConfigs.find((c) => c.domain === incompleteDomain)
    : null

  // Find weakest domain for practice exam suggestion
  let weakestDomainLabel: string | null = null
  if (examAttempts.length > 0) {
    let worstScore = Infinity
    for (const d of domains) {
      const domainExams = examAttempts.filter((a) => a.examType === d)
      if (domainExams.length > 0) {
        const avg =
          domainExams.reduce((s, e) => s + e.percentage, 0) /
          domainExams.length
        if (avg < worstScore) {
          worstScore = avg
          const cfg = domainConfigs.find((c) => c.domain === d)
          weakestDomainLabel = cfg?.title ?? d.toUpperCase()
        }
      }
    }
  }

  // Recommendations
  const allSessions = getAllSessions()
  const recommendations = getRecommendations(
    examAttempts,
    sessionCompletions,
    allSessions
  )
  const highPriority = recommendations.filter((r) => r.priority === "high")

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Link href="/learn">
        <Card className="p-5 hover:shadow-sm transition-shadow cursor-pointer">
          <BookOpen className="h-5 w-5 text-primary mb-2" />
          <div className="font-medium">Continue Learning</div>
          <div className="text-sm text-muted-foreground">
            {incompleteDomainConfig
              ? incompleteDomainConfig.title
              : "All sessions complete!"}
          </div>
        </Card>
      </Link>

      <Link href="/practice">
        <Card className="p-5 hover:shadow-sm transition-shadow cursor-pointer">
          <FileText className="h-5 w-5 text-primary mb-2" />
          <div className="font-medium">Practice Exam</div>
          <div className="text-sm text-muted-foreground">
            {weakestDomainLabel
              ? `Try ${weakestDomainLabel}`
              : "Test your knowledge"}
          </div>
        </Card>
      </Link>

      <Link href="/learn">
        <Card className="p-5 hover:shadow-sm transition-shadow cursor-pointer">
          <Target className="h-5 w-5 text-primary mb-2" />
          <div className="font-medium">Weak Areas</div>
          <div className="text-sm text-muted-foreground">
            {highPriority.length > 0
              ? `${highPriority.length} area${highPriority.length !== 1 ? "s" : ""} need attention`
              : "Looking good! Keep practicing."}
          </div>
        </Card>
      </Link>
    </div>
  )
}
