import type { ExamType } from "./exam"

export interface ExamAttempt {
  examType: ExamType
  date: string // ISO date string
  score: number // percentage 0-100
  totalQuestions: number
  correctAnswers: number
  topicBreakdown: TopicBreakdownItem[]
}

export interface TopicBreakdownItem {
  topic: string
  correct: number
  total: number
  percentage: number
}

export interface SessionCompletion {
  sessionId: string
  domain: ExamType
  completedDate: string // ISO date string
  preTestScore: "correct" | "incorrect" | null
}

export interface DomainStats {
  domain: ExamType
  bestExamScore: number | null
  averageExamScore: number | null
  examAttempts: number
  sessionsCompleted: number
  sessionsTotal: number
  completionPercentage: number
}

export interface Recommendation {
  sessionId: string
  domain: ExamType
  reason: string
  priority: "high" | "medium" | "low"
  type: "weak-area" | "review-due" | "not-started"
}
