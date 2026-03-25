"use client"

import { useLearnStore } from "@/stores/learn-store"
import { PhaseBadge } from "@/components/learn/PhaseBadge"
import { ScienceTag } from "@/components/learn/ScienceTag"
import { Button } from "@/components/ui/button"

export function PhaseElaboration() {
  const session = useLearnStore((s) => s.session)
  const elaborationRevealed = useLearnStore((s) => s.elaborationRevealed)
  const revealElaboration = useLearnStore((s) => s.revealElaboration)

  if (!session) return null
  const { prompt, expertReasoning } = session.phases.elaboration

  return (
    <div className="space-y-4">
      <PhaseBadge phase="elaboration" />
      <h2 className="text-lg font-medium">
        Elaborative interrogation: why, not just what
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Instead of moving on, the platform forces you to think about{" "}
        <strong className="text-foreground">why</strong> the classification
        works this way. This technique produces effect sizes of d = 0.54–0.69 —
        comparable to hiring a private tutor.
      </p>
      <div className="flex gap-2">
        <ScienceTag label="Elaborative interrogation" />
        <ScienceTag label="Self-explanation" />
      </div>

      <div className="rounded-md border-l-3 border-amber-500 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-950 dark:text-amber-100">
        <strong>Think about this before revealing the answer:</strong>
        <br />
        <br />
        {prompt}
      </div>

      {!elaborationRevealed ? (
        <Button onClick={revealElaboration}>Reveal expert reasoning</Button>
      ) : (
        <div
          className="rounded-md bg-muted p-4 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: expertReasoning }}
        />
      )}
    </div>
  )
}
