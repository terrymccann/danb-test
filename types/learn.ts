import type { ExamType } from "@/types/exam"

export type PhaseKey =
  | "preTest"
  | "content"
  | "elaboration"
  | "scenario"
  | "interleaved"
  | "srsSchedule"

export type ConfidenceLevel =
  | "guessing"
  | "somewhat"
  | "confident"
  | "very-confident"

export interface PhaseOption {
  id: string
  text: string
}

export interface PreTestPhase {
  question: string
  options: PhaseOption[]
  correctOptionId: string
  feedbackCorrect: string
  feedbackIncorrect: string
}

export interface ContentPhase {
  conceptTitle: string
  conceptBody: string
  diagram?: string
  scienceTags: string[]
}

export interface ElaborationPhase {
  prompt: string
  expertReasoning: string
}

export interface ScenarioPhase {
  scenarioText: string
  question: string
  options: PhaseOption[]
  correctOptionId: string
  feedbackCorrect: string
  feedbackIncorrect: string
  detailedExplanation: string
}

export interface InterleavedPhase {
  domainLabel: string
  question: string
  options: PhaseOption[]
  correctOptionId: string
  feedbackCorrect: string
  feedbackIncorrect: string
}

export interface SRSItem {
  concept: string
  interval: string
}

export interface SRSPhase {
  items: SRSItem[]
  sessionSummary: string
}

export interface LearningSession {
  id: string
  title: string
  domain: ExamType
  topic: string
  estimatedMinutes: number
  phases: {
    preTest: PreTestPhase
    content: ContentPhase
    elaboration: ElaborationPhase
    scenario: ScenarioPhase
    interleaved: InterleavedPhase
    srsSchedule: SRSPhase
  }
}

export interface SessionMeta {
  id: string
  title: string
  domain: ExamType
  topic: string
  estimatedMinutes: number
  scienceTags: string[]
  available: boolean
}

export interface SubDomainGroup {
  name: string
  examWeight: string
  sessions: SessionMeta[]
}

export interface DomainLearnConfig {
  domain: ExamType
  title: string
  code: string
  examDetails: string
  subDomains: SubDomainGroup[]
}

