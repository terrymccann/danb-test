"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useProgressStore } from "@/stores/progress-store"
import type { DomainLearnConfig } from "@/types/learn"

const DOMAIN_COLORS: Record<string, string> = {
  gc: "var(--domain-gc)",
  rhs: "var(--domain-rhs)",
  ice: "var(--domain-ice)",
}

interface DomainCardProps {
  config: DomainLearnConfig
}

export function DomainCard({ config }: DomainCardProps) {
  const totalSessions = config.subDomains.reduce(
    (sum, sub) => sum + sub.sessions.length,
    0
  )

  const sessionCompletions = useProgressStore((s) => s.sessionCompletions)
  const allSessionIds = config.subDomains.flatMap((sub) =>
    sub.sessions.map((s) => s.id)
  )
  const completedCount = allSessionIds.filter(
    (id) => id in sessionCompletions
  ).length
  const progressPercent =
    totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0

  const buttonLabel =
    completedCount === 0
      ? "Start"
      : completedCount >= totalSessions
        ? "Review"
        : "Continue"

  return (
    <Card
      className="flex flex-col"
      style={{ borderTop: `3px solid ${DOMAIN_COLORS[config.domain] ?? "hsl(var(--primary))"}` }}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{config.code}</Badge>
          <CardTitle className="text-xl">{config.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <Progress value={progressPercent} />
          <p className="text-sm text-muted-foreground">
            {completedCount}/{totalSessions} sessions completed
          </p>
        </div>
        <Link
          href={`/learn/${config.domain}`}
          className={buttonVariants({ className: "w-full" })}
        >
          {buttonLabel}
        </Link>
      </CardContent>
    </Card>
  )
}
