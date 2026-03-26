"use client"

import { useLearnStore } from "@/stores/learn-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
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

  if (!session) return null
  const { prompt } = session.phases.teachBack
  const hasResponse = teachBackResponse.trim().length > 0
  const hasEvaluation = teachBackEvaluation !== null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Teach-Back</h2>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed">{prompt}</p>
        </CardContent>
      </Card>

      <textarea
        value={teachBackResponse}
        onChange={(e) => setTeachBackResponse(e.target.value)}
        placeholder="Type your explanation here..."
        disabled={hasEvaluation || teachBackLoading}
        className="min-h-[120px] w-full border rounded-lg p-3 bg-background text-sm leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50 resize-y"
      />

      {!hasEvaluation && !teachBackLoading && !teachBackFailed && (
        <Button
          onClick={submitTeachBack}
          disabled={!hasResponse || teachBackLoading}
        >
          {teachBackLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Submit for Review
        </Button>
      )}

      {teachBackLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Evaluating your response...
        </div>
      )}

      {teachBackFailed && !hasEvaluation && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 flex items-center justify-between">
          <p className="text-sm text-red-700 dark:text-red-400">
            AI evaluation unavailable. Please try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={submitTeachBack}
          >
            Try Again
          </Button>
        </div>
      )}

      {hasEvaluation && teachBackEvaluation && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                className={cn(
                  teachBackEvaluation.accuracy === "good" &&
                    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                  teachBackEvaluation.accuracy === "partial" &&
                    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                  teachBackEvaluation.accuracy === "missed" &&
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                )}
              >
                {teachBackEvaluation.accuracy === "good" && "Good"}
                {teachBackEvaluation.accuracy === "partial" && "Partial"}
                {teachBackEvaluation.accuracy === "missed" && "Missed"}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Completeness</span>
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
              <div className="flex flex-wrap gap-2">
                {teachBackEvaluation.missedConcepts.map((concept) => (
                  <Badge
                    key={concept}
                    variant="destructive"
                    className="text-xs"
                  >
                    {concept}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
