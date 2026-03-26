import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ExamType } from "@/types/exam"

export interface ExamAttempt {
  examType: ExamType
  date: string
  score: number
  totalQuestions: number
  correctAnswers: number
  topicBreakdown: { topic: string; correct: number; total: number; percentage: number }[]
}

interface ProgressState {
  examAttempts: ExamAttempt[]
  recordExamAttempt: (attempt: ExamAttempt) => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      examAttempts: [],
      recordExamAttempt: (attempt) =>
        set((state) => ({
          examAttempts: [...state.examAttempts, attempt],
        })),
    }),
    {
      name: "progress-store",
    }
  )
)
