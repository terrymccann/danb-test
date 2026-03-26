"use client"

import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader"
import { OverallProgress } from "@/components/dashboard/OverallProgress"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { DomainProgressCard } from "@/components/dashboard/DomainProgressCard"
import { WeakAreaCallout } from "@/components/dashboard/WeakAreaCallout"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { useProgressStore } from "@/stores/progress-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { domainConfigs } from "@/data/learn/index"
import type { ExamType } from "@/types/exam"

function getTotalSessions(domain: ExamType): number {
  const config = domainConfigs.find((c) => c.domain === domain)
  if (!config) return 0
  return config.subDomains.reduce((sum, sd) => sum + sd.sessions.length, 0)
}

export default function HomePage() {
  const hydrated = useHydrated()
  const { getDomainStats } = useProgressStore()

  const domains: { domain: ExamType; title: string; code: string }[] = [
    { domain: "gc", title: "General Chairside", code: "GC" },
    { domain: "rhs", title: "Radiation Health & Safety", code: "RHS" },
    { domain: "ice", title: "Infection Control", code: "ICE" },
  ]

  if (!hydrated) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <WelcomeHeader />
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <WelcomeHeader />
      <OverallProgress />
      <QuickActions />

      <div className="grid gap-6 sm:grid-cols-3">
        {domains.map((d) => (
          <DomainProgressCard
            key={d.domain}
            domain={d.domain}
            stats={getDomainStats(d.domain, getTotalSessions(d.domain))}
            config={{ title: d.title, code: d.code }}
          />
        ))}
      </div>

      <WeakAreaCallout />
      <RecentActivity />
    </main>
  )
}
