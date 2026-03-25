"use client"

import { Flag } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useExamStore } from "@/stores/exam-store"
import { cn } from "@/lib/utils"

export function QuestionDisplay() {
  const questions = useExamStore((s) => s.questions)
  const currentIndex = useExamStore((s) => s.currentIndex)
  const answers = useExamStore((s) => s.answers)
  const flagged = useExamStore((s) => s.flagged)
  const selectAnswer = useExamStore((s) => s.selectAnswer)
  const toggleFlag = useExamStore((s) => s.toggleFlag)

  const question = questions[currentIndex]
  if (!question) return null

  const selectedOption = answers[question.id] ?? ""
  const isFlagged = flagged.has(question.id)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <p className="text-lg leading-relaxed font-medium">{question.stem}</p>
      </div>

      <RadioGroup
        value={selectedOption}
        onValueChange={(value) => selectAnswer(question.id, value)}
        className="space-y-3"
      >
        {question.options.map((option) => (
          <div
            key={option.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 transition-colors",
              selectedOption === option.id
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            )}
          >
            <RadioGroupItem
              value={option.id}
              id={`option-${option.id}`}
              className="mt-0.5"
            />
            <Label
              htmlFor={`option-${option.id}`}
              className="flex-1 cursor-pointer text-sm leading-relaxed font-normal"
            >
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <Button
        variant={isFlagged ? "default" : "outline"}
        size="sm"
        onClick={() => toggleFlag(question.id)}
        className="gap-2"
      >
        <Flag className="h-4 w-4" />
        {isFlagged ? "Flagged for Review" : "Flag for Review"}
      </Button>
    </div>
  )
}
