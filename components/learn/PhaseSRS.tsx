"use client"

import { useLearnStore } from "@/stores/learn-store"
import { PhaseBadge } from "@/components/learn/PhaseBadge"
import { cn } from "@/lib/utils"

const INTERVAL_STYLES: Record<string, string> = {
  Tomorrow: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "3 days": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "8 days":
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
}

export function PhaseSRS() {
  const session = useLearnStore((s) => s.session)
  if (!session) return null

  const { items, sessionSummary } = session.phases.srsSchedule

  return (
    <div className="space-y-4">
      <PhaseBadge phase="srsSchedule" />
      <h2 className="text-lg font-medium">Review schedule</h2>
      <p className="text-sm text-muted-foreground">
        These concepts are scheduled for review to strengthen retention.
      </p>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.concept}
            className="flex items-center gap-3 rounded-md bg-muted p-3 text-sm"
          >
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                INTERVAL_STYLES[item.interval] ?? "bg-muted-foreground/10"
              )}
            >
              {item.interval}
            </span>
            <span className="leading-relaxed">{item.concept}</span>
          </div>
        ))}
      </div>

      <div className="rounded-md bg-muted p-4">
        <p className="mb-2 text-sm font-medium">Session complete</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {sessionSummary}
        </p>
      </div>
    </div>
  )
}
