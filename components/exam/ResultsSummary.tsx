"use client"

import {
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { PASS_THRESHOLD } from "@/lib/exam-config"
import { ExamResult, Question } from "@/types/exam"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ResultsSummaryProps {
  result: ExamResult
  questions: Question[]
  answers: Record<string, string>
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function ResultsSummary({
  result,
  questions,
  answers,
}: ResultsSummaryProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Score overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-full",
                result.passed
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {result.passed ? (
                <CheckCircle2 className="h-10 w-10" />
              ) : (
                <XCircle className="h-10 w-10" />
              )}
            </div>
            <div>
              <p className="text-4xl font-bold">
                {result.correctAnswers}/{result.totalQuestions}
              </p>
              <p className="text-lg text-muted-foreground">
                {result.percentage.toFixed(1)}%
              </p>
            </div>
            <Badge
              variant={result.passed ? "default" : "destructive"}
              className="text-sm"
            >
              {result.passed
                ? "PASSING SCORE"
                : `Below ${PASS_THRESHOLD * 100}% threshold`}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Time used: {formatTime(result.timeUsedSeconds)} /{" "}
              {formatTime(result.timeLimitSeconds)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topic breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Topic Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.topicScores.map((topic) => (
            <div key={topic.topic} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{topic.topic}</span>
                <span className="text-muted-foreground">
                  {topic.correct}/{topic.total} ({topic.percentage.toFixed(0)}%)
                </span>
              </div>
              <Progress
                value={topic.percentage}
                className={cn(
                  "h-2",
                  topic.percentage >= PASS_THRESHOLD * 100
                    ? "[&>[data-slot=indicator]]:bg-green-500"
                    : "[&>[data-slot=indicator]]:bg-destructive"
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Question review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questions.map((question, index) => {
              const selectedId = answers[question.id] ?? null
              const isCorrect = selectedId === question.correctOptionId
              const isExpanded = expandedQuestion === question.id

              return (
                <div
                  key={question.id}
                  className={cn(
                    "rounded-lg border p-4",
                    isCorrect
                      ? "border-green-200 dark:border-green-900"
                      : "border-destructive/30"
                  )}
                >
                  <button
                    onClick={() =>
                      setExpandedQuestion(isExpanded ? null : question.id)
                    }
                    className="flex w-full items-start justify-between gap-2 text-left"
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      )}
                      <span className="text-sm">
                        <span className="font-medium">Q{index + 1}.</span>{" "}
                        {question.stem}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2 pl-6">
                      {question.options.map((option) => {
                        const isSelected = option.id === selectedId
                        const isAnswer = option.id === question.correctOptionId

                        return (
                          <div
                            key={option.id}
                            className={cn(
                              "rounded-md px-3 py-2 text-sm",
                              isAnswer &&
                                "bg-green-500/10 font-medium text-green-700 dark:text-green-300",
                              isSelected &&
                                !isAnswer &&
                                "bg-destructive/10 text-destructive line-through",
                              !isAnswer &&
                                !isSelected &&
                                "text-muted-foreground"
                            )}
                          >
                            {option.text}
                            {isAnswer && " (correct)"}
                            {isSelected && !isAnswer && " (your answer)"}
                          </div>
                        )
                      })}
                      <Separator className="my-2" />
                      <p className="text-sm text-muted-foreground">
                        {question.explanation}
                      </p>
                      {question.source && (
                        <p className="text-xs text-muted-foreground/70">
                          Source: {question.source}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
