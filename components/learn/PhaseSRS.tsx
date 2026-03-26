"use client"

import { useLearnStore } from "@/stores/learn-store"
import { useProgressStore } from "@/stores/progress-store"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

export function PhaseSRS() {
  const session = useLearnStore((s) => s.session)
  const preTestCorrect = useLearnStore((s) => s.preTestCorrect)
  const reset = useLearnStore((s) => s.reset)
  const recordSessionCompletion = useProgressStore(
    (s) => s.recordSessionCompletion
  )
  const router = useRouter()

  if (!session) return null

  const { items, sessionSummary } = session.phases.srsSchedule

  function handleComplete() {
    if (!session) return
    const domain = session.domain
    recordSessionCompletion({
      sessionId: session.id,
      domain: session.domain,
      completedDate: new Date().toISOString(),
      preTestScore:
        preTestCorrect === true
          ? "correct"
          : preTestCorrect === false
            ? "incorrect"
            : null,
    })
    reset()
    router.push(`/learn/${domain}`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review Schedule</h2>

      <p className="text-sm text-muted-foreground">{sessionSummary}</p>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.concept}
            className="flex items-start gap-3 rounded-lg border p-3"
          >
            <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Review in {item.interval}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.concept}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button size="lg" className="w-full" onClick={handleComplete}>
        Complete Session
      </Button>
    </div>
  )
}
