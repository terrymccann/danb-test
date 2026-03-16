export type ExamType = "gc" | "rhs" | "ice";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  examType: ExamType;
  topic: string;
  stem: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  source?: string;
}

export interface ExamConfig {
  type: ExamType;
  title: string;
  code: string;
  questionCount: number;
  timeLimitMinutes: number;
  topics: string[];
  description: string;
}

export interface AnswerRecord {
  questionId: string;
  selectedOptionId: string | null;
}

export interface TopicScore {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface ExamResult {
  examType: ExamType;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
  timeUsedSeconds: number;
  timeLimitSeconds: number;
  topicScores: TopicScore[];
}
