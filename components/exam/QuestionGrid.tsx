"use client";

import { Grid3X3 } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExamStore } from "@/stores/exam-store";
import { cn } from "@/lib/utils";

export function QuestionGrid() {
  const questions = useExamStore((s) => s.questions);
  const currentIndex = useExamStore((s) => s.currentIndex);
  const answers = useExamStore((s) => s.answers);
  const flagged = useExamStore((s) => s.flagged);
  const goToQuestion = useExamStore((s) => s.goToQuestion);

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5" />}
      >
        <Grid3X3 className="h-4 w-4" />
        Grid
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Question Navigator</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm border bg-muted" />
            Unanswered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
            Answered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-orange-500" />
            Flagged
          </span>
        </div>
        <ScrollArea className="max-h-[400px]">
          <div className="grid grid-cols-10 gap-1.5 p-1">
            {questions.map((q, index) => {
              const isAnswered = q.id in answers;
              const isFlagged = flagged.has(q.id);
              const isCurrent = index === currentIndex;

              return (
                <DialogClose
                  key={q.id}
                  render={
                    <button
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-sm text-xs font-medium transition-colors",
                        isFlagged && "bg-orange-500 text-white",
                        !isFlagged &&
                          isAnswered &&
                          "bg-primary text-primary-foreground",
                        !isFlagged &&
                          !isAnswered &&
                          "bg-muted text-muted-foreground",
                        isCurrent && "ring-2 ring-ring ring-offset-1",
                      )}
                    />
                  }
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </DialogClose>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
