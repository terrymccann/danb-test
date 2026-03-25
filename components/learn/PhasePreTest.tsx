"use client"

import { useLearnStore } from "@/stores/learn-store"
import { PhaseBadge } from "@/components/learn/PhaseBadge"
import { FeedbackBox } from "@/components/learn/FeedbackBox"
import { cn } from "@/lib/utils"

export function PhasePreTest() {
  const session = useLearnStore((s) => s.session)
  const preTestAnswer = useLearnStore((s) => s.preTestAnswer)
  const preTestCorrect = useLearnStore((s) => s.preTestCorrect)
  const answerPreTest = useLearnStore((s) => s.answerPreTest)

  if (!session) return null
  const {
    question,
    options,
    correctOptionId,
    feedbackCorrect,
    feedbackIncorrect,
  } = session.phases.preTest
  const answered = preTestAnswer !== null

  return (
    <div className="space-y-4">
      <PhaseBadge phase="preTest" />
      <h2 className="text-lg font-medium">Pre-test</h2>

      <div
        className="rounded-md bg-muted p-4 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question }}
      />

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = preTestAnswer === option.id
          const isCorrect = option.id === correctOptionId
          let variant = ""
          if (answered) {
            if (isCorrect)
              variant = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
            else if (isSelected)
              variant = "border-red-500 bg-red-50 dark:bg-red-950"
            else variant = "opacity-50"
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              onClick={() => answerPreTest(option.id)}
              className={cn(
                "w-full rounded-md border p-3 text-left text-sm leading-relaxed transition-colors",
                !answered && "hover:border-primary hover:bg-muted/50",
                answered ? variant : ""
              )}
            >
              {option.text}
            </button>
          )
        })}
      </div>

      <FeedbackBox variant="incorrect" show={answered && !preTestCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackIncorrect }} />
      </FeedbackBox>
      <FeedbackBox variant="correct" show={answered && !!preTestCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackCorrect }} />
      </FeedbackBox>
    </div>
  )
}
