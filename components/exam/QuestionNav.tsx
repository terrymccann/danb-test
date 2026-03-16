"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useExamStore } from "@/stores/exam-store";

export function QuestionNav() {
  const router = useRouter();
  const currentIndex = useExamStore((s) => s.currentIndex);
  const questions = useExamStore((s) => s.questions);
  const answers = useExamStore((s) => s.answers);
  const examType = useExamStore((s) => s.examType);
  const nextQuestion = useExamStore((s) => s.nextQuestion);
  const prevQuestion = useExamStore((s) => s.prevQuestion);
  const submitExam = useExamStore((s) => s.submitExam);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const handleSubmit = () => {
    submitExam();
    router.push(`/exam/${examType}/results`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={isFirst}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={nextQuestion}
          disabled={isLast}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="default" className="gap-2" />}>
          <Send className="h-4 w-4" />
          Submit Exam
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
    </div>
  );
}
