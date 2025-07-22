"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import FeatureGate from "../../lib/FeatureGate";
import { AcademicCapIcon, CheckCircleIcon, FireIcon, ArrowPathIcon, StarIcon, DocumentTextIcon, BookmarkIcon, SparklesIcon } from '@heroicons/react/24/solid';

// Dummy data for demonstration
const dummyPerformance = {
  totalQuizzes: 24,
  avgScore: 78,
  streak: 5,
  accuracyBySubject: [
    { subject: "Fizyoloji", accuracy: 65 },
    { subject: "Biyokimya", accuracy: 80 },
    { subject: "Mikrobiyoloji", accuracy: 72 },
    { subject: "Farmakoloji", accuracy: 90 },
    { subject: "Patoloji", accuracy: 60 },
  ],
  weakest: ["Patoloji", "Fizyoloji", "Mikrobiyoloji"],
  strongest: ["Farmakoloji", "Biyokimya", "Histoloji"],
  aiTip: "Bu hafta Fizyoloji'ye odaklanmayı deneyin."
};

const dummyHistory = [
  { id: 1, date: "2024-07-20", subject: "Fizyoloji", score: 60, type: "AI", mistakes: 4 },
  { id: 2, date: "2024-07-18", subject: "Biyokimya", score: 85, type: "Çıkmış", mistakes: 1 },
  { id: 3, date: "2024-07-15", subject: "Patoloji", score: 55, type: "Karma", mistakes: 5 },
];

const dummyNotes = [
  { id: 1, type: "note", title: "Asit-Baz Dengesi", content: "pH değişimleri ve kompansasyon mekanizmaları...", pinned: true, tags: ["Fizyoloji"] },
  { id: 2, type: "ai", title: "Histoloji: Epitel Tipleri", content: "AI: Basit yassı epitelin görevleri...", pinned: false, tags: ["Histoloji"] },
];

