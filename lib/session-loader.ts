import type { LearningSession } from "@/types/learn"

import iceSpaulding from "@/data/learn/ice-spaulding-classification.json"
import gcVitalSigns from "@/data/learn/gc-vital-signs.json"
import gcMedicalHistory from "@/data/learn/gc-medical-history.json"
import gcFourHanded from "@/data/learn/gc-four-handed.json"
import gcAmalgam from "@/data/learn/gc-amalgam.json"
import gcOralHealthEducation from "@/data/learn/gc-oral-health-education.json"
import rhsParalleling from "@/data/learn/rhs-paralleling.json"

const sessions: Record<string, LearningSession> = {
  "ice-spaulding-classification": iceSpaulding as unknown as LearningSession,
  "gc-vital-signs": gcVitalSigns as unknown as LearningSession,
  "gc-medical-history": gcMedicalHistory as unknown as LearningSession,
  "gc-four-handed": gcFourHanded as unknown as LearningSession,
  "gc-amalgam": gcAmalgam as unknown as LearningSession,
  "gc-oral-health-education": gcOralHealthEducation as unknown as LearningSession,
  "rhs-paralleling": rhsParalleling as unknown as LearningSession,
}

export function loadSession(sessionId: string): LearningSession | null {
  return sessions[sessionId] ?? null
}
