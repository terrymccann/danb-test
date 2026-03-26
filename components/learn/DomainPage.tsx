"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SessionCard } from "@/components/learn/SessionCard"
import type { DomainLearnConfig } from "@/types/learn"

interface DomainPageProps {
  config: DomainLearnConfig
}

export function DomainPage({ config }: DomainPageProps) {
  const totalSessions = config.subDomains.reduce(
    (sum, sub) => sum + sub.sessions.length,
    0
  )

  // TODO: integrate useProgressStore + getRecommendations when available
  const completedCount = 0
  const progressPercent =
    totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/learn"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Learn
      </Link>

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <Badge variant="outline" className="text-sm font-semibold">
            {config.code}
          </Badge>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          {config.examDetails}
        </p>
        <div className="flex items-center gap-3">
          <Progress value={progressPercent} className="flex-1" />
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalSessions}
          </span>
        </div>
      </div>

      <div className="space-y-10">
        {config.subDomains.map((sub) => (
          <section key={sub.name}>
            <div className="mb-4 flex items-baseline gap-2">
              <h2 className="text-lg font-semibold">{sub.name}</h2>
              <span className="text-sm text-muted-foreground">
                — {sub.examWeight}
              </span>
            </div>
            <div className="space-y-2">
              {sub.sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
