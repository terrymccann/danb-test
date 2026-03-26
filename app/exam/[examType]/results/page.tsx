"use client"

import { use, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { RotateCcw, Target } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ResultsSummary } from "@/components/exam/ResultsSummary"
import { useExamStore } from "@/stores/exam-store"
import { useProgressStore } from "@/stores/progress-store"
import { getExamConfig } from "@/lib/exam-config"
import { ExamType } from "@/types/exam"

export default function ResultsPage({
  params,
}: {
  params: Promise<{ examType: string }>
}) {
  const { examType } = use(params)
  const router = useRouter()
  const result = useExamStore((s) => s.result)
  const questions = useExamStore((s) => s.questions)
  const answers = useExamStore((s) => s.answers)
  const startExam = useExamStore((s) => s.startExam)
  const recordExamAttempt = useProgressStore((s) => s.recordExamAttempt)
  const hasRecorded = useRef(false)

  const config = getExamConfig(examType)

  useEffect(() => {
    if (!result) {
      router.replace("/")
    }
  }, [result, router])

  // Record exam attempt to progress store
  useEffect(() => {
    if (result && !hasRecorded.current) {
      hasRecorded.current = true
      recordExamAttempt({
        examType: result.examType,
        date: new Date().toISOString(),
        score: result.percentage,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        topicBreakdown: result.topicScores,
      })
    }
  }, [result, recordExamAttempt])

  if (!result || !config) return null

  const handleRetake = () => {
    startExam(examType as ExamType)
    router.push(`/exam/${examType}/session`)
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <Badge variant="outline">{config.code}</Badge>
        </div>
        <p className="text-muted-foreground">Results</p>
      </div>

      <ResultsSummary result={result} questions={questions} answers={answers} />

      <div className="flex gap-3 mt-6">
        <Link
          href="/practice"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to Practice
        </Link>
        <Button onClick={handleRetake} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Retake Exam
        </Button>
        <Link
          href="/learn"
          className={buttonVariants({ variant: "outline", className: "gap-2" })}
        >
          <Target className="h-4 w-4" />
          Review Weak Areas
        </Link>
      </div>
    </main>
  )
}
