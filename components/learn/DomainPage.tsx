"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SessionCard } from "@/components/learn/SessionCard"
import type { DomainLearnConfig } from "@/types/learn"

interface DomainPageProps {
  config: DomainLearnConfig
}

export function DomainPage({ config }: DomainPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Badge variant="outline" className="text-sm font-semibold">
            {config.code}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {config.examDetails}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
      </div>

      <div className="space-y-10">
        {config.subDomains.map((sub) => (
          <section key={sub.name}>
            <div className="mb-4 flex items-baseline gap-2">
              <h2 className="text-lg font-semibold">{sub.name}</h2>
              <span className="text-sm text-muted-foreground">
                — {sub.examWeight}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sub.sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
