import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { ExamType } from "@/types/exam"
import type {
  ExamAttempt,
  SessionCompletion,
  DomainStats,
  ActivityItem,
} from "@/types/progress"

interface ProgressState {
  examAttempts: ExamAttempt[]
  sessionCompletions: SessionCompletion[]

  addExamAttempt: (attempt: ExamAttempt) => void
  addSessionCompletion: (completion: SessionCompletion) => void

  getDomainStats: (domain: ExamType, totalSessions: number) => DomainStats
  getOverallReadiness: () => number
  getRecentActivity: (limit: number) => ActivityItem[]
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      examAttempts: [],
      sessionCompletions: [],

      addExamAttempt: (attempt) => {
        set((state) => ({
          examAttempts: [...state.examAttempts, attempt],
        }))
      },

      addSessionCompletion: (completion) => {
        set((state) => ({
          sessionCompletions: [...state.sessionCompletions, completion],
        }))
      },

      getDomainStats: (domain, totalSessions) => {
        const { examAttempts, sessionCompletions } = get()
        const domainExams = examAttempts.filter((a) => a.examType === domain)
        const domainSessions = sessionCompletions.filter(
          (s) => s.domain === domain
        )

        // Unique sessions completed
        const uniqueSessionIds = new Set(domainSessions.map((s) => s.sessionId))
        const sessionsCompleted = uniqueSessionIds.size

        const bestExamScore =
          domainExams.length > 0
            ? Math.max(...domainExams.map((e) => e.percentage))
            : null

        const averageExamScore =
          domainExams.length > 0
            ? domainExams.reduce((sum, e) => sum + e.percentage, 0) /
              domainExams.length
            : null

        return {
          domain,
          sessionsCompleted,
          totalSessions,
          completionPercentage:
            totalSessions > 0
              ? Math.round((sessionsCompleted / totalSessions) * 100)
              : 0,
          bestExamScore,
          examAttempts: domainExams.length,
          averageExamScore,
        }
      },

      getOverallReadiness: () => {
        const { examAttempts, sessionCompletions } = get()
        if (examAttempts.length === 0 && sessionCompletions.length === 0)
          return 0

        // Weight: 60% exam performance, 40% session completion
        const domains: ExamType[] = ["gc", "rhs", "ice"]
        let totalScore = 0
        let totalWeight = 0

        for (const domain of domains) {
          const domainExams = examAttempts.filter((a) => a.examType === domain)
          if (domainExams.length > 0) {
            const best = Math.max(...domainExams.map((e) => e.percentage))
            totalScore += best * 0.6
            totalWeight += 0.6
          }

          const domainSessions = sessionCompletions.filter(
            (s) => s.domain === domain
          )
          if (domainSessions.length > 0) {
            // Simplified: count unique sessions as progress
            const uniqueIds = new Set(domainSessions.map((s) => s.sessionId))
            // Assume roughly 20 sessions per domain on average
            const sessionPct = Math.min(100, (uniqueIds.size / 20) * 100)
            totalScore += sessionPct * 0.4
            totalWeight += 0.4
          }
        }

        return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
      },

      getRecentActivity: (limit) => {
        const { examAttempts, sessionCompletions } = get()

        const items: ActivityItem[] = [
          ...examAttempts.map((a) => ({
            type: "exam" as const,
            label: `${a.examType.toUpperCase()} Practice Exam — ${a.percentage}%`,
            date: a.completedAt,
            domain: a.examType,
          })),
          ...sessionCompletions.map((s) => ({
            type: "session" as const,
            label: `Completed session: ${s.sessionId}`,
            date: s.completedAt,
            domain: s.domain,
          })),
        ]

        items.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        return items.slice(0, limit)
      },
    }),
    {
      name: "cda-progress",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
