"use client"

import { useLearnStore } from "@/stores/learn-store"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Pre-Test</h2>

      <Card>
        <CardContent className="pt-6">
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question }}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = preTestAnswer === option.id
          const isCorrect = option.id === correctOptionId

          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              onClick={() => answerPreTest(option.id)}
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

      {answered && preTestCorrect !== null && (
        <FeedbackBox
          isCorrect={preTestCorrect}
          feedback={preTestCorrect ? feedbackCorrect : feedbackIncorrect}
        />
      )}
    </div>
  )
}
