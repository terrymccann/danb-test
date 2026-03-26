"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ExamType, ExamResult } from "@/types/exam"

export interface ExamAttempt {
  examType: ExamType
  date: string // ISO string
  score: number // percentage 0-100
  passed: boolean
  totalQuestions: number
  correctAnswers: number
  timeUsedSeconds: number
}

interface ProgressState {
  examAttempts: ExamAttempt[]

  // Actions
  addExamAttempt: (result: ExamResult) => void
  getAttemptsByType: (type: ExamType) => ExamAttempt[]
  getBestScore: (type: ExamType) => number | null
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      examAttempts: [],

      addExamAttempt: (result: ExamResult) => {
        const attempt: ExamAttempt = {
          examType: result.examType,
          date: new Date().toISOString(),
          score: result.percentage,
          passed: result.passed,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          timeUsedSeconds: result.timeUsedSeconds,
        }
        set((state) => ({
          examAttempts: [...state.examAttempts, attempt],
        }))
      },

      getAttemptsByType: (type: ExamType) => {
        return get().examAttempts.filter((a) => a.examType === type)
      },

      getBestScore: (type: ExamType) => {
        const attempts = get().examAttempts.filter((a) => a.examType === type)
        if (attempts.length === 0) return null
        return Math.max(...attempts.map((a) => a.score))
      },
    }),
    {
      name: "progress-storage",
    }
  )
)
