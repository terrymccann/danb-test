"use client"

import Link from "next/link"
import { Clock, FileText } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ExamConfig } from "@/types/exam"
import { getQuestionPoolSize } from "@/lib/question-loader"

interface ExamCardProps {
  config: ExamConfig
}

export function ExamCard({ config }: ExamCardProps) {
  const poolSize = getQuestionPoolSize(config.type)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-sm font-semibold">
            {config.code}
          </Badge>
        </div>
        <CardTitle className="text-xl">{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              {config.questionCount} questions ({poolSize} in pool)
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{config.timeLimitMinutes} minutes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.topics.map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
        <Link
          href={`/exam/${config.type}`}
          className={buttonVariants({ className: "w-full" })}
        >
          Start Practice Exam
        </Link>
      </CardContent>
    </Card>
  )
}
