"use client"

import { useLearnStore } from "@/stores/learn-store"
import { PhaseBadge } from "@/components/learn/PhaseBadge"
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
    <div className="space-y-4">
      <PhaseBadge phase="scenario" />
      <h2 className="text-lg font-medium">Clinical scenario</h2>

      <div className="rounded-md bg-muted p-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Clinical Scenario
        </p>
        <div
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: scenarioText }}
        />
      </div>

      <ConfidenceSelector
        selected={scenarioConfidence}
        onSelect={setConfidence}
      />

      <div
        className="rounded-md bg-muted p-4 text-sm"
        dangerouslySetInnerHTML={{ __html: question }}
      />

      <div
        className={cn(
          "space-y-2",
          !confidenceSelected && "pointer-events-none opacity-50"
        )}
      >
        {options.map((option) => {
          const isSelected = scenarioAnswer === option.id
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
              disabled={answered || !confidenceSelected}
              onClick={() => answerScenario(option.id)}
              className={cn(
                "w-full rounded-md border p-3 text-left text-sm leading-relaxed transition-colors",
                !answered &&
                  confidenceSelected &&
                  "hover:border-primary hover:bg-muted/50",
                answered ? variant : ""
              )}
            >
              {option.text}
            </button>
          )
        })}
      </div>

      <FeedbackBox variant="correct" show={answered && !!scenarioCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackCorrect }} />
      </FeedbackBox>
      <FeedbackBox variant="incorrect" show={answered && !scenarioCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackIncorrect }} />
      </FeedbackBox>
      <FeedbackBox variant="detail" show={answered}>
        <span dangerouslySetInnerHTML={{ __html: detailedExplanation }} />
      </FeedbackBox>
    </div>
  )
}
