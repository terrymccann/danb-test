import type { ExamType } from "@/types/exam"

export interface ExamAttempt {
  id: string
  examType: ExamType
  score: number
  totalQuestions: number
  percentage: number
  passed: boolean
  completedAt: string // ISO date
}

export interface SessionCompletion {
  sessionId: string
  domain: ExamType
  completedAt: string // ISO date
  preTestCorrect: boolean
  scenarioCorrect: boolean
  interleavedCorrect: boolean
  teachBackCompleteness: number
}

export interface DomainStats {
  domain: ExamType
  sessionsCompleted: number
  totalSessions: number
  completionPercentage: number
  bestExamScore: number | null
  examAttempts: number
  averageExamScore: number | null
}

export interface ActivityItem {
  type: "exam" | "session"
  label: string
  date: string // ISO date
  domain: ExamType
}

export interface Recommendation {
  sessionId: string
  domain: ExamType
  priority: "high" | "medium" | "low"
  reason: string
}
