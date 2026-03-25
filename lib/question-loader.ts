import { ExamType, Question } from "@/types/exam"

// Static imports for all question files
import gcQuestions500 from "@/data/gc/danb_gc_500_questions.json"
import rhsQuestions500 from "@/data/rhs/danb_rhs_500_questions.json"
import iceQuestions500 from "@/data/ice/DANB_ICE_500_Questions.json"

const OPTION_IDS = ["a", "b", "c", "d"] as const

interface IndexedQuestionBank {
  questions: {
    id: number
    domain: string
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }[]
}

/** Convert the {correctIndex, options: string[]} format to our Question interface */
function transformIndexedQuestions(
  data: IndexedQuestionBank,
  examType: ExamType
): Question[] {
  return data.questions
    .filter(
      (q) =>
        Array.isArray(q.options) &&
        typeof q.correctIndex === "number" &&
        typeof q.question === "string"
    )
    .map((q) => {
      const options = q.options.map((text, i) => ({
        id: OPTION_IDS[i],
        text,
      }))
      return {
        id: `${examType}-${q.id}`,
        examType,
        topic: q.domain,
        stem: q.question,
        options,
        correctOptionId: OPTION_IDS[q.correctIndex],
        explanation: q.explanation,
      }
    })
}

const questionPools: Record<ExamType, Question[]> = {
  gc: transformIndexedQuestions(gcQuestions500 as IndexedQuestionBank, "gc"),
  rhs: transformIndexedQuestions(rhsQuestions500 as IndexedQuestionBank, "rhs"),
  ice: transformIndexedQuestions(iceQuestions500 as IndexedQuestionBank, "ice"),
}

/** Fisher-Yates shuffle (in-place, returns same array) */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Shuffle option order within a question (correctOptionId references id, not position) */
function shuffleOptions(question: Question): Question {
  return {
    ...question,
    options: shuffle(question.options),
  }
}

/**
 * Load questions for an exam type.
 * Shuffles the pool, takes `count` questions, and shuffles each question's options.
 * If pool has fewer than `count`, returns all available (shuffled).
 */
export function loadQuestions(examType: ExamType, count: number): Question[] {
  const pool = questionPools[examType]
  if (!pool || pool.length === 0) return []

  const shuffled = shuffle(pool)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))
  return selected.map(shuffleOptions)
}

/** Get total available questions for an exam type */
export function getQuestionPoolSize(examType: ExamType): number {
  return questionPools[examType]?.length ?? 0
}
