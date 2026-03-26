"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Clock, Target, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExamStore } from "@/stores/exam-store"
import { useProgressStore } from "@/stores/progress-store"
import type { ExamType, ExamConfig } from "@/types/exam"

const domainColorVar: Record<ExamType, string> = {
  gc: "var(--domain-gc)",
  rhs: "var(--domain-rhs)",
  ice: "var(--domain-ice)",
}

const badgeClass: Record<ExamType, string> = {
  gc: "bg-[var(--domain-gc)] text-white",
  rhs: "bg-[var(--domain-rhs)] text-white",
  ice: "bg-[var(--domain-ice)] text-white",
}

const instructions: Record<ExamType, string> = {
  gc: "This practice exam simulates the General Chairside (GC) component of the DANB CDA exam. You will answer 95 multiple-choice questions in 75 minutes covering chairside assisting procedures, patient care, dental materials, and office operations. A score of 75% or higher is considered passing. Questions are randomized from our question pool.",
  rhs: "This practice exam simulates the Radiation Health & Safety (RHS) component of the DANB CDA exam. You will answer 75 multiple-choice questions in 60 minutes covering radiation physics, biological effects, equipment operation, infection control in radiography, and technique errors. A score of 75% or higher is considered passing. Questions are randomized from our question pool.",
  ice: "This practice exam simulates the Infection Control (ICE) component of the DANB CDA exam. You will answer 75 multiple-choice questions in 60 minutes covering standard precautions, sterilization, disinfection, occupational safety, and waste management. A score of 75% or higher is considered passing. Questions are randomized from our question pool.",
}

interface ExamSelectionCardProps {
  config: ExamConfig
}

export function ExamSelectionCard({ config }: ExamSelectionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  const startExam = useExamStore((s) => s.startExam)
  const examAttempts = useProgressStore((s) => s.examAttempts)

  const domainAttempts = examAttempts.filter((a) => a.examType === config.type)
  const bestScore = domainAttempts.length > 0
    ? Math.max(...domainAttempts.map((a) => a.score))
    : null

  function handleStart() {
    startExam(config.type)
    router.push(`/exam/${config.type}/session`)
  }

  return (
    <Card
      className="flex flex-col"
      style={{ borderLeft: `4px solid ${domainColorVar[config.type]}` }}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge className={badgeClass[config.type]}>{config.code}</Badge>
          <CardTitle className="text-lg">{config.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            {config.questionCount} questions
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {config.timeLimitMinutes} min
          </span>
          <span className="flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            75% to pass
          </span>
        </div>

        {/* Best score */}
        {bestScore !== null && (
          <div>
            <Badge
              className={
                bestScore >= 75
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }
            >
              Best: {Math.round(bestScore)}%
            </Badge>
          </div>
        )}

        {/* Expandable instructions */}
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Instructions
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              expanded ? "max-h-96 mt-2" : "max-h-0"
            }`}
          >
            <p className="text-sm text-muted-foreground">
              {instructions[config.type]}
            </p>
          </div>
        </div>

        {/* Start button */}
        <Button className="w-full mt-auto" onClick={handleStart}>
          Start Exam
        </Button>
      </CardContent>
    </Card>
  )
}
