"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import FeatureGate from "../../lib/FeatureGate";
import Link from "next/link";
import { saveQuizResult, getQuizHistory, QuizResult } from "../../lib/quizHistory";
import BackButton from '../../components/BackButton';

const QUIZ_LIMIT_FREE = 1;
const QUIZ_LIMIT_PREMIUM = 5;

const MOCK_QUESTIONS = [
  {
    id: 1,
    soru: "Aşağıdakilerden hangisi DNA&apos;nın bir parçasıdır?",
    secenekler: ["Adenin", "Glukoz", "Lipid", "Kalsiyum"],
    dogru: 0,
    aciklama: "Adenin, DNA&apos;nın bazlarından biridir.",
  },
  {
    id: 2,
    soru: "İnsan vücudunda en bol bulunan mineral nedir?",
    secenekler: ["Demir", "Kalsiyum", "Potasyum", "Sodyum"],
    dogru: 1,
    aciklama: "Kalsiyum, kemiklerde en bol bulunan mineraldir.",
  },
  // ...8 tane daha benzer mock soru ekleyin...
];

export default function QuizPage() {
  const { profile, authState, user } = useAuth();
  const [quizType, setQuizType] = useState<string | null>(null);
  const [quizCountToday] = useState(0); // TODO: Replace with real data
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(MOCK_QUESTIONS.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<QuizResult[]>([]);

  useEffect(() => {
    if (user?.id) {
      setHistory(getQuizHistory(user.id));
    }
  }, [user]);

  if (authState === "loading") return null;

  const isPremium = !!profile?.is_premium;
  const quizLimit = isPremium ? QUIZ_LIMIT_PREMIUM : QUIZ_LIMIT_FREE;
  const canTakeQuiz = quizCountToday < quizLimit;

  const handleStart = () => setStarted(true);

  const handleSelect = (qIdx: number, sIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const copy = [...prev];
      copy[qIdx] = sIdx;
      return copy;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (user?.id) {
      const result: QuizResult = {
        date: new Date().toISOString(),
        type: quizType || "",
        score: correctCount,
        total: MOCK_QUESTIONS.length,
        answers: answers.map(a => a ?? -1),
        questions: MOCK_QUESTIONS.map(q => ({ soru: q.soru, secenekler: q.secenekler, dogru: q.dogru })),
      };
      saveQuizResult(user.id, result);
      setHistory(getQuizHistory(user.id));
    }
  };

  const correctCount = answers.filter((a, i) => a === MOCK_QUESTIONS[i].dogru).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tusai-light dark:bg-tusai-dark py-12">
      <BackButton className="mb-4" />
      <div className="w-full max-w-lg bg-white dark:bg-tusai-dark border border-tusai rounded-lg shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-tusai mb-4 text-center">Quiz Seçimi</h1>
        {!started && (
          <>
            <p className="mb-6 text-center text-sm text-tusai-accent">
              {isPremium ? "Günde 5 quiz hakkınız var." : "Günde 1 quiz hakkınız var. Daha fazlası için Premium’a geçin."}
            </p>
            <div className="flex gap-4 mb-8">
              <button
                className={`px-4 py-2 rounded font-semibold border ${quizType === "cikmis" ? "bg-tusai text-white" : "border-tusai text-tusai bg-tusai-light hover:bg-tusai-accent/10"}`}
                onClick={() => setQuizType("cikmis")}
              >
                Sınav Tipi Sorular
              </button>
              <button
                className={`px-4 py-2 rounded font-semibold border ${quizType === "karisik" ? "bg-tusai text-white" : "border-tusai text-tusai bg-tusai-light hover:bg-tusai-accent/10"}`}
                onClick={() => setQuizType("karisik")}
              >
                Karışık (AI + Sınav Tipi)
              </button>
            </div>
            {quizType && (
              <FeatureGate premium={quizLimit > QUIZ_LIMIT_FREE}>
                {canTakeQuiz ? (
                  <button className="bg-tusai text-white px-6 py-2 rounded font-semibold hover:bg-tusai-accent transition" onClick={handleStart}>
                    Quize Başla
                  </button>
                ) : (
                  <div className="text-center text-red-600 font-semibold">
                    Günlük quiz hakkınızı doldurdunuz. Daha fazla quiz için Premium’a geçin.
                  </div>
                )}
              </FeatureGate>
            )}
          </>
        )}
        {started && (
          <div className="w-full">
            <h2 className="text-lg font-bold mb-4 text-tusai">Quiz</h2>
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
              {MOCK_QUESTIONS.map((q, qIdx) => (
                <div key={q.id} className="mb-6">
                  <div className="font-semibold mb-2">{qIdx + 1}. {q.soru}</div>
                  <div className="flex flex-col gap-2">
                    {q.secenekler.map((sec, sIdx) => (
                      <label key={sIdx} className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer border ${answers[qIdx] === sIdx ? "border-tusai bg-tusai-light/60" : "border-gray-200"} ${submitted && q.dogru === sIdx ? "border-green-500" : ""} ${submitted && answers[qIdx] === sIdx && answers[qIdx] !== q.dogru ? "border-red-500" : ""}`}>
                        <input
                          type="radio"
                          name={`q${qIdx}`}
                          checked={answers[qIdx] === sIdx}
                          onChange={() => handleSelect(qIdx, sIdx)}
                          disabled={submitted}
                        />
                        <span>{sec}</span>
                      </label>
                    ))}
                  </div>
                  {submitted && (
                    <div className={`mt-2 text-sm ${answers[qIdx] === q.dogru ? "text-green-600" : "text-red-600"}`}>
                      {answers[qIdx] === q.dogru ? "Doğru!" : `Yanlış. Doğru cevap: ${q.secenekler[q.dogru]}`}
                      <div className="text-gray-500 mt-1">Açıklama: {q.aciklama}</div>
                    </div>
                  )}
                </div>
              ))}
              {!submitted ? (
                <button type="submit" className="w-full bg-tusai text-white py-2 rounded font-semibold hover:bg-tusai-accent transition mt-4">
                  Cevapları Gönder
                </button>
              ) : (
                <div className="mt-6 text-center">
                  <div className="text-lg font-bold text-tusai">Skorunuz: {correctCount} / {MOCK_QUESTIONS.length}</div>
                  <button className="mt-4 bg-tusai-accent text-white px-4 py-2 rounded font-semibold hover:bg-tusai transition" onClick={() => { setStarted(false); setAnswers(Array(MOCK_QUESTIONS.length).fill(null)); setSubmitted(false); }}>
                    Yeni Quiz Başlat
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
        <div className="mt-8 text-xs text-center opacity-70">
          Quiz geçmişinizi görmek için <Link href="/" className="text-tusai-accent underline">Ana Sayfa</Link>&apos;yı ziyaret edin.
        </div>
        <FeatureGate premium>
          <div className="mt-12 w-full">
            <h3 className="text-lg font-bold text-tusai-accent mb-2">Quiz Geçmişi (Premium)</h3>
            {history.length === 0 ? (
              <div className="text-gray-500">Henüz quiz geçmişiniz yok.</div>
            ) : (
              <ul className="space-y-2">
                {history.slice().reverse().map((h, i) => (
                  <li key={i} className="border border-tusai rounded p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-tusai-light/40 dark:bg-tusai-dark/40">
                    <span className="font-semibold">{new Date(h.date).toLocaleDateString("tr-TR")} - {h.type === "cikmis" ? "Sınav Tipi Sorular" : "Karışık"}</span>
                    <span className="text-tusai-accent font-bold">Skor: {h.score} / {h.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FeatureGate>
      </div>
    </div>
  );
} 