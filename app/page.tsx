import { ExamCard } from "@/components/exam/ExamCard";
import { examConfigs } from "@/lib/exam-config";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          DANB CDA Practice Exams
        </h1>
        <p className="mt-3 text-muted-foreground">
          Prepare for the Certified Dental Assistant exam with timed,
          randomized practice tests across all three CDA components.
        </p>
      </div>

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
    </main>
  );
}
