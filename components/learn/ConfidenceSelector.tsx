"use client"

import { cn } from "@/lib/utils"
import type { ConfidenceLevel } from "@/types/learn"

const LEVELS: { value: ConfidenceLevel; label: string }[] = [
  { value: "guessing", label: "Guessing" },
  { value: "somewhat", label: "Somewhat" },
  { value: "confident", label: "Confident" },
  { value: "very-confident", label: "Very Confident" },
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
              "flex-1 py-2 text-sm rounded-lg border transition-colors",
              selected === level.value
                ? "bg-primary text-primary-foreground"
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
