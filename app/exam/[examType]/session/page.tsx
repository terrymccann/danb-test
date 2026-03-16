"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "@/components/exam/Timer";
import { QuestionDisplay } from "@/components/exam/QuestionDisplay";
import { QuestionNav } from "@/components/exam/QuestionNav";
import { QuestionGrid } from "@/components/exam/QuestionGrid";
import { useExamStore } from "@/stores/exam-store";

export default function ExamSessionPage() {
  const router = useRouter();
  const examType = useExamStore((s) => s.examType);
  const questions = useExamStore((s) => s.questions);
  const currentIndex = useExamStore((s) => s.currentIndex);
  const answers = useExamStore((s) => s.answers);
  const isComplete = useExamStore((s) => s.isComplete);
  const nextQuestion = useExamStore((s) => s.nextQuestion);
  const prevQuestion = useExamStore((s) => s.prevQuestion);

  // Redirect if no active exam or exam is complete
  useEffect(() => {
    if (!examType || questions.length === 0) {
      router.replace("/");
      return;
    }
    if (isComplete) {
      router.replace(`/exam/${examType}/results`);
    }
  }, [examType, questions.length, isComplete, router]);

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextQuestion();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prevQuestion();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nextQuestion, prevQuestion]);

  if (!examType || questions.length === 0) return null;

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Timer />
          <span className="text-sm text-muted-foreground">
            Q {currentIndex + 1}/{questions.length}{" "}
            <span className="hidden sm:inline">
              ({answeredCount} answered)
            </span>
          </span>
          <QuestionGrid />
        </div>
      </div>

      {/* Question area */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <QuestionDisplay />
      </main>

      {/* Bottom nav */}
      <div className="border-t bg-background">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <QuestionNav />
        </div>
      </div>
    </div>
  );
}
