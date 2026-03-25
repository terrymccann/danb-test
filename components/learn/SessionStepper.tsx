"use client"

import { useLearnStore, PHASE_ORDER } from "@/stores/learn-store"
import { Button, buttonVariants } from "@/components/ui/button"
import { PhasePreTest } from "@/components/learn/PhasePreTest"
import { PhaseContent } from "@/components/learn/PhaseContent"
import { PhaseElaboration } from "@/components/learn/PhaseElaboration"
import { PhaseScenario } from "@/components/learn/PhaseScenario"
import { PhaseInterleaved } from "@/components/learn/PhaseInterleaved"
import { PhaseTeachBack } from "@/components/learn/PhaseTeachBack"
import { PhaseSRS } from "@/components/learn/PhaseSRS"
import type { PhaseKey } from "@/types/learn"
import Link from "next/link"

const PHASE_COMPONENTS: Record<PhaseKey, React.ComponentType> = {
  preTest: PhasePreTest,
  content: PhaseContent,
  elaboration: PhaseElaboration,
  scenario: PhaseScenario,
  interleaved: PhaseInterleaved,
  teachBack: PhaseTeachBack,
  srsSchedule: PhaseSRS,
}

const NEXT_LABELS: Record<PhaseKey, string> = {
  preTest: "Continue to teaching phase",
  content: "Continue to elaboration",
  elaboration: "Continue to scenario practice",
  scenario: "Continue to interleaved practice",
  interleaved: "Continue to teach-back",
  teachBack: "Continue to SRS scheduling",
  srsSchedule: "",
}

export function SessionStepper() {
  const session = useLearnStore((s) => s.session)
  const currentPhase = useLearnStore((s) => s.currentPhase)
  const phaseIndex = useLearnStore((s) => s.phaseIndex)
  const canAdvance = useLearnStore((s) => s.canAdvance)
  const nextPhase = useLearnStore((s) => s.nextPhase)
  const prevPhase = useLearnStore((s) => s.prevPhase)
  const reset = useLearnStore((s) => s.reset)

  if (!session) return null

  const PhaseComponent = PHASE_COMPONENTS[currentPhase]
  const progressPercent = Math.round(
    ((phaseIndex + 1) / PHASE_ORDER.length) * 100
  )
  const isLastPhase = currentPhase === "srsSchedule"
  const isFirstPhase = phaseIndex === 0

  return (
    <div className="flex min-h-screen flex-col">
      {/* Progress bar + step counter */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Step {phaseIndex + 1} of {PHASE_ORDER.length} — {session.title}
          </p>
        </div>
      </div>

      {/* Phase content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <PhaseComponent />
      </main>

      {/* Navigation */}
      <div className="border-t bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          {!isFirstPhase ? (
            <Button variant="outline" onClick={prevPhase}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {isLastPhase ? (
            <div className="flex gap-2">
              <Link
                href="/"
                className={buttonVariants({ variant: "outline" })}
                onClick={reset}
              >
                Back to Home
              </Link>
              <Button
                onClick={() => {
                  // reset() sets session to null, which triggers the page's
                  // useEffect to re-load and call startSession() on next render
                  reset()
                }}
              >
                Restart
              </Button>
            </div>
          ) : (
            <Button onClick={nextPhase} disabled={!canAdvance()}>
              {NEXT_LABELS[currentPhase]}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
