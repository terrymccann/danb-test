"use client"

import { useExamStore } from "@/stores/exam-store"
import { cn } from "@/lib/utils"

export function QuestionGrid() {
  const questions = useExamStore((s) => s.questions)
  const currentIndex = useExamStore((s) => s.currentIndex)
  const answers = useExamStore((s) => s.answers)
  const flagged = useExamStore((s) => s.flagged)
  const goToQuestion = useExamStore((s) => s.goToQuestion)

  const answeredCount = Object.keys(answers).length
  const flaggedCount = flagged.size

  return (
    <div>
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, index) => {
          const isAnswered = q.id in answers
          const isFlagged = flagged.has(q.id)
          const isCurrent = index === currentIndex

          return (
            <button
              key={q.id}
              onClick={() => goToQuestion(index)}
              className={cn(
                "w-8 h-8 rounded text-xs font-medium flex items-center justify-center cursor-pointer transition-colors",
                isAnswered
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
                isFlagged && "ring-2 ring-[color:var(--warning)]",
                isCurrent && "ring-2 ring-foreground"
              )}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        {answeredCount}/{questions.length} answered
        {flaggedCount > 0 && <> &middot; {flaggedCount} flagged</>}
      </p>
    </div>
  )
}
