"use client"

import { examConfigs } from "@/lib/exam-config"
import { ExamSelectionCard } from "@/components/practice/ExamSelectionCard"
import { PastAttempts } from "@/components/practice/PastAttempts"

export default function PracticePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Practice Exams</h1>
        <p className="text-muted-foreground mt-1">
          Simulate real DANB CDA testing conditions with timed, randomized
          practice tests.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(examConfigs).map((config) => (
          <ExamSelectionCard key={config.type} config={config} />
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-4">Recent Attempts</h2>
      <PastAttempts />
    </main>
  )
}
