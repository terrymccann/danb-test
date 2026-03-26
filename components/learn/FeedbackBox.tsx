import { CheckCircle, XCircle } from "lucide-react"

interface FeedbackBoxProps {
  isCorrect: boolean
  feedback: string
}

export function FeedbackBox({ isCorrect, feedback }: FeedbackBoxProps) {
  if (isCorrect) {
    return (
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex gap-3">
        <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
        <div>
          <p className="font-semibold text-green-800 dark:text-green-200">
            Correct!
          </p>
          <div
            className="text-sm text-green-700 dark:text-green-300 leading-relaxed mt-1"
            dangerouslySetInnerHTML={{ __html: feedback }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3">
      <XCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
      <div>
        <p className="font-semibold text-red-800 dark:text-red-200">
          Incorrect
        </p>
        <div
          className="text-sm text-red-700 dark:text-red-300 leading-relaxed mt-1"
          dangerouslySetInnerHTML={{ __html: feedback }}
        />
      </div>
    </div>
  )
}
