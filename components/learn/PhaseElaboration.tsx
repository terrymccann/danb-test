"use client"

import { useLearnStore } from "@/stores/learn-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PhaseElaboration() {
  const session = useLearnStore((s) => s.session)
  const elaborationRevealed = useLearnStore((s) => s.elaborationRevealed)
  const revealElaboration = useLearnStore((s) => s.revealElaboration)

  if (!session) return null
  const { prompt, expertReasoning } = session.phases.elaboration

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Elaboration</h2>

      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed">{prompt}</p>
        </CardContent>
      </Card>

      {!elaborationRevealed ? (
        <Button variant="outline" onClick={revealElaboration}>
          Reveal Expert Reasoning
        </Button>
      ) : (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: expertReasoning }}
          />
        </div>
      )}
    </div>
  )
}
