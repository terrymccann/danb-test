"use client"

import { domainConfigs } from "@/data/learn/index"
import { DomainCard } from "@/components/learn/DomainCard"

export default function LearnPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Learn</h1>
        <p className="mt-2 text-muted-foreground">
          Master each domain with evidence-based study techniques — retrieval
          practice, spaced repetition, and elaborative interrogation.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {domainConfigs.map((config) => (
          <DomainCard key={config.domain} config={config} />
        ))}
      </div>
    </div>
  )
}
