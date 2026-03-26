"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ExamType } from "@/types/exam"
import type { DomainStats } from "@/types/progress"

interface DomainProgressCardProps {
  domain: ExamType
  stats: DomainStats
  config: { title: string; code: string }
}

function CircularProgress({ percentage }: { percentage: number }) {
  const size = 80
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} className="mx-auto">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-primary transition-all duration-500"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-sm font-semibold"
      >
        {percentage}%
      </text>
    </svg>
  )
}

export function DomainProgressCard({
  domain,
  stats,
  config,
}: DomainProgressCardProps) {
  return (
    <Card
      className="overflow-hidden"
      style={{ borderTop: `3px solid var(--domain-${domain})` }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{config.title}</CardTitle>
          <Badge variant="secondary">{config.code}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CircularProgress percentage={stats.completionPercentage} />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Best Score</div>
            <div className="font-medium">
              {stats.bestExamScore !== null ? `${stats.bestExamScore}%` : "—"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Exam Attempts</div>
            <div className="font-medium">{stats.examAttempts}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Sessions</div>
            <div className="font-medium">
              {stats.sessionsCompleted}/{stats.sessionsTotal} completed
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Completion</div>
            <div className="font-medium">{stats.completionPercentage}%</div>
          </div>
        </div>

        <Link
          href={`/learn/${domain}`}
          className="text-primary text-sm hover:underline"
        >
          View Sessions
        </Link>
      </CardContent>
    </Card>
  )
}
