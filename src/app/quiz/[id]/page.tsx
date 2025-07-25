"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/AuthContext";
import { FlagIcon } from '@heroicons/react/24/outline';
// import { getQuizById, submitQuizAnswers } from "../../../lib/quizApi"; // TODO: implement real fetch/submit
import { supabase } from "../../../lib/supabaseClient";
import { XMarkIcon } from '@heroicons/react/24/outline';

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
  timer: null, // No timer for non-premium users
};

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export default function QuizTakePage() {
  const router = useRouter();
  const { user, profile, authState } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/giris');
    }
  }, [authState, router]);

  // Show loading while checking auth
  if (authState === 'loading' || authState === 'idle') {
    return (
      <div className="min-h-screen bg-tusai-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tusai-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-tusai-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Quiz'e erişmek için giriş yapmalısınız.</p>
          <button 
            onClick={() => router.push('/giris')}
            className="bg-tusai-accent text-white px-6 py-2 rounded-lg hover:bg-tusai transition"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  // const quizId = params.id; // TODO: use for real fetch
  const quiz = MOCK_QUIZ; // TODO: fetch real quiz by id

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null));
  const [isReportQuestionOpen, setIsReportQuestionOpen] = useState(false);
  const [reportQuestionId, setReportQuestionId] = useState<number | null>(null);
  const [reportMessage, setReportMessage] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Finish/submit
  const handleFinish = useCallback(() => {
    // TODO: submitQuizAnswers(quiz.id, answers)
    router.replace(`/quiz/${quiz.id}/result`);
  }, [router, quiz.id]);

  // Report question function
  const handleReportQuestion = (questionId: number) => {
    setReportQuestionId(questionId);
    setIsReportQuestionOpen(true);
    setReportMessage("");
  };

  // Submit report function
  const handleSubmitReport = async () => {
    if (!reportMessage.trim()) return;
    
    console.log('=== FRONTEND REPORT SUBMISSION STARTED ===');
    console.log('User:', user?.email);
    console.log('Question ID:', reportQuestionId);
    console.log('Message:', reportMessage);
    
    setIsSubmittingReport(true);
    try {
      // Prepare report data
      const reportData = {
        user_email: user?.email || 'unknown@tusai.app',
        question_id: reportQuestionId,
        message: reportMessage,
        quiz_id: quiz.id,
        question_text: quiz.questions[current].text
      };

      console.log('📧 Report data being sent:', reportData);

      // Send report via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(reportData)
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);

      if (response.ok) {
        console.log('✅ Report submitted successfully');
        setShowSuccessMessage(true);
        setIsReportQuestionOpen(false);
        setReportMessage("");
        setReportQuestionId(null);
        
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        console.error('❌ Report submission failed');
        const errorData = await response.text();
        console.error('Error response:', errorData);
        setErrorMessage('Bildirim gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('❌ Unexpected error during report submission:', error);
      setErrorMessage('Bildirim gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

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
          {profile?.is_premium && quiz.timer !== null && (
            <div className="font-mono text-xs bg-tusai-accent text-white px-3 py-1 rounded">
              {formatTime(quiz.timer * 60)}
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded mb-6 w-full">
          <div className="h-2 bg-tusai-accent rounded" style={{ width: `${progress}%` }}></div>
        </div>
        {/* Question Card */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Report Button - Available to all authenticated users */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => handleReportQuestion(quiz.questions[current].id)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors text-sm border border-gray-200 rounded-lg hover:border-red-300"
              title="Soruyu Bildir"
            >
              <FlagIcon className="w-4 h-4" />
              <span>Soruyu Bildir</span>
            </button>
          </div>
          
          <div className="font-bold text-lg text-tusai-dark break-words mb-4">
            {quiz.questions[current].text}
          </div>
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
      
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Bildiriminiz başarıyla kaydedildi. Teşekkürler!</span>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
      
      {/* Report Question Modal */}
      {isReportQuestionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Soru Bildirimi</h3>
              <button
                onClick={() => setIsReportQuestionOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Soru {reportQuestionId} ile ilgili bildiriminizi aşağıya yazabilirsiniz.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bildirim Mesajı:
              </label>
              <textarea
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                placeholder={`Soru ${reportQuestionId} ile ilgili sorununuzu buraya yazın...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tusai-accent focus:border-transparent"
                rows={4}
                disabled={isSubmittingReport}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsReportQuestionOpen(false)}
                disabled={isSubmittingReport}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!reportMessage.trim() || isSubmittingReport}
                className="px-4 py-2 bg-tusai-accent text-white rounded-md hover:bg-tusai disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingReport ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 