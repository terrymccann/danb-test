"use client"

import { useLearnStore } from "@/stores/learn-store"
import { PhaseBadge } from "@/components/learn/PhaseBadge"
import { ScienceTag } from "@/components/learn/ScienceTag"
import { FeedbackBox } from "@/components/learn/FeedbackBox"
import { Badge } from "@/components/ui/badge"
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
    <div className="space-y-4">
      <PhaseBadge phase="interleaved" />
      <h2 className="text-lg font-medium">
        Interleaved practice: mixing topics forces discrimination
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        This platform deliberately{" "}
        <strong className="text-foreground">
          mixes topics from different CDA domains
        </strong>{" "}
        so you must first identify which area of knowledge applies. Research
        shows interleaving produces 3× better delayed retention despite feeling
        harder.
      </p>
      <div className="flex gap-2">
        <ScienceTag label="Interleaving" />
        <ScienceTag label="Desirable difficulties" />
      </div>

      <div className="rounded-md bg-muted p-4 text-sm leading-relaxed">
        <div className="mb-2">
          <Badge variant="outline">{domainLabel}</Badge>
        </div>
        {question}
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = interleavedAnswer === option.id
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
              onClick={() => answerInterleaved(option.id)}
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

      <FeedbackBox variant="correct" show={answered && !!interleavedCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackCorrect }} />
      </FeedbackBox>
      <FeedbackBox variant="incorrect" show={answered && !interleavedCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackIncorrect }} />
      </FeedbackBox>
    </div>
  )
}
