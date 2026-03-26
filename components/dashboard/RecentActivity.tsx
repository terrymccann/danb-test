"use client"

import { BookOpen, FileText } from "lucide-react"
import { useProgressStore } from "@/stores/progress-store"

function relativeDate(isoDate: string): string {
  const now = new Date()
  const date = new Date(isoDate)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 30) {
    const diffMonths = Math.floor(diffDays / 30)
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`
  }
  if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  if (diffHours > 0)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  if (diffMinutes > 0)
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`
  return "Just now"
}

export function RecentActivity() {
  const { getRecentActivity } = useProgressStore()
  const items = getRecentActivity(5)

  if (items.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        <p className="text-sm text-muted-foreground">
          No activity yet. Start a practice exam or learning session!
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
      <div className="divide-y">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            {item.type === "exam" ? (
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm flex-1">{item.label}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {relativeDate(item.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
