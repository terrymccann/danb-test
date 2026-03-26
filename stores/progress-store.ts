import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  ExamAttempt,
  SessionCompletion,
  DomainStats,
} from "@/types/progress"
import type { ExamType } from "@/types/exam"

interface ProgressState {
  examAttempts: ExamAttempt[]
  sessionCompletions: Record<string, SessionCompletion>

  recordExamAttempt: (attempt: ExamAttempt) => void
  recordSessionCompletion: (completion: SessionCompletion) => void
  getDomainStats: (domain: ExamType, totalSessions: number) => DomainStats
  getOverallReadiness: () => number
  getRecentActivity: (
    limit: number
  ) => Array<{ type: "exam" | "session"; date: string; label: string }>
  reset: () => void
}

const storage = createJSONStorage<ProgressState>(() => localStorage)

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      examAttempts: [],
      sessionCompletions: {},

      recordExamAttempt: (attempt: ExamAttempt) => {
        set((state) => ({
          examAttempts: [...state.examAttempts, attempt],
        }))
      },

      recordSessionCompletion: (completion: SessionCompletion) => {
        set((state) => ({
          sessionCompletions: {
            ...state.sessionCompletions,
            [completion.sessionId]: completion,
          },
        }))
      },

      getDomainStats: (domain: ExamType, totalSessions: number): DomainStats => {
        const { examAttempts, sessionCompletions } = get()

        const domainAttempts = examAttempts.filter(
          (a) => a.examType === domain
        )
        const domainCompletions = Object.values(sessionCompletions).filter(
          (c) => c.domain === domain
        )

        const scores = domainAttempts.map((a) => a.score)
        const bestExamScore =
          scores.length > 0 ? Math.max(...scores) : null
        const averageExamScore =
          scores.length > 0
            ? scores.reduce((sum, s) => sum + s, 0) / scores.length
            : null

        const sessionsCompleted = domainCompletions.length
        const completionPercentage =
          totalSessions > 0
            ? Math.round((sessionsCompleted / totalSessions) * 100)
            : 0

        return {
          domain,
          bestExamScore,
          averageExamScore:
            averageExamScore !== null ? Math.round(averageExamScore) : null,
          examAttempts: domainAttempts.length,
          sessionsCompleted,
          sessionsTotal: totalSessions,
          completionPercentage,
        }
      },

      getOverallReadiness: (): number => {
        const { examAttempts, sessionCompletions } = get()

        const domains: ExamType[] = ["gc", "rhs", "ice"]
        const domainCompletions = domains.map((domain) => {
          const domainAttempts = examAttempts.filter(
            (a) => a.examType === domain
          )
          const domainSessions = Object.values(sessionCompletions).filter(
            (c) => c.domain === domain
          )

          const bestScore =
            domainAttempts.length > 0
              ? Math.max(...domainAttempts.map((a) => a.score))
              : 0
          const sessionScore = domainSessions.length > 0 ? 50 : 0

          return (bestScore + sessionScore) / 2
        })

        if (domainCompletions.every((c) => c === 0)) return 0

        return Math.round(
          domainCompletions.reduce((sum, c) => sum + c, 0) /
            domainCompletions.length
        )
      },

      getRecentActivity: (
        limit: number
      ): Array<{ type: "exam" | "session"; date: string; label: string }> => {
        const { examAttempts, sessionCompletions } = get()

        const examActivities = examAttempts.map((a) => ({
          type: "exam" as const,
          date: a.date,
          label: `${a.examType.toUpperCase()} Exam — ${a.score}%`,
        }))

        const sessionActivities = Object.values(sessionCompletions).map(
          (c) => ({
            type: "session" as const,
            date: c.completedDate,
            label: `Session ${c.sessionId} completed`,
          })
        )

        return [...examActivities, ...sessionActivities]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit)
      },

      reset: () => {
        set({
          examAttempts: [],
          sessionCompletions: {},
        })
      },
    }),
    {
      name: "danb-progress",
      storage,
    }
  )
)
