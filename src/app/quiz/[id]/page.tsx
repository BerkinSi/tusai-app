"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
// import { getQuizById, submitQuizAnswers } from "../../../lib/quizApi"; // TODO: implement real fetch/submit

// Placeholder quiz data structure
const MOCK_QUIZ = {
  id: "abc123",
  questions: [
    {
      id: 1,
      text: "Aşağıdakilerden hangisi DNA'nın bir parçasıdır?",
      options: ["Adenin", "Glukoz", "Lipid", "Kalsiyum", "Protein"],
    },
    {
      id: 2,
      text: "İnsan vücudunda en bol bulunan mineral nedir?",
      options: ["Demir", "Kalsiyum", "Potasyum", "Sodyum", "Magnezyum"],
    },
    {
      id: 3,
      text: "Hangisi bir vitamin değildir?",
      options: ["A", "B12", "C", "D", "Glukoz"],
    },
    {
      id: 4,
      text: "En küçük kemik hangisidir?",
      options: ["Femur", "Stapes", "Tibia", "Radius", "Ulna"],
    },
    {
      id: 5,
      text: "Hangisi bir nükleotid değildir?",
      options: ["ATP", "GTP", "CTP", "TTP", "Glukoz"],
    },
  ],
  timer: 60, // minutes, or null for no timer
};

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export default function QuizTakePage() {
  const router = useRouter();

  // const quizId = params.id; // TODO: use for real fetch
  const quiz = MOCK_QUIZ; // TODO: fetch real quiz by id

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null));
  const [timer, setTimer] = useState<number | null>(quiz.timer ? quiz.timer * 60 : null); // seconds
  const [isTabActive, setIsTabActive] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Finish/submit
  const handleFinish = useCallback(() => {
    // TODO: submitQuizAnswers(quiz.id, answers)
    router.replace(`/quiz/${quiz.id}/result`);
  }, [router, quiz.id]);

  // Timer logic
  useEffect(() => {
    if (timer === null) return;
    if (!isTabActive) return;
    if (timer <= 0) {
      handleFinish();
      return;
    }
    timerRef.current = setTimeout(() => setTimer((t) => (t !== null ? t - 1 : null)), 1000);
    return () => clearTimeout(timerRef.current!);
  }, [timer, isTabActive, handleFinish]);

  // Pause timer if tab is inactive
  useEffect(() => {
    const onVisibility = () => setIsTabActive(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Answer selection (toggleable)
  function handleSelect(optionIdx: number) {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[current] = prev[current] === optionIdx ? null : optionIdx;
      return copy;
    });
  }

  // Navigation
  function goNext() {
    if (current < quiz.questions.length - 1) setCurrent((c) => c + 1);
  }
  function goPrev() {
    if (current > 0) setCurrent((c) => c - 1);
  }
  function goTo(idx: number) {
    setCurrent(idx);
  }

  // Progress bar
  const progress = ((current + 1) / quiz.questions.length) * 100;

  // Timer display
  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-tusai-light flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-tusai p-6 min-h-[400px] flex flex-col justify-between mx-2
        sm:w-[360px] sm:max-w-none">
        {/* Progress & Timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-tusai text-sm">Soru {current + 1} / {quiz.questions.length}</div>
          {timer !== null && (
            <div className="font-mono text-xs bg-tusai-accent text-white px-3 py-1 rounded">
              {formatTime(timer)}
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded mb-6 w-full">
          <div className="h-2 bg-tusai-accent rounded" style={{ width: `${progress}%` }}></div>
        </div>
        {/* Question Card */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="font-bold text-lg mb-4 text-tusai-dark break-words">{quiz.questions[current].text}</div>
          <div className="flex flex-col gap-3 mb-4">
            {quiz.questions[current].options.map((opt, idx) => (
              <button
                key={idx}
                className={`w-full text-left px-4 py-3 rounded-lg border text-base font-medium transition-all
                  ${answers[current] === idx ? "bg-tusai-accent text-white border-tusai-accent" : "bg-gray-50 border-gray-200 text-tusai-dark hover:bg-tusai-accent/10"}
                `}
                onClick={() => handleSelect(idx)}
              >
                <span className="inline-block w-6 font-bold">{OPTION_LABELS[idx]}</span> {opt}
              </button>
            ))}
          </div>
        </div>
        {/* Navigation */}
        <div className="flex justify-between items-center mb-4 gap-2 w-full">
          <button
            className="px-4 py-2 rounded font-semibold bg-gray-100 text-tusai-dark border border-gray-200 disabled:opacity-50"
            onClick={goPrev}
            disabled={current === 0}
          >
            Önceki Soru
          </button>
          {current < quiz.questions.length - 1 ? (
            <button
              className="px-4 py-2 rounded font-semibold bg-tusai-accent text-white hover:bg-tusai transition"
              onClick={goNext}
            >
              Sonraki Soru
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded font-semibold bg-tusai-accent text-white hover:bg-tusai transition"
              onClick={handleFinish}
            >
              Bitir
            </button>
          )}
        </div>
        {/* Question number list - improved UX */}
        <div className="overflow-x-auto mb-2 w-full">
          <div className="flex gap-2 min-w-fit pb-1 justify-center">
            {quiz.questions.map((_, idx) => {
              const isCurrent = idx === current;
              const isAnswered = answers[idx] !== null;
              return (
                <button
                  key={idx}
                  aria-label={`Soru ${idx + 1}${isAnswered ? ' (Cevaplandı)' : ' (Boş)'}`}
                  className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-semibold border transition-all
                    ${isCurrent ? "bg-tusai-accent text-white border-tusai-accent shadow-lg z-10" : ""}
                    ${isAnswered && !isCurrent ? "bg-tusai-accent/20 border-tusai-accent text-tusai-accent" : ""}
                    ${!isAnswered && !isCurrent ? "bg-gray-100 border-gray-300 text-gray-400" : ""}
                    hover:scale-105 focus:outline-none focus:ring-2 focus:ring-tusai-accent/50`
                  }
                  style={{ aspectRatio: '1 / 1' }}
                  onClick={() => goTo(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
        {/* Legend for answered/unanswered - compact */}
        <div className="flex justify-center gap-3 text-xs text-gray-500 mb-2 w-full">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-tusai-accent/20 border border-tusai-accent inline-block"></span> Cevaplandı</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300 inline-block"></span> Boş</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-tusai-accent border border-tusai-accent inline-block"></span> Şu Anki</div>
        </div>
      </div>
    </div>
  );
} 