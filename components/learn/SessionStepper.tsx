"use client"

import { useLearnStore, PHASE_ORDER } from "@/stores/learn-store"
import { Button } from "@/components/ui/button"
import { PhasePreTest } from "@/components/learn/PhasePreTest"
import { PhaseContent } from "@/components/learn/PhaseContent"
import { PhaseElaboration } from "@/components/learn/PhaseElaboration"
import { PhaseScenario } from "@/components/learn/PhaseScenario"
import { PhaseInterleaved } from "@/components/learn/PhaseInterleaved"
import { PhaseTeachBack } from "@/components/learn/PhaseTeachBack"
import { PhaseSRS } from "@/components/learn/PhaseSRS"
import type { PhaseKey } from "@/types/learn"
import {
  ClipboardCheck,
  BookOpen,
  Lightbulb,
  MessageSquare,
  Shuffle,
  Mic,
  Calendar,
  Check,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const PHASE_COMPONENTS: Record<PhaseKey, React.ComponentType> = {
  preTest: PhasePreTest,
  content: PhaseContent,
  elaboration: PhaseElaboration,
  scenario: PhaseScenario,
  interleaved: PhaseInterleaved,
  teachBack: PhaseTeachBack,
  srsSchedule: PhaseSRS,
}

const PHASE_META: Record<PhaseKey, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  preTest: { icon: ClipboardCheck, label: "Pre-Test" },
  content: { icon: BookOpen, label: "Content" },
  elaboration: { icon: Lightbulb, label: "Elaboration" },
  scenario: { icon: MessageSquare, label: "Scenario" },
  interleaved: { icon: Shuffle, label: "Interleaved" },
  teachBack: { icon: Mic, label: "Teach-Back" },
  srsSchedule: { icon: Calendar, label: "SRS Schedule" },
}

function PhaseStepper() {
  const currentPhase = useLearnStore((s) => s.currentPhase)
  const phaseIndex = useLearnStore((s) => s.phaseIndex)
  const goToPhase = useLearnStore((s) => s.goToPhase)
  const nextPhase = useLearnStore((s) => s.nextPhase)
  const canAdvanceValue = useLearnStore((s) => {
    switch (s.currentPhase) {
      case "preTest":
        return s.preTestAnswer !== null
      case "content":
        return true
      case "elaboration":
        return s.elaborationRevealed
      case "scenario":
        return s.scenarioConfidence !== null && s.scenarioAnswer !== null
      case "interleaved":
        return s.interleavedAnswer !== null
      case "teachBack":
        return s.teachBackResponse.trim().length > 0
      case "srsSchedule":
        return false
    }
  })

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-1 p-4">
        {PHASE_ORDER.map((phase, idx) => {
          const meta = PHASE_META[phase]
          const Icon = meta.icon
          const isCurrent = phase === currentPhase
          const isCompleted = idx < phaseIndex
          const isFuture = idx > phaseIndex
          const canClick = isCompleted // can only jump back to completed phases

          return (
            <button
              key={phase}
              type="button"
              disabled={isFuture}
              onClick={() => canClick && goToPhase(phase)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                isCurrent && "text-primary font-semibold bg-primary/5",
                isCompleted && "text-[color:var(--success,hsl(142_71%_45%))] cursor-pointer hover:bg-muted/50",
                isFuture && "text-muted-foreground cursor-default"
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <Icon className="h-4 w-4 shrink-0" />
              )}
              <span>{meta.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Button
          onClick={nextPhase}
          disabled={!canAdvanceValue}
          className="w-full"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export function SessionStepper() {
  const session = useLearnStore((s) => s.session)
  const currentPhase = useLearnStore((s) => s.currentPhase)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!session) return null

  const PhaseComponent = PHASE_COMPONENTS[currentPhase]

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-background">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-medium truncate">{session.title}</p>
        </div>
        <PhaseStepper />
      </aside>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8">
        {/* Mobile phase stepper trigger */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="gap-2"
          >
            <Menu className="h-4 w-4" />
            Phases
          </Button>

          {mobileOpen && (
            <div className="mt-2 rounded-lg border bg-background shadow-lg">
              <PhaseStepper />
            </div>
          )}
        </div>

        {/* Current phase content */}
        <PhaseComponent />
      </main>
    </div>
  )
}
