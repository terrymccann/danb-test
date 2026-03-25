import { cn } from "@/lib/utils";

interface FeedbackBoxProps {
  variant: "correct" | "incorrect" | "detail";
  children: React.ReactNode;
  show: boolean;
}

export function FeedbackBox({ variant, children, show }: FeedbackBoxProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "rounded-md p-4 text-sm leading-relaxed",
        variant === "correct" &&
          "border-l-3 border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
        variant === "incorrect" &&
          "border-l-3 border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
        variant === "detail" &&
          "border-l-3 border-border bg-muted text-foreground",
      )}
    >
      {children}
    </div>
  );
}
