"use client"

import { useState } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  Target,
  Hash,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PASS_THRESHOLD } from "@/lib/exam-config"
import { ExamResult, Question } from "@/types/exam"
import { cn } from "@/lib/utils"

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

type FilterType = "all" | "incorrect" | "flagged"

export function ResultsSummary({
  result,
  questions,
  answers,
}: ResultsSummaryProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")

  const passed = result.passed
  const scorePercent = result.percentage
  const circumference = 2 * Math.PI * 45
  const strokeOffset = circumference - (scorePercent / 100) * circumference

  // Sort topics by score ascending (weakest first)
  const sortedTopics = [...result.topicScores].sort(
    (a, b) => a.percentage - b.percentage
  )

  // Filter questions
  const filteredQuestions = questions.filter((q, _i) => {
    const selectedId = answers[q.id] ?? null
    const isCorrect = selectedId === q.correctOptionId
    if (filter === "incorrect") return !isCorrect
    // For "flagged" filter, we don't have flag data in results, show all as fallback
    return true
  })

  return (
    <div className="space-y-8">
      {/* Score hero */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              style={{
                stroke: passed ? "var(--success)" : "var(--error)",
                transition: "stroke-dashoffset 0.5s ease-in-out",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold">
              {Math.round(scorePercent)}%
            </span>
          </div>
        </div>
        <Badge
          variant={passed ? "default" : "destructive"}
          className="mt-3 text-sm"
        >
          {passed ? "PASSED" : "NOT PASSED"}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="flex gap-6 justify-center text-center mt-6">
        <div className="flex flex-col items-center">
          <Clock className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="font-semibold">{formatTime(result.timeUsedSeconds)}</span>
          <span className="text-xs text-muted-foreground">Time used</span>
        </div>
        <div className="flex flex-col items-center">
          <Hash className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="font-semibold">
            {result.correctAnswers}/{result.totalQuestions}
          </span>
          <span className="text-xs text-muted-foreground">Correct</span>
        </div>
        <div className="flex flex-col items-center">
          <Target className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="font-semibold">
            {result.totalQuestions > 0
              ? Math.round(
                  (result.correctAnswers / result.totalQuestions) * 100
                )
              : 0}
            %
          </span>
          <span className="text-xs text-muted-foreground">Accuracy</span>
        </div>
      </div>

      {/* Topic breakdown */}
      <div className="mt-8 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Topic Breakdown
        </h3>
        {sortedTopics.map((topic) => (
          <div key={topic.topic} className="flex items-center gap-3">
            <span className="text-sm flex-shrink-0 w-40 truncate">
              {topic.topic}
            </span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${topic.percentage}%`,
                  backgroundColor:
                    topic.percentage >= PASS_THRESHOLD * 100
                      ? "var(--success)"
                      : "var(--error)",
                }}
              />
            </div>
            <span className="text-sm font-medium w-12 text-right">
              {Math.round(topic.percentage)}%
            </span>
          </div>
        ))}
      </div>

      {/* Question review section */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Question Review
        </h3>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-4">
          {(["all", "incorrect"] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : "Incorrect"}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredQuestions.map((question, _index) => {
            const questionIndex = questions.indexOf(question)
            const selectedId = answers[question.id] ?? null
            const isCorrect = selectedId === question.correctOptionId
            const isExpanded = expandedQuestion === question.id
            const selectedOption = question.options.find(
              (o) => o.id === selectedId
            )

            return (
              <div
                key={question.id}
                className="rounded-lg border overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedQuestion(isExpanded ? null : question.id)
                  }
                  className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Q{questionIndex + 1}
                    </span>
                    {selectedOption ? (
                      <span
                        className={cn(
                          "text-sm",
                          isCorrect
                            ? "text-green-600 dark:text-green-400"
                            : "text-destructive"
                        )}
                      >
                        {selectedOption.text.slice(0, 60)}
                        {selectedOption.text.length > 60 ? "..." : ""}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        No answer
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-3 py-3 space-y-3 bg-muted/20">
                    <p className="text-sm leading-relaxed">
                      {question.stem}
                    </p>
                    <div className="space-y-1.5">
                      {question.options.map((option) => {
                        const isSelected = option.id === selectedId
                        const isAnswer =
                          option.id === question.correctOptionId

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
                    </div>
                    {question.explanation && (
                      <p className="text-sm text-muted-foreground border-t pt-2">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
