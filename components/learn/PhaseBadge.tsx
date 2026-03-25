import { cn } from "@/lib/utils"
import type { PhaseKey } from "@/types/learn"

const PHASE_STYLES: Record<
  PhaseKey,
  { bg: string; text: string; label: string }
> = {
  preTest: {
    bg: "bg-violet-100 dark:bg-violet-950",
    text: "text-violet-700 dark:text-violet-300",
    label: "Phase 1",
  },
  content: {
    bg: "bg-emerald-100 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "Phase 2",
  },
  elaboration: {
    bg: "bg-amber-100 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    label: "Phase 3",
  },
  scenario: {
    bg: "bg-blue-100 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    label: "Phase 4",
  },
  interleaved: {
    bg: "bg-orange-100 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
    label: "Phase 5",
  },
  teachBack: {
    bg: "bg-violet-100 dark:bg-violet-950",
    text: "text-violet-700 dark:text-violet-300",
    label: "Phase 6",
  },
  srsSchedule: {
    bg: "bg-emerald-100 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "Phase 7",
  },
}

interface PhaseBadgeProps {
  phase: PhaseKey
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  const style = PHASE_STYLES[phase]
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2.5 py-0.5 text-xs font-medium",
        style.bg,
        style.text
      )}
    >
      {style.label}
    </span>
  )
}
