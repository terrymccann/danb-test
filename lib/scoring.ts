import { PASS_THRESHOLD } from "@/lib/exam-config";
import { ExamResult, ExamType, Question, TopicScore } from "@/types/exam";

export function calculateResults(
  examType: ExamType,
  questions: Question[],
  answers: Map<string, string>,
  timeUsedSeconds: number,
  timeLimitSeconds: number,
): ExamResult {
  let correctAnswers = 0;
  const topicMap = new Map<string, { correct: number; total: number }>();

  for (const question of questions) {
    const selectedOptionId = answers.get(question.id) ?? null;
    const isCorrect = selectedOptionId === question.correctOptionId;

    if (isCorrect) correctAnswers++;

    const topic = topicMap.get(question.topic) ?? { correct: 0, total: 0 };
    topic.total++;
    if (isCorrect) topic.correct++;
    topicMap.set(question.topic, topic);
  }

  const percentage =
    questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;

  const topicScores: TopicScore[] = Array.from(topicMap.entries()).map(
    ([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      percentage: total > 0 ? (correct / total) * 100 : 0,
    }),
  );

  return {
    examType,
    totalQuestions: questions.length,
    correctAnswers,
    percentage,
    passed: percentage >= PASS_THRESHOLD * 100,
    timeUsedSeconds,
    timeLimitSeconds,
    topicScores,
  };
}
