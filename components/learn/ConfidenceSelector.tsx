"use client"

import { cn } from "@/lib/utils"
import type { ConfidenceLevel } from "@/types/learn"

const LEVELS: { value: ConfidenceLevel; label: string }[] = [
  { value: "guessing", label: "Guessing" },
  { value: "somewhat", label: "Somewhat sure" },
  { value: "confident", label: "Confident" },
  { value: "very-confident", label: "Very confident" },
]

interface ConfidenceSelectorProps {
  selected: ConfidenceLevel | null
  onSelect: (level: ConfidenceLevel) => void
}

export function ConfidenceSelector({
  selected,
  onSelect,
}: ConfidenceSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        How confident do you feel about this topic?
      </p>
      <div className="flex gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onSelect(level.value)}
            className={cn(
              "flex-1 rounded-md border px-2 py-2 text-center text-xs transition-colors",
              selected === level.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  )
}
