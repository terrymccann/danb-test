"use client"

import { useLearnStore } from "@/stores/learn-store"
import { Badge } from "@/components/ui/badge"
import { FeedbackBox } from "@/components/learn/FeedbackBox"
import { cn } from "@/lib/utils"

export function PhaseInterleaved() {
  const session = useLearnStore((s) => s.session)
  const interleavedAnswer = useLearnStore((s) => s.interleavedAnswer)
  const interleavedCorrect = useLearnStore((s) => s.interleavedCorrect)
  const answerInterleaved = useLearnStore((s) => s.answerInterleaved)

  if (!session) return null
  const {
    domainLabel,
    question,
    options,
    correctOptionId,
    feedbackCorrect,
    feedbackIncorrect,
  } = session.phases.interleaved
  const answered = interleavedAnswer !== null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Interleaved Practice</h2>

      <Badge variant="outline">{domainLabel}</Badge>

      <div
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question }}
      />

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = interleavedAnswer === option.id
          const isCorrect = option.id === correctOptionId

          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              onClick={() => answerInterleaved(option.id)}
              className={cn(
                "w-full rounded-lg border p-4 text-left text-sm leading-relaxed transition-colors",
                !answered && "hover:border-primary hover:bg-muted/50 cursor-pointer",
                answered && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
                answered && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950/30",
                answered && !isSelected && !isCorrect && "opacity-50"
              )}
            >
              {option.text}
            </button>
          )
        })}
      </div>

      {answered && interleavedCorrect !== null && (
        <FeedbackBox
          isCorrect={interleavedCorrect}
          feedback={interleavedCorrect ? feedbackCorrect : feedbackIncorrect}
        />
      )}
    </div>
  )
}
