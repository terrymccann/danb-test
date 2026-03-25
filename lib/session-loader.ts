import type { LearningSession } from "@/types/learn"

import iceSpaulding from "@/data/learn/ice-spaulding-classification.json"

const sessions: Record<string, LearningSession> = {
  "ice-spaulding-classification": iceSpaulding as unknown as LearningSession,
}

export function loadSession(sessionId: string): LearningSession | null {
  return sessions[sessionId] ?? null
}
