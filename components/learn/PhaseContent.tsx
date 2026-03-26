"use client"

import { useLearnStore } from "@/stores/learn-store"
import { ScienceTag } from "@/components/learn/ScienceTag"

export function PhaseContent() {
  const session = useLearnStore((s) => s.session)
  if (!session) return null

  const { conceptTitle, conceptBody, diagram, scienceTags } =
    session.phases.content

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{conceptTitle}</h2>

      {scienceTags && scienceTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {scienceTags.map((tag) => (
            <ScienceTag key={tag} label={tag} />
          ))}
        </div>
      )}

      {diagram && (
        <div
          className="my-4 rounded-lg border p-4"
          dangerouslySetInnerHTML={{ __html: diagram }}
        />
      )}

      <div
        className="leading-relaxed text-sm"
        dangerouslySetInnerHTML={{ __html: conceptBody }}
      />
    </div>
  )
}