const leaderboardPreview = {
  subject: "Farmakoloji",
  totalUsers: 4800,
  rank: 113,
  insight: "Farmakoloji'de 4800 kullanıcı arasında 113. sıradasın!"
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [notesTab, setNotesTab] = useState<'note' | 'ai'>('note');

  // TODO: Replace with real daily limit logic
  const quizLimit = profile?.is_premium ? 5 : 1;
  const quizCountToday = 0; // TODO: fetch from Supabase


  // Check for ongoing quiz (dummy logic - replace with real data)
  const hasOngoingQuiz = false; // TODO: Check from Supabase
  const ongoingQuizId = "abc123"; // TODO: Get from Supabase

  const handleKarmaQuiz = () => {
    // Redirect to quiz creation with Karma mode pre-selected
    router.push("/quiz/new?mode=karma");
  };

  const handleWeakSubjectsQuiz = () => {
    // Redirect to quiz creation with Zayıf Konular mode pre-selected
    router.push("/quiz/new?mode=zayif");
  };

  const handleContinueLastQuiz = () => {
    if (hasOngoingQuiz) {
      // Continue the ongoing quiz
      router.push(`/quiz/${ongoingQuizId}`);
    } else {
      // No ongoing quiz, create a new "Çıkmış Sorular" quiz
      router.push("/quiz/new?mode=cikmis");
    }
  };

  const handleAISuggestionQuiz = () => {
    // Create quiz based on AI suggestion (Fizyoloji focus)
    router.push("/quiz/new?mode=karma&subjects=Fizyoloji");
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-6 flex flex-col gap-8">
      {/* Header / Welcome - Polished */}
      <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left Side - Greeting and Progress */}
          <div className="flex-1 space-y-4">
            {/* Greeting */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                Merhaba, {profile?.full_name || 'TusAI Kullanıcısı'} 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Pratik yapmak mükemmelleştirir. Bugün neye odaklanmak istersin?
              </p>
            </div>

            {/* Daily Progress Section */}
            <div className="space-y-3">
              {/* Progress Bar and Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2"
                      aria-label={`${quizCountToday} out of ${quizLimit} quizzes completed today`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-blue-600">{quizCountToday}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{quizLimit}</span>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                        {profile?.is_premium ? "quiz" : "hakkı"}
                      </span>
                    </div>
                    
                    {/* Streak Badge with Animation */}
                    {profile?.is_premium && dummyPerformance.streak >= 3 && (
                      <div 
                        className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-full px-3 py-1 animate-pulse"
                        aria-label={`${dummyPerformance.streak} day quiz streak`}
                      >
                        <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                          🔥 {dummyPerformance.streak} günlük seri!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(quizCountToday / quizLimit) * 100}%` }}
                    aria-label={`${Math.round((quizCountToday / quizLimit) * 100)}% of daily quiz limit completed`}
                  />
                </div>
              </div>

              {/* Progress Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {profile?.is_premium ? (
                    `Bugün ${quizCountToday} quiz çözdün, ${quizLimit - quizCountToday} tane daha çözebilirsin!`
                  ) : (
                    quizCountToday === 0 ? (
                      "Bugün henüz quiz çözmedin, 1 quiz hakkın var!"
                    ) : (
                      "Bugün quiz hakkını kullandın. Premium'a geçerek günde 5 quiz çözebilirsin!"
                    )
                  )}
                </span>
                
                {/* Warning and CTA */}
                <div className="flex items-center gap-2">
                  {profile?.is_premium && quizCountToday >= 4 && (
                    <span 
                      className="text-xs text-orange-600 dark:text-orange-400 font-medium"
                      aria-label="Warning: Last quiz attempt remaining"
                    >
                      ⚠️ Son hakkınız!
                    </span>
                  )}
                  
                  {!profile?.is_premium && quizCountToday >= 1 && (
                    <span 
                      className="text-xs text-red-600 dark:text-red-400 font-medium"
                      aria-label="Daily quiz limit reached"
                    >
                      ⚠️ Hakkınız bitti
                    </span>
                  )}
                  
                  {!profile?.is_premium && (
                    <Link 
                      href="/pricing" 
                      className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      aria-label="Upgrade to premium for more daily quizzes"
                    >
                      Premium&apos;a Geç
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Primary CTA */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <Link 
              href="/quiz/new" 
              className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-lg shadow-md text-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto"
              aria-label="Create a new quiz"
            >
              <AcademicCapIcon className="w-6 h-6" /> 
              <span>Yeni Quiz Oluştur</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Start Options */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button 
          onClick={handleKarmaQuiz}
          className="flex flex-col items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-4 font-medium text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition group"
        >
          <ArrowPathIcon className="w-6 h-6" />
          <span className="font-semibold">Karma Quiz</span>
          <span className="text-xs text-center text-blue-600/70 dark:text-blue-300/70">
            Yapay Zeka tarafından oluşturulan sorular ile çıkmış soruların karışımı
          </span>
        </button>
        <button 
          onClick={handleWeakSubjectsQuiz}
          className="flex flex-col items-center gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg px-4 py-4 font-medium text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900 transition group"
        >
          <FireIcon className="w-6 h-6" />
          <span className="font-semibold">Zayıf Konulardan Quiz</span>
          <span className="text-xs text-center text-purple-600/70 dark:text-purple-300/70">
            En çok hata yaptığın konulardan özel olarak hazırlanmış sorular
          </span>
        </button>
        <button 
          onClick={handleContinueLastQuiz}
          className="flex flex-col items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg px-4 py-4 font-medium text-green-700 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900 transition group"
        >
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-semibold">
            {hasOngoingQuiz ? "Son Quiz'e Devam Et" : "Çıkmış Sorulardan Quiz"}
          </span>
          <span className="text-xs text-center text-green-600/70 dark:text-green-300/70">
            {hasOngoingQuiz 
              ? "Yarım kalan quizini tamamla" 
              : "Geçmiş sınavlardan çıkan sorularla pratik yap"
            }
          </span>
        </button>
      </section>

      {/* Performance Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{dummyPerformance.totalQuizzes}</div>
          <div className="text-gray-700 dark:text-gray-300 text-sm">Toplam Quiz</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">{dummyPerformance.avgScore}%</div>
          <div className="text-gray-700 dark:text-gray-300 text-sm">Ortalama Skor</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-green-600 mb-1">{dummyPerformance.streak} gün</div>
          <div className="text-gray-700 dark:text-gray-300 text-sm">Günlük Quiz Serisi</div>
        </div>
      </section>
      {/* Chart Placeholder */}
      <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-2 text-blue-600">Konu Bazlı Doğruluk (Son 10 Quiz)</h2>
        <div className="flex flex-col gap-2">
          {dummyPerformance.accuracyBySubject.map((s) => (
            <div key={s.subject} className="flex items-center gap-2">
              <span className="w-28 text-gray-700 dark:text-gray-300 text-sm">{s.subject}</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded h-3 overflow-hidden">
                <div className="bg-blue-500 h-3 rounded" style={{ width: `${s.accuracy}%` }}></div>
              </div>
              <span className="w-10 text-right text-gray-700 dark:text-gray-300 text-sm">{s.accuracy}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Weakness & Strength Insights */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2"><FireIcon className="w-5 h-5" /> Zayıf Konular</h3>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 mb-2">
            {dummyPerformance.weakest.map((w) => (
              <li key={w} className="flex items-center gap-2">
                <span>{w}</span>
                <Link href={`/analysis/wrong-answers?subject=${encodeURIComponent(w)}`} className="ml-auto text-xs underline text-blue-600">Hataları İncele</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2"><StarIcon className="w-5 h-5" /> Güçlü Konular</h3>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 mb-2">
            {dummyPerformance.strongest.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Improved AI Study Tip Block */}
      <FeatureGate premium>
        <section className="flex flex-col items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 shadow-sm mb-2">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-6 h-6 text-blue-500" />
            <span className="font-semibold text-blue-700 dark:text-blue-200 text-base">🤖 AI Tavsiyesi</span>
          </div>
          <span className="text-gray-700 dark:text-gray-300 text-center text-lg font-medium">{dummyPerformance.aiTip}</span>
          <button 
            onClick={handleAISuggestionQuiz}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow text-sm font-semibold transition-all"
          >
            Tavsiyeye Göre Quiz Oluştur
          </button>
        </section>
      </FeatureGate>

      {/* Quiz History Section */}
      <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold text-blue-600">Quiz Geçmişi</h2>
          <div className="flex gap-2 flex-wrap">
            <select className="border rounded px-2 py-1 text-sm">
              <option>Konu</option>
              <option>Fizyoloji</option>
              <option>Biyokimya</option>
            </select>
            <select className="border rounded px-2 py-1 text-sm">
              <option>Tarih</option>
              <option>Son 7 gün</option>
              <option>Son 30 gün</option>
            </select>
            <select className="border rounded px-2 py-1 text-sm">
              <option>Quiz Tipi</option>
              <option>AI</option>
              <option>Çıkmış</option>
              <option>Karma</option>
            </select>
            <select className="border rounded px-2 py-1 text-sm">
              <option>Sırala</option>
              <option>En Yeni</option>
              <option>En Düşük Skor</option>
              <option>En Çok Hata</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-700 dark:text-gray-300 border-b">
                <th className="py-2 px-2 text-left">Tarih</th>
                <th className="py-2 px-2 text-left">Konu</th>
                <th className="py-2 px-2 text-left">Skor</th>
                <th className="py-2 px-2 text-left">Tip</th>
                <th className="py-2 px-2 text-left">Hata</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {dummyHistory.map((q) => (
                <tr key={q.id} className="border-b last:border-0">
                  <td className="py-2 px-2">{q.date}</td>
                  <td className="py-2 px-2">{q.subject}</td>
                  <td className="py-2 px-2">{q.score}</td>
                  <td className="py-2 px-2">{q.type}</td>
                  <td className="py-2 px-2">{q.mistakes}</td>
                  <td className="py-2 px-2 flex gap-2">
                    <Link href={`/quiz/${q.id}/review`} className="text-blue-600 underline text-xs">İncele</Link>
                    <Link href={`/quiz/${q.id}/retake`} className="text-purple-600 underline text-xs">Tekrarla</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Saved Notes / Explanations */}
      <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-t font-semibold border-b-2 ${notesTab === 'note' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 dark:text-gray-300'}`}
            onClick={() => setNotesTab('note')}
          >
            <BookmarkIcon className="w-4 h-4 inline mr-1" /> Notlarım
          </button>
          <button
            className={`px-4 py-2 rounded-t font-semibold border-b-2 ${notesTab === 'ai' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 dark:text-gray-300'}`}
            onClick={() => setNotesTab('ai')}
          >
            <DocumentTextIcon className="w-4 h-4 inline mr-1" /> AI Açıklamaları
          </button>
        </div>
        <div>
          {dummyNotes.filter(n => n.type === notesTab).length === 0 && (
            <div className="text-gray-500 text-sm">Henüz kayıtlı {notesTab === 'note' ? 'notunuz' : 'AI açıklamanız'} yok.</div>
          )}
          {dummyNotes.filter(n => n.type === notesTab).map((note) => (
            <div key={note.id} className="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">{note.title}</span>
                {/* Pin icon can be added here if needed */}
                {note.tags.map(tag => (
                  <span key={tag} className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded">{tag}</span>
                ))}
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm mb-2">{note.content}</div>
              <div className="flex gap-2">
                <button className="text-xs text-blue-600 underline">Düzenle</button>
                <button className="text-xs text-red-600 underline">Sil</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard Preview Section */}
      <section className="flex flex-col items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 shadow-sm mt-2 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <StarIcon className="w-6 h-6 text-yellow-500" />
          <span className="font-semibold text-yellow-800 dark:text-yellow-200 text-base">Sıralaman</span>
        </div>
        <span className="text-gray-800 dark:text-yellow-100 text-center text-lg font-medium">{leaderboardPreview.insight}</span>
        <Link href="/leaderboard" className="mt-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow text-sm font-semibold">Tüm Sıralamayı Gör →</Link>
      </section>
    </div>
  );
} 