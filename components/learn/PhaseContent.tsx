"use client"

import { useLearnStore } from "@/stores/learn-store"
import { PhaseBadge } from "@/components/learn/PhaseBadge"

export function PhaseContent() {
  const session = useLearnStore((s) => s.session)
  if (!session) return null

  const { conceptTitle, conceptBody, diagram, scienceTags } =
    session.phases.content

  return (
    <div className="space-y-4">
      <PhaseBadge phase="content" />
      <h2 className="text-lg font-medium">{conceptTitle}</h2>

      {diagram && (
        <div className="my-4" dangerouslySetInnerHTML={{ __html: diagram }} />
      )}

      <div
        className="rounded-md bg-muted p-4 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: conceptBody }}
      />
    </div>
  )
}
