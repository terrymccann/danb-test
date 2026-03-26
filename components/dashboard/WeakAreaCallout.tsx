"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { useProgressStore } from "@/stores/progress-store"
import { getRecommendations } from "@/lib/recommendations"
import { domainConfigs, findSessionMeta } from "@/data/learn/index"
import type { SessionMeta } from "@/types/learn"

function getAllSessions(): SessionMeta[] {
  return domainConfigs.flatMap((c) =>
    c.subDomains.flatMap((sd) => sd.sessions)
  )
}

export function WeakAreaCallout() {
  const { examAttempts, sessionCompletions } = useProgressStore()

  const allSessions = getAllSessions()
  const recommendations = getRecommendations(
    examAttempts,
    sessionCompletions,
    allSessions
  )
  const highPriority = recommendations.filter((r) => r.priority === "high")

  if (highPriority.length === 0) return null

  const topRecommendations = highPriority.slice(0, 3)

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div className="space-y-2">
          <h3 className="font-medium">Recommended Focus Area</h3>
          <p className="text-sm text-muted-foreground">
            {highPriority[0].reason}
          </p>
          <ul className="space-y-1">
            {topRecommendations.map((rec) => {
              const meta = findSessionMeta(rec.sessionId)
              const title = meta?.session.title ?? rec.sessionId
              return (
                <li key={rec.sessionId}>
                  <Link
                    href={`/learn/session/${rec.sessionId}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
