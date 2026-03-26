"use client"

import { useEffect, useState } from "react"
import { useExamStore } from "@/stores/exam-store"
import { cn } from "@/lib/utils"

export function Timer() {
  const getRemainingSeconds = useExamStore((s) => s.getRemainingSeconds)
  const submitExam = useExamStore((s) => s.submitExam)
  const isComplete = useExamStore((s) => s.isComplete)
  const [remaining, setRemaining] = useState(() => getRemainingSeconds())

  useEffect(() => {
    if (isComplete) return

    const interval = setInterval(() => {
      const secs = getRemainingSeconds()
      setRemaining(secs)
      if (secs <= 0) {
        submitExam()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [getRemainingSeconds, submitExam, isComplete])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const display = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  const isWarning = remaining <= 300 && remaining > 60
  const isCritical = remaining <= 60

  return (
    <span
      className={cn(
        "font-mono text-sm font-semibold",
        isCritical && "animate-pulse text-[color:var(--error)]",
        isWarning && "text-[color:var(--error)]",
        !isWarning && !isCritical && "text-foreground"
      )}
    >
      {display}
    </span>
  )
}
