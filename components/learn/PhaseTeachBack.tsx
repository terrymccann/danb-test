"use client"

import { useLearnStore } from "@/stores/learn-store"
import { PhaseBadge } from "@/components/learn/PhaseBadge"
import { ScienceTag } from "@/components/learn/ScienceTag"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function PhaseTeachBack() {
  const session = useLearnStore((s) => s.session)
  const teachBackResponse = useLearnStore((s) => s.teachBackResponse)
  const teachBackEvaluation = useLearnStore((s) => s.teachBackEvaluation)
  const teachBackLoading = useLearnStore((s) => s.teachBackLoading)
  const teachBackSubmitted = useLearnStore((s) => s.teachBackSubmitted)
  const teachBackFailed = useLearnStore((s) => s.teachBackFailed)
  const setTeachBackResponse = useLearnStore((s) => s.setTeachBackResponse)
  const submitTeachBack = useLearnStore((s) => s.submitTeachBack)
  const nextPhase = useLearnStore((s) => s.nextPhase)

  if (!session) return null
  const { prompt, modelAnswer } = session.phases.teachBack
  const hasResponse = teachBackResponse.trim().length > 0
  const hasEvaluation = teachBackEvaluation !== null
  const showModelAnswer =
    hasEvaluation || (teachBackSubmitted && !teachBackLoading)

  return (
    <div className="space-y-4">
      <PhaseBadge phase="teachBack" />
      <h2 className="text-lg font-medium">Teach-back: the Feynman technique</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Explaining concepts to others produces an effect size of g = 0.55 — you
        learn more by teaching than by restudying.
      </p>
      <div className="flex gap-2">
        <ScienceTag label="Generation effect" />
        <ScienceTag label="Feynman technique" />
      </div>

      <div className="rounded-md border-l-3 border-violet-500 bg-violet-50 p-4 text-sm leading-relaxed text-violet-900 dark:bg-violet-950 dark:text-violet-100">
        <strong>Teach-back prompt:</strong>
        <br />
        <br />
        {prompt}
      </div>

      <textarea
        value={teachBackResponse}
        onChange={(e) => setTeachBackResponse(e.target.value)}
        placeholder="Type your explanation here..."
        disabled={hasEvaluation || teachBackFailed}
        className="min-h-[120px] w-full resize-y rounded-md border bg-background p-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50"
      />

      {!hasEvaluation && !teachBackLoading && !teachBackFailed && (
        <div className="flex items-center gap-3">
          <Button onClick={submitTeachBack} disabled={!hasResponse}>
            Submit for AI evaluation
          </Button>
          {hasResponse && (
            <button
              type="button"
              onClick={nextPhase}
              className="text-sm text-muted-foreground underline hover:text-foreground"
            >
              Skip evaluation
            </button>
          )}
        </div>
      )}

      {teachBackLoading && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Evaluating your response...
          </div>
          <button
            type="button"
            onClick={nextPhase}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Skip evaluation
          </button>
        </div>
      )}

      {teachBackFailed && !hasEvaluation && (
        <div className="flex items-center gap-2 rounded-md border-l-3 border-amber-500 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          AI evaluation unavailable. Compare your response to the model answer
          below.
        </div>
      )}

      {hasEvaluation && teachBackEvaluation && (
        <div className="space-y-3 rounded-md border p-4">
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                teachBackEvaluation.accuracy === "good" &&
                  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
                teachBackEvaluation.accuracy === "partial" &&
                  "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                teachBackEvaluation.accuracy === "missed" &&
                  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              )}
            >
              {teachBackEvaluation.accuracy === "good" && "Good"}
              {teachBackEvaluation.accuracy === "partial" && "Partial"}
              {teachBackEvaluation.accuracy === "missed" && "Needs work"}
            </Badge>
            <Progress
              value={teachBackEvaluation.completeness}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">
              {teachBackEvaluation.completeness}%
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            {teachBackEvaluation.feedback}
          </p>
          {teachBackEvaluation.missedConcepts.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Missed concepts:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {teachBackEvaluation.missedConcepts.map((concept) => (
                  <li key={concept}>{concept}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {showModelAnswer && (
        <div className="rounded-md bg-muted p-4 text-sm leading-relaxed">
          <strong>Model answer:</strong>
          <br />
          <br />
          {modelAnswer}
        </div>
      )}
    </div>
  )
}
