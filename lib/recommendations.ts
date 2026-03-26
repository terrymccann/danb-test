import type { ExamType } from "@/types/exam"
import type {
  ExamAttempt,
  SessionCompletion,
  Recommendation,
} from "@/types/progress"
import type { SessionMeta } from "@/types/learn"

export function getRecommendations(
  examAttempts: ExamAttempt[],
  sessionCompletions: SessionCompletion[],
  allSessions: SessionMeta[]
): Recommendation[] {
  const recommendations: Recommendation[] = []
  const completedSessionIds = new Set(
    sessionCompletions.map((s) => s.sessionId)
  )

  // Find domains with low exam scores
  const domainScores: Record<ExamType, number[]> = {
    gc: [],
    rhs: [],
    ice: [],
  }
  for (const attempt of examAttempts) {
    domainScores[attempt.examType].push(attempt.percentage)
  }

  // Sessions where pre-test or scenario was wrong -> high priority
  const weakSessions = sessionCompletions.filter(
    (s) => !s.preTestCorrect || !s.scenarioCorrect
  )
  const weakSessionIds = new Set(weakSessions.map((s) => s.sessionId))

  for (const session of allSessions) {
    if (!session.available) continue

    // High priority: completed but got questions wrong
    if (weakSessionIds.has(session.id)) {
      recommendations.push({
        sessionId: session.id,
        domain: session.domain,
        priority: "high",
        reason: `Review needed — you missed questions in "${session.title}"`,
      })
      continue
    }

    // High priority: domain exam score below 75% and session not completed
    const scores = domainScores[session.domain]
    const latestScore = scores.length > 0 ? scores[scores.length - 1] : null
    if (
      latestScore !== null &&
      latestScore < 75 &&
      !completedSessionIds.has(session.id)
    ) {
      recommendations.push({
        sessionId: session.id,
        domain: session.domain,
        priority: "high",
        reason: `Your ${session.domain.toUpperCase()} exam score is below passing — study "${session.title}"`,
      })
      continue
    }

    // Medium priority: not yet completed
    if (!completedSessionIds.has(session.id)) {
      recommendations.push({
        sessionId: session.id,
        domain: session.domain,
        priority: "medium",
        reason: `Not yet completed: "${session.title}"`,
      })
      continue
    }

    // Low priority: completed successfully
    if (completedSessionIds.has(session.id) && !weakSessionIds.has(session.id)) {
      recommendations.push({
        sessionId: session.id,
        domain: session.domain,
        priority: "low",
        reason: `Review for retention: "${session.title}"`,
      })
    }
  }

  // Sort: high first, then medium, then low
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )

  return recommendations
}
