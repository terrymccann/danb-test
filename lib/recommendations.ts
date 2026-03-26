import type {
  ExamAttempt,
  SessionCompletion,
  Recommendation,
} from "@/types/progress"
import type { ExamType } from "@/types/exam"
import type { SessionMeta } from "@/types/learn"

const PRIORITY_ORDER: Record<Recommendation["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const DOMAIN_ORDER: Record<ExamType, number> = {
  gc: 0,
  rhs: 1,
  ice: 2,
}

const WEAK_SCORE_THRESHOLD = 75
const REVIEW_DUE_DAYS = 7

export function getRecommendations(
  examAttempts: ExamAttempt[],
  sessionCompletions: Record<string, SessionCompletion>,
  allSessions: SessionMeta[]
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Group sessions by domain
  const sessionsByDomain = new Map<ExamType, SessionMeta[]>()
  for (const session of allSessions) {
    const group = sessionsByDomain.get(session.domain) ?? []
    group.push(session)
    sessionsByDomain.set(session.domain, group)
  }

  // Find best exam score per domain
  const bestScoreByDomain = new Map<ExamType, number>()
  for (const attempt of examAttempts) {
    const current = bestScoreByDomain.get(attempt.examType)
    if (current === undefined || attempt.score > current) {
      bestScoreByDomain.set(attempt.examType, attempt.score)
    }
  }

  const now = Date.now()

  for (const [domain, sessions] of sessionsByDomain) {
    const bestScore = bestScoreByDomain.get(domain)

    for (const session of sessions) {
      const completion = sessionCompletions[session.id]

      if (!completion) {
        // Not started
        if (bestScore !== undefined && bestScore < WEAK_SCORE_THRESHOLD) {
          // Weak area — incomplete session in a domain with low score
          recommendations.push({
            sessionId: session.id,
            domain,
            reason: `Best ${domain.toUpperCase()} exam score is ${bestScore}% — review needed`,
            priority: "high",
            type: "weak-area",
          })
        } else {
          // Just not started
          recommendations.push({
            sessionId: session.id,
            domain,
            reason: `Session not yet started`,
            priority: "low",
            type: "not-started",
          })
        }
      } else {
        // Completed — check if review is due
        const completedTime = new Date(completion.completedDate).getTime()
        const daysSince = (now - completedTime) / (1000 * 60 * 60 * 24)

        if (daysSince > REVIEW_DUE_DAYS) {
          recommendations.push({
            sessionId: session.id,
            domain,
            reason: `Completed ${Math.floor(daysSince)} days ago — review recommended`,
            priority: "medium",
            type: "review-due",
          })
        }
      }
    }
  }

  // Sort by priority (high → medium → low), then by domain
  recommendations.sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return DOMAIN_ORDER[a.domain] - DOMAIN_ORDER[b.domain]
  })

  return recommendations
}
