"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLearnStore } from "@/stores/learn-store"
import { loadSession } from "@/lib/session-loader"
import { SessionStepper } from "@/components/learn/SessionStepper"

export default function LearnSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = use(params)
  const router = useRouter()
  const session = useLearnStore((s) => s.session)
  const startSession = useLearnStore((s) => s.startSession)

  useEffect(() => {
    if (session?.id === sessionId) return

    const data = loadSession(sessionId)
    if (!data) {
      router.replace("/")
      return
    }
    startSession(data)
  }, [sessionId, session?.id, router, startSession])

  if (!session) return null

  return <SessionStepper />
}
