"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Clock, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SessionMeta } from "@/types/learn"

interface SessionCardProps {
  session: SessionMeta
  isCompleted?: boolean
  completedDate?: string | null
  isRecommended?: boolean
  isDueForReview?: boolean
}

export function SessionCard({
  session,
  isCompleted = false,
  completedDate = null,
  isRecommended = false,
  isDueForReview = false,
}: SessionCardProps) {
  if (!session.available) {
    return (
      <Card className="flex items-center gap-4 p-4 opacity-50">
        <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="flex-1">
          <p className="font-medium">{session.title}</p>
          <p className="text-sm text-muted-foreground">Coming soon</p>
        </div>
      </Card>
    )
  }

  return (
    <Link href={`/learn/session/${session.id}`}>
      <Card
        className={cn(
          "flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 cursor-pointer",
          isCompleted && "opacity-80"
        )}
      >
        <div className="shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-[color:var(--success,hsl(142_71%_45%))]" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium">{session.title}</p>
          <p className="text-sm text-muted-foreground">{session.topic}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            <span>~{session.estimatedMinutes} min</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {isCompleted && completedDate && (
            <Badge variant="secondary" className="text-xs">
              Completed {new Date(completedDate).toLocaleDateString()}
            </Badge>
          )}
          {isRecommended && (
            <Badge variant="default" className="text-xs">
              Recommended
            </Badge>
          )}
          {isDueForReview && (
            <Badge
              variant="outline"
              className="border-amber-500 text-amber-700 dark:text-amber-400 text-xs"
            >
              Due for Review
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  )
}
