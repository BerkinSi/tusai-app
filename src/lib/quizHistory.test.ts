import { saveQuizResult, getQuizHistory, QuizResult } from './quizHistory';

describe('quizHistory', () => {
  const userId = 'test-user';
  const quiz: QuizResult = {
    date: '2024-07-17T12:00:00Z',
    type: 'cikmis',
    score: 8,
    total: 10,
    answers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],
    questions: [
      { soru: 'Soru 1', secenekler: ['A', 'B', 'C', 'D'], dogru: 0 },
      { soru: 'Soru 2', secenekler: ['A', 'B', 'C', 'D'], dogru: 1 },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty history for new user', () => {
    expect(getQuizHistory(userId)).toEqual([]);
  });

  it('should save and retrieve quiz results', () => {
    saveQuizResult(userId, quiz);
    const history = getQuizHistory(userId);
    expect(history.length).toBe(1);
    expect(history[0]).toMatchObject({
      date: quiz.date,
      type: quiz.type,
      score: quiz.score,
      total: quiz.total,
    });
  });

  it('should append multiple quiz results', () => {
    saveQuizResult(userId, quiz);
    saveQuizResult(userId, { ...quiz, date: '2024-07-18T12:00:00Z', score: 10 });
    const history = getQuizHistory(userId);
    expect(history.length).toBe(2);
    expect(history[1].score).toBe(10);
  });
}); 