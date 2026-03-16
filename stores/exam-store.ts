import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ExamType, Question, ExamResult } from "@/types/exam";
import { getExamConfig } from "@/lib/exam-config";
import { loadQuestions } from "@/lib/question-loader";
import { calculateResults } from "@/lib/scoring";

interface ExamState {
  // Exam setup
  examType: ExamType | null;
  questions: Question[];
  currentIndex: number;

  // Answers & flags
  answers: Record<string, string>; // questionId -> optionId
  flagged: Set<string>;

  // Timer
  timeLimitSeconds: number;
  startedAt: number | null; // Date.now() timestamp

  // Status
  isComplete: boolean;
  result: ExamResult | null;

  // Actions
  startExam: (type: ExamType) => void;
  selectAnswer: (questionId: string, optionId: string) => void;
  toggleFlag: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  getRemainingSeconds: () => number;
  submitExam: () => void;
  reset: () => void;
}

// Custom serialization for Set
const storage = createJSONStorage<ExamState>(() => sessionStorage, {
  reviver: (_key: string, value: unknown) => {
    if (
      value &&
      typeof value === "object" &&
      (value as Record<string, unknown>).__type === "Set"
    ) {
      return new Set((value as Record<string, unknown[]>).__values);
    }
    return value;
  },
  replacer: (_key: string, value: unknown) => {
    if (value instanceof Set) {
      return { __type: "Set", __values: Array.from(value) };
    }
    return value;
  },
});

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      examType: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      flagged: new Set<string>(),
      timeLimitSeconds: 0,
      startedAt: null,
      isComplete: false,
      result: null,

      startExam: (type: ExamType) => {
        const config = getExamConfig(type);
        if (!config) return;

        const questions = loadQuestions(type, config.questionCount);
        set({
          examType: type,
          questions,
          currentIndex: 0,
          answers: {},
          flagged: new Set<string>(),
          timeLimitSeconds: config.timeLimitMinutes * 60,
          startedAt: Date.now(),
          isComplete: false,
          result: null,
        });
      },

      selectAnswer: (questionId: string, optionId: string) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: optionId },
        }));
      },

      toggleFlag: (questionId: string) => {
        set((state) => {
          const newFlagged = new Set(state.flagged);
          if (newFlagged.has(questionId)) {
            newFlagged.delete(questionId);
          } else {
            newFlagged.add(questionId);
          }
          return { flagged: newFlagged };
        });
      },

      goToQuestion: (index: number) => {
        const { questions } = get();
        if (index >= 0 && index < questions.length) {
          set({ currentIndex: index });
        }
      },

      nextQuestion: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
          set({ currentIndex: currentIndex + 1 });
        }
      },

      prevQuestion: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1 });
        }
      },

      getRemainingSeconds: () => {
        const { startedAt, timeLimitSeconds, isComplete } = get();
        if (!startedAt || isComplete) return 0;
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        return Math.max(0, timeLimitSeconds - elapsed);
      },

      submitExam: () => {
        const { examType, questions, answers, startedAt, timeLimitSeconds } =
          get();
        if (!examType || !startedAt) return;

        const timeUsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
        const answersMap = new Map(Object.entries(answers));
        const result = calculateResults(
          examType,
          questions,
          answersMap,
          Math.min(timeUsedSeconds, timeLimitSeconds),
          timeLimitSeconds,
        );

        set({ isComplete: true, result });
      },

      reset: () => {
        set({
          examType: null,
          questions: [],
          currentIndex: 0,
          answers: {},
          flagged: new Set<string>(),
          timeLimitSeconds: 0,
          startedAt: null,
          isComplete: false,
          result: null,
        });
      },
    }),
    {
      name: "exam-session",
      storage,
    },
  ),
);
