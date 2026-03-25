"use client"

import { useLearnStore } from "@/stores/learn-store"
import { PhaseBadge } from "@/components/learn/PhaseBadge"
import { ScienceTag } from "@/components/learn/ScienceTag"

export function PhaseContent() {
  const session = useLearnStore((s) => s.session)
  if (!session) return null

  const { conceptTitle, conceptBody, diagram, scienceTags } =
    session.phases.content

  return (
    <div className="space-y-4">
      <PhaseBadge phase="content" />
      <h2 className="text-lg font-medium">
        Chunked content delivery: {conceptTitle}
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The content is broken into{" "}
        <strong className="text-foreground">
          exactly one concept per screen
        </strong>
        , respecting working memory limits of 4±1 items. Visuals and text
        together (dual coding) strengthen encoding through two separate memory
        channels.
      </p>
      <div className="flex gap-2">
        {scienceTags.map((tag) => (
          <ScienceTag key={tag} label={tag} />
        ))}
      </div>

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
