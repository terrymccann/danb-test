"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useExamStore } from "@/stores/exam-store"

export function QuestionNav() {
  const router = useRouter()
  const currentIndex = useExamStore((s) => s.currentIndex)
  const questions = useExamStore((s) => s.questions)
  const answers = useExamStore((s) => s.answers)
  const examType = useExamStore((s) => s.examType)
  const nextQuestion = useExamStore((s) => s.nextQuestion)
  const prevQuestion = useExamStore((s) => s.prevQuestion)
  const submitExam = useExamStore((s) => s.submitExam)

  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1
  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount

  const handleSubmit = () => {
    submitExam()
    router.push(`/exam/${examType}/results`)
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={isFirst}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>

        {isLast ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="default" className="gap-1" />}
            >
              Review & Submit
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
                <AlertDialogDescription>
                  {unansweredCount > 0 ? (
                    <>
                      You have{" "}
                      <span className="font-semibold text-destructive">
                        {unansweredCount} unanswered{" "}
                        {unansweredCount === 1 ? "question" : "questions"}
                      </span>
                      . Unanswered questions will be marked incorrect.
                    </>
                  ) : (
                    "You have answered all questions."
                  )}{" "}
                  Are you sure you want to submit?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Exam</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>
                  Submit Exam
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            variant="outline"
            onClick={nextQuestion}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Use arrow keys to navigate
      </p>
    </div>
  )
}
