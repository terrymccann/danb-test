"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultsSummary } from "@/components/exam/ResultsSummary";
import { useExamStore } from "@/stores/exam-store";
import { getExamConfig } from "@/lib/exam-config";
import { ExamType } from "@/types/exam";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ examType: string }>;
}) {
  const { examType } = use(params);
  const router = useRouter();
  const result = useExamStore((s) => s.result);
  const questions = useExamStore((s) => s.questions);
  const answers = useExamStore((s) => s.answers);
  const startExam = useExamStore((s) => s.startExam);
  const reset = useExamStore((s) => s.reset);

  const config = getExamConfig(examType);

  useEffect(() => {
    if (!result) {
      router.replace("/");
    }
  }, [result, router]);

  if (!result || !config) return null;

  const handleRetake = () => {
    startExam(examType as ExamType);
    router.push(`/exam/${examType}/session`);
  };

  const handleHome = () => {
    reset();
    router.push("/");
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {config.title} — Results
        </h1>
      </div>

      <ResultsSummary
        result={result}
        questions={questions}
        answers={answers}
      />

      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={handleHome} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <Button onClick={handleRetake} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Retake Exam
        </Button>
      </div>
    </main>
  );
}
