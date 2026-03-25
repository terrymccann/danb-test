"use client"

import { ExamCard } from "@/components/exam/ExamCard"
import { DomainCard } from "@/components/learn/DomainCard"
import { examConfigs } from "@/lib/exam-config"
import { domainConfigs } from "@/data/learn/index"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          DANB CDA Practice Exams
        </h1>
        <p className="mt-3 text-muted-foreground">
          Prepare for the Certified Dental Assistant exam with timed, randomized
          practice tests and evidence-based learning sessions.
        </p>
      </div>

      <Tabs defaultValue="exams">
        <div className="mb-6 flex justify-center">
          <TabsList>
            <TabsTrigger value="exams">Practice Exams</TabsTrigger>
            <TabsTrigger value="learn">Learn</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="exams">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(examConfigs).map((config) => (
              <ExamCard key={config.type} config={config} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Each practice exam simulates real DANB CDA testing conditions with
            randomized questions and a countdown timer. A score of 75% or higher
            is considered passing.
          </p>
        </TabsContent>

        <TabsContent value="learn">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {domainConfigs.map((config) => (
              <DomainCard key={config.domain} config={config} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Each learning session uses evidence-based techniques — retrieval
            practice, spaced repetition, interleaving, and elaborative
            interrogation — to build deep understanding of a single topic.
          </p>
        </TabsContent>
      </Tabs>
    </main>
  )
}
