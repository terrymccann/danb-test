"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Timer } from "@/components/exam/Timer"
import { QuestionDisplay } from "@/components/exam/QuestionDisplay"
import { QuestionNav } from "@/components/exam/QuestionNav"
import { QuestionGrid } from "@/components/exam/QuestionGrid"
import { Sidebar } from "@/components/layout/Sidebar"
import { SidebarSheet } from "@/components/layout/SidebarSheet"
import { useExamStore } from "@/stores/exam-store"

export default function ExamSessionPage() {
  const router = useRouter()
  const examType = useExamStore((s) => s.examType)
  const questions = useExamStore((s) => s.questions)
  const currentIndex = useExamStore((s) => s.currentIndex)
  const isComplete = useExamStore((s) => s.isComplete)
  const nextQuestion = useExamStore((s) => s.nextQuestion)
  const prevQuestion = useExamStore((s) => s.prevQuestion)

  // Redirect if no active exam or exam is complete
  useEffect(() => {
    if (!examType || questions.length === 0) {
      router.replace("/")
      return
    }
    if (isComplete) {
      router.replace(`/exam/${examType}/results`)
    }
  }, [examType, questions.length, isComplete, router])

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault()
        nextQuestion()
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        prevQuestion()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [nextQuestion, prevQuestion])

  if (!examType || questions.length === 0) return null

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar — hidden on mobile */}
      <Sidebar>
        <QuestionGrid />
      </Sidebar>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Timer />
            <span className="text-sm text-muted-foreground">
              Q {currentIndex + 1}/{questions.length}
            </span>
            <div className="flex items-center gap-2">
              {/* Mobile only: sidebar sheet trigger */}
              <div className="lg:hidden">
                <SidebarSheet>
                  <QuestionGrid />
                </SidebarSheet>
              </div>
            </div>
          </div>
        </div>

        {/* Question area */}
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          <QuestionDisplay />
        </main>

        {/* Bottom nav */}
        <div className="border-t bg-background px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <QuestionNav />
          </div>
        </div>
      </div>
    </div>
  )
}
