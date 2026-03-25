"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, FileText, AlertTriangle } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getExamConfig } from "@/lib/exam-config"
import { getQuestionPoolSize } from "@/lib/question-loader"
import { useExamStore } from "@/stores/exam-store"
import { ExamType } from "@/types/exam"

export default function ExamInstructionsPage({
  params,
}: {
  params: Promise<{ examType: string }>
}) {
  const { examType } = use(params)
  const router = useRouter()
  const startExam = useExamStore((s) => s.startExam)
  const config = getExamConfig(examType)

  if (!config) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Exam Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The exam type &quot;{examType}&quot; does not exist.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-4" })}>
          Back to Home
        </Link>
      </main>
    )
  }

  const poolSize = getQuestionPoolSize(config.type)
  const questionsToUse = Math.min(config.questionCount, poolSize)

  const handleStart = () => {
    startExam(examType as ExamType)
    router.push(`/exam/${examType}/session`)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "mb-6",
        })}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Exams
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-semibold">
              {config.code}
            </Badge>
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{questionsToUse} Questions</p>
                <p className="text-xs text-muted-foreground">Multiple choice</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{config.timeLimitMinutes} Minutes</p>
                <p className="text-xs text-muted-foreground">Time limit</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold">Instructions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                - Each question has one correct answer. Select the best option.
              </li>
              <li>
                - You can navigate between questions and change your answers at
                any time before submitting.
              </li>
              <li>
                - Use the flag feature to mark questions you want to revisit.
              </li>
              <li>
                - The exam will auto-submit when time runs out. Unanswered
                questions are marked incorrect.
              </li>
              <li>- A score of 75% or higher is considered passing.</li>
            </ul>
          </div>

          {poolSize < config.questionCount && (
            <>
              <Separator />
              <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  The question pool currently has {poolSize} questions (exam
                  requires {config.questionCount}). The practice exam will use
                  all {poolSize} available questions.
                </p>
              </div>
            </>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleStart} size="lg" className="flex-1">
              Start Exam
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
