export interface QuizResult {
  date: string;
  type: string;
  score: number;
  total: number;
  answers: number[];
  questions: { soru: string; secenekler: string[]; dogru: number }[];
}

const STORAGE_KEY = "tusai_quiz_history";

export function saveQuizResult(userId: string, quiz: QuizResult) {
  if (!userId) return;
  const all = getAllHistory();
  if (!all[userId]) all[userId] = [];
  all[userId].push(quiz);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getQuizHistory(userId: string): QuizResult[] {
  if (!userId) return [];
  const all = getAllHistory();
  return all[userId] || [];
}

function getAllHistory(): Record<string, QuizResult[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
} 