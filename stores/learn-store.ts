import { create } from "zustand";
import type {
  LearningSession,
  PhaseKey,
  ConfidenceLevel,
  TeachBackEvaluation,
} from "@/types/learn";

const PHASE_ORDER: PhaseKey[] = [
  "preTest",
  "content",
  "elaboration",
  "scenario",
  "interleaved",
  "teachBack",
  "srsSchedule",
];

interface LearnState {
  session: LearningSession | null;
  currentPhase: PhaseKey;
  phaseIndex: number;

  preTestAnswer: string | null;
  preTestCorrect: boolean | null;

  scenarioConfidence: ConfidenceLevel | null;
  scenarioAnswer: string | null;
  scenarioCorrect: boolean | null;

  interleavedAnswer: string | null;
  interleavedCorrect: boolean | null;

  elaborationRevealed: boolean;

  teachBackResponse: string;
  teachBackEvaluation: TeachBackEvaluation | null;
  teachBackLoading: boolean;

  startSession: (session: LearningSession) => void;
  goToPhase: (phase: PhaseKey) => void;
  nextPhase: () => void;
  prevPhase: () => void;
  canAdvance: () => boolean;

  answerPreTest: (optionId: string) => void;
  setConfidence: (level: ConfidenceLevel) => void;
  answerScenario: (optionId: string) => void;
  answerInterleaved: (optionId: string) => void;
  revealElaboration: () => void;

  setTeachBackResponse: (text: string) => void;
  submitTeachBack: () => Promise<void>;

  reset: () => void;
}

export const useLearnStore = create<LearnState>()((set, get) => ({
  session: null,
  currentPhase: "preTest",
  phaseIndex: 0,

  preTestAnswer: null,
  preTestCorrect: null,

  scenarioConfidence: null,
  scenarioAnswer: null,
  scenarioCorrect: null,

  interleavedAnswer: null,
  interleavedCorrect: null,

  elaborationRevealed: false,

  teachBackResponse: "",
  teachBackEvaluation: null,
  teachBackLoading: false,

  startSession: (session) => {
    set({
      session,
      currentPhase: "preTest",
      phaseIndex: 0,
      preTestAnswer: null,
      preTestCorrect: null,
      scenarioConfidence: null,
      scenarioAnswer: null,
      scenarioCorrect: null,
      interleavedAnswer: null,
      interleavedCorrect: null,
      elaborationRevealed: false,
      teachBackResponse: "",
      teachBackEvaluation: null,
      teachBackLoading: false,
    });
  },

  goToPhase: (phase) => {
    const index = PHASE_ORDER.indexOf(phase);
    if (index >= 0) {
      set({ currentPhase: phase, phaseIndex: index });
    }
  },

  nextPhase: () => {
    const { phaseIndex } = get();
    if (!get().canAdvance()) return;
    if (phaseIndex < PHASE_ORDER.length - 1) {
      const newIndex = phaseIndex + 1;
      set({ phaseIndex: newIndex, currentPhase: PHASE_ORDER[newIndex] });
    }
  },

  prevPhase: () => {
    const { phaseIndex } = get();
    if (phaseIndex > 0) {
      const newIndex = phaseIndex - 1;
      set({ phaseIndex: newIndex, currentPhase: PHASE_ORDER[newIndex] });
    }
  },

  canAdvance: () => {
    const state = get();
    switch (state.currentPhase) {
      case "preTest":
        return state.preTestAnswer !== null;
      case "content":
        return true;
      case "elaboration":
        return state.elaborationRevealed;
      case "scenario":
        return state.scenarioConfidence !== null && state.scenarioAnswer !== null;
      case "interleaved":
        return state.interleavedAnswer !== null;
      case "teachBack":
        return state.teachBackResponse.trim().length > 0;
      case "srsSchedule":
        return false; // terminal phase
    }
  },

  answerPreTest: (optionId) => {
    const { session, preTestAnswer } = get();
    if (preTestAnswer !== null || !session) return;
    set({
      preTestAnswer: optionId,
      preTestCorrect: optionId === session.phases.preTest.correctOptionId,
    });
  },

  setConfidence: (level) => {
    set({ scenarioConfidence: level });
  },

  answerScenario: (optionId) => {
    const { session, scenarioAnswer } = get();
    if (scenarioAnswer !== null || !session) return;
    set({
      scenarioAnswer: optionId,
      scenarioCorrect: optionId === session.phases.scenario.correctOptionId,
    });
  },

  answerInterleaved: (optionId) => {
    const { session, interleavedAnswer } = get();
    if (interleavedAnswer !== null || !session) return;
    set({
      interleavedAnswer: optionId,
      interleavedCorrect: optionId === session.phases.interleaved.correctOptionId,
    });
  },

  revealElaboration: () => {
    set({ elaborationRevealed: true });
  },

  setTeachBackResponse: (text) => {
    set({ teachBackResponse: text });
  },

  submitTeachBack: async () => {
    const { session, teachBackResponse, teachBackEvaluation } = get();
    if (!session || teachBackEvaluation !== null) return;

    set({ teachBackLoading: true });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/evaluate-teachback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userResponse: teachBackResponse,
          prompt: session.phases.teachBack.prompt,
          modelAnswer: session.phases.teachBack.modelAnswer,
          sessionTopic: session.title,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("API error");

      const evaluation: TeachBackEvaluation = await res.json();
      evaluation.completeness = Math.max(0, Math.min(100, evaluation.completeness));
      set({ teachBackEvaluation: evaluation, teachBackLoading: false });
    } catch {
      set({ teachBackLoading: false });
    }
  },

  reset: () => {
    set({
      session: null,
      currentPhase: "preTest",
      phaseIndex: 0,
      preTestAnswer: null,
      preTestCorrect: null,
      scenarioConfidence: null,
      scenarioAnswer: null,
      scenarioCorrect: null,
      interleavedAnswer: null,
      interleavedCorrect: null,
      elaborationRevealed: false,
      teachBackResponse: "",
      teachBackEvaluation: null,
      teachBackLoading: false,
    });
  },
}));

export { PHASE_ORDER };
