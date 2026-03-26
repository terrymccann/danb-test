"use client"

import { Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExamStore } from "@/stores/exam-store"
import { cn } from "@/lib/utils"

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"]

export function QuestionDisplay() {
  const questions = useExamStore((s) => s.questions)
  const currentIndex = useExamStore((s) => s.currentIndex)
  const answers = useExamStore((s) => s.answers)
  const flagged = useExamStore((s) => s.flagged)
  const selectAnswer = useExamStore((s) => s.selectAnswer)
  const toggleFlag = useExamStore((s) => s.toggleFlag)

  const question = questions[currentIndex]
  if (!question) return null

  const selectedOption = answers[question.id] ?? ""
  const isFlagged = flagged.has(question.id)

  return (
    <div className="space-y-6">
      <p className="text-lg font-medium leading-relaxed mb-6">
        {question.stem}
      </p>

      <div className="space-y-3">
        {question.options.map((option, i) => {
          const isSelected = selectedOption === option.id

          return (
            <button
              key={option.id}
              onClick={() => selectAnswer(question.id, option.id)}
              className={cn(
                "w-full border rounded-lg p-4 cursor-pointer transition-colors flex items-center gap-3 text-left",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <span className="w-7 h-7 rounded-full bg-muted text-xs font-semibold flex items-center justify-center shrink-0">
                {OPTION_LETTERS[i]}
              </span>
              <span className="text-sm leading-relaxed">{option.text}</span>
            </button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => toggleFlag(question.id)}
        className={cn(
          "gap-2",
          isFlagged &&
            "bg-[color:var(--warning)]/10 border-[color:var(--warning)] text-[color:var(--warning)]"
        )}
      >
        <Flag className={cn("h-4 w-4", isFlagged && "fill-current")} />
        {isFlagged ? "Flagged for Review" : "Flag for Review"}
      </Button>
    </div>
  )
}
