import type { LearningSession } from "@/types/learn"

import iceSpaulding from "@/data/learn/ice-spaulding-classification.json"
import gcVitalSigns from "@/data/learn/gc-vital-signs.json"
import gcMedicalHistory from "@/data/learn/gc-medical-history.json"
import gcFourHanded from "@/data/learn/gc-four-handed.json"
import gcAmalgam from "@/data/learn/gc-amalgam.json"
import gcOralHealthEducation from "@/data/learn/gc-oral-health-education.json"
import rhsParalleling from "@/data/learn/rhs-paralleling.json"
import gcDentalCharting from "@/data/learn/gc-dental-charting.json"
import gcInstrumentId from "@/data/learn/gc-instrument-id.json"
import gcComposite from "@/data/learn/gc-composite.json"
import rhsBisecting from "@/data/learn/rhs-bisecting.json"
import iceStandardPrecautions from "@/data/learn/ice-standard-precautions.json"
import gcToothAnatomy from "@/data/learn/gc-tooth-anatomy.json"
import gcMedicalEmergencies from "@/data/learn/gc-medical-emergencies.json"
import gcCements from "@/data/learn/gc-cements.json"
import rhsBitewing from "@/data/learn/rhs-bitewing.json"
import icePpe from "@/data/learn/ice-ppe.json"

const sessions: Record<string, LearningSession> = {
  "ice-spaulding-classification": iceSpaulding as unknown as LearningSession,
  "gc-vital-signs": gcVitalSigns as unknown as LearningSession,
  "gc-medical-history": gcMedicalHistory as unknown as LearningSession,
  "gc-four-handed": gcFourHanded as unknown as LearningSession,
  "gc-amalgam": gcAmalgam as unknown as LearningSession,
  "gc-oral-health-education": gcOralHealthEducation as unknown as LearningSession,
  "rhs-paralleling": rhsParalleling as unknown as LearningSession,
  "gc-dental-charting": gcDentalCharting as unknown as LearningSession,
  "gc-instrument-id": gcInstrumentId as unknown as LearningSession,
  "gc-composite": gcComposite as unknown as LearningSession,
  "rhs-bisecting": rhsBisecting as unknown as LearningSession,
  "ice-standard-precautions": iceStandardPrecautions as unknown as LearningSession,
  "gc-tooth-anatomy": gcToothAnatomy as unknown as LearningSession,
  "gc-medical-emergencies": gcMedicalEmergencies as unknown as LearningSession,
  "gc-cements": gcCements as unknown as LearningSession,
  "rhs-bitewing": rhsBitewing as unknown as LearningSession,
  "ice-ppe": icePpe as unknown as LearningSession,
}

export function loadSession(sessionId: string): LearningSession | null {
  return sessions[sessionId] ?? null
}
