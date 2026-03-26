"use client"

import { useLearnStore } from "@/stores/learn-store"
import { Card, CardContent } from "@/components/ui/card"
import { FeedbackBox } from "@/components/learn/FeedbackBox"
import { ConfidenceSelector } from "@/components/learn/ConfidenceSelector"
import { cn } from "@/lib/utils"

export function PhaseScenario() {
  const session = useLearnStore((s) => s.session)
  const scenarioConfidence = useLearnStore((s) => s.scenarioConfidence)
  const scenarioAnswer = useLearnStore((s) => s.scenarioAnswer)
  const scenarioCorrect = useLearnStore((s) => s.scenarioCorrect)
  const setConfidence = useLearnStore((s) => s.setConfidence)
  const answerScenario = useLearnStore((s) => s.answerScenario)

  if (!session) return null
  const {
    scenarioText,
    question,
    options,
    correctOptionId,
    feedbackCorrect,
    feedbackIncorrect,
    detailedExplanation,
  } = session.phases.scenario
  const answered = scenarioAnswer !== null
  const confidenceSelected = scenarioConfidence !== null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Clinical Scenario</h2>

      <Card>
        <CardContent className="pt-6">
          <div
            className="text-sm leading-relaxed italic"
            dangerouslySetInnerHTML={{ __html: scenarioText }}
          />
        </CardContent>
      </Card>

      <ConfidenceSelector
        selected={scenarioConfidence}
        onSelect={setConfidence}
      />

      <div
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question }}
      />

      <div
        className={cn(
          "space-y-3",
          !confidenceSelected && "pointer-events-none opacity-50"
        )}
      >
        {options.map((option) => {
          const isSelected = scenarioAnswer === option.id
          const isCorrect = option.id === correctOptionId

          return (
            <button
              key={option.id}
              type="button"
              disabled={answered || !confidenceSelected}
              onClick={() => answerScenario(option.id)}
              className={cn(
                "w-full rounded-lg border p-4 text-left text-sm leading-relaxed transition-colors",
                !answered &&
                  confidenceSelected &&
                  "hover:border-primary hover:bg-muted/50 cursor-pointer",
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

      {answered && scenarioCorrect !== null && (
        <FeedbackBox
          isCorrect={scenarioCorrect}
          feedback={scenarioCorrect ? feedbackCorrect : feedbackIncorrect}
        />
      )}

      {answered && (
        <Card>
          <CardContent className="pt-6">
            <div
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: detailedExplanation }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
