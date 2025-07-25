"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import FeatureGate from "../../lib/FeatureGate";
import { AcademicCapIcon, CheckCircleIcon, FireIcon, ArrowPathIcon, StarIcon, DocumentTextIcon, BookmarkIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { supabase } from "../../lib/supabaseClient";

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
  const { profile, authState } = useAuth();
  const router = useRouter();
  const [notesTab, setNotesTab] = useState<'note' | 'ai'>('note');
  const [notes, setNotes] = useState<any[]>([]);
  const [aiExplanations, setAiExplanations] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingExplanations, setLoadingExplanations] = useState(false);
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    avgScore: 0,
    streak: 0,
    accuracyBySubject: [] as any[],
    weakest: [] as string[],
    strongest: [] as string[]
  });
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [loadingQuizData, setLoadingQuizData] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState({
    subject: 'Farmakoloji',
    totalUsers: 0,
    userRank: null,
    userScore: null,
    insight: ''
  });
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Debug auth state changes
  useEffect(() => {
    console.log('Dashboard: AuthState changed to:', authState);
  }, [authState]);

  // Fetch real data when authenticated
  useEffect(() => {
    if (authState === 'authenticated' && profile?.id) {
      fetchNotes();
      fetchAiExplanations();
      fetchQuizData();
      fetchLeaderboardData();
    }
  }, [authState, profile?.id]);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const notesData = await response.json();
        setNotes(notesData.slice(0, 3)); // Show only first 3 notes
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchAiExplanations = async () => {
    setLoadingExplanations(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const { data: explanations, error } = await supabase
        .from('ai_explanations')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && explanations) {
        setAiExplanations(explanations);
      }
    } catch (error) {
      console.error('Error fetching AI explanations:', error);
    } finally {
      setLoadingExplanations(false);
    }
  };

  const fetchQuizData = async () => {
    setLoadingQuizData(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // Fetch all quizzes for the user
      const response = await fetch('/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const { quizzes } = await response.json();
        
        if (quizzes && quizzes.length > 0) {
          // Calculate statistics
          const totalQuizzes = quizzes.length;
          const completedQuizzes = quizzes.filter((q: any) => q.score !== null);
          const avgScore = completedQuizzes.length > 0 
            ? Math.round(completedQuizzes.reduce((sum: number, q: any) => sum + q.score, 0) / completedQuizzes.length)
            : 0;

          // Calculate subject accuracy (simplified for now)
          const subjectStats: { [key: string]: number[] } = {};
          completedQuizzes.forEach((quiz: any) => {
            if (quiz.subjects && quiz.subjects.length > 0) {
              quiz.subjects.forEach((subject: string) => {
                if (!subjectStats[subject]) subjectStats[subject] = [];
                subjectStats[subject].push(quiz.score);
              });
            }
          });

          const accuracyBySubject = Object.entries(subjectStats).map(([subject, scores]) => ({
            subject,
            accuracy: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          })).sort((a, b) => b.accuracy - a.accuracy);

          // Get weakest and strongest subjects
          const weakest = accuracyBySubject.slice(-3).map(s => s.subject);
          const strongest = accuracyBySubject.slice(0, 3).map(s => s.subject);

          // Calculate streak (simplified - consecutive days with quizzes)
          let streak = 0;
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          const recentQuizzes = quizzes.filter((q: any) => {
            const quizDate = new Date(q.created_at);
            return quizDate >= yesterday;
          });
          
          if (recentQuizzes.length > 0) {
            streak = 1; // Simplified streak calculation
          }

          setQuizStats({
            totalQuizzes,
            avgScore,
            streak,
            accuracyBySubject,
            weakest,
            strongest
          });

          // Set quiz history (last 3 quizzes)
          setQuizHistory(quizzes.slice(0, 3).map((quiz: any) => ({
            id: quiz.id,
            date: new Date(quiz.created_at).toLocaleDateString('tr-TR'),
            subject: quiz.subjects?.[0] || 'Genel',
            score: quiz.score || 'Devam ediyor',
            type: quiz.mode,
            mistakes: quiz.mistake_count || 0
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoadingQuizData(false);
    }
  };

  const fetchLeaderboardData = async () => {
    setLoadingLeaderboard(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // Get the user's best performing subject for leaderboard
      const bestSubject = quizStats.strongest[0] || 'Farmakoloji';
      
      const response = await fetch(`/api/leaderboard?subject=${encodeURIComponent(bestSubject)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // TODO: Replace with real daily limit logic
  const quizLimit = profile?.is_premium ? 5 : 1;
  const quizCountToday = 0; // TODO: fetch from Supabase

  // Temporary debugging - remove this later
  console.log('Dashboard Debug:', {
    profile: profile,
    isPremium: profile?.is_premium,
    fullName: profile?.full_name,
    authState: authState,
    hasProfile: !!profile
  });

  // Check if we should show the full dashboard or just basic content
  const shouldShowFullDashboard = authState === 'authenticated' && profile;
  const isLoading = authState === 'loading';

  // Debug logging
  console.log('Dashboard State Debug:', {
    authState,
    hasProfile: !!profile,
    profileName: profile?.full_name,
    shouldShowFullDashboard,
    isLoading,
    isAuthenticated: authState === 'authenticated'
  });

  // Temporary test function - remove this later
  const testPremiumStatus = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', profile.id)
        .single();
      
      console.log('Database premium status:', data, error);
      
      if (data && !data.is_premium) {
        // Temporarily set to premium for testing
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', profile.id)
          .select();
        
        console.log('Updated premium status:', updateData, updateError);
        // Force reload
        window.location.reload();
      }
    } catch (error) {
      console.error('Error testing premium status:', error);
    }
  };

  const handleKarmaQuiz = () => {
    // Redirect to quiz creation with Karma mode pre-selected
    router.push("/quiz/new?mode=karma");
  };

  const handleWeakSubjectsQuiz = () => {
    // Redirect to quiz creation with Zayıf Konular mode pre-selected
    router.push("/quiz/new?mode=zayif");
  };

  const handleContinueLastQuiz = () => {
    // No ongoing quiz, create a new "Çıkmış Sorular" quiz
    router.push("/quiz/new?mode=cikmis");
  };

  const handleAISuggestionQuiz = () => {
    // Extract subject from aiTip (e.g., "Bu hafta Fizyoloji'ye odaklanmayı deneyin.")
    const aiTip = dummyPerformance.aiTip;
    // Match the first word ending with 'ye' or 'ya' or 'ya' (e.g., Fizyoloji'ye)
    const match = aiTip.match(/([A-Za-zÇĞİÖŞÜçğıöşü]+)'[yya]e/);
    const subject = match ? match[1] : "Fizyoloji";
    router.push(`/quiz/new?mode=karma&subjects=${encodeURIComponent(subject)}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-6 flex flex-col gap-8">
      {/* Show loading state if still loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Dashboard yükleniyor...</p>
        </div>
      )}

      {/* Show dashboard content only when not loading and authenticated */}
      {!isLoading && authState === 'authenticated' && (
        <>
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
                        className="bg-blue-500 h-2 rounded transition-all duration-300" 
                        style={{ width: `${(quizCountToday / quizLimit) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Status Messages */}
                    <div className="flex flex-col gap-1">
                      {quizCountToday === 0 && (
                        <span 
                          className="text-sm text-green-600 dark:text-green-400 font-medium"
                          aria-label="No quizzes completed today"
                        >
                          ✅ Bugün henüz quiz çözmedin, {quizLimit} quiz hakkın var!
                        </span>
                      )}
                      
                      {profile?.is_premium && quizCountToday >= 4 && (
                        <span 
                          className="text-xs text-yellow-600 dark:text-yellow-400 font-medium"
                          aria-label="Almost at daily limit"
                        >
                          ⚠️ Son quiz hakkın kaldı
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
                {/* No ongoing quiz, create a new "Çıkmış Sorular" quiz */}
                "Çıkmış Sorulardan Quiz"
              </span>
              <span className="text-xs text-center text-green-600/70 dark:text-green-300/70">
                "Geçmiş sınavlardan çıkan sorularla pratik yap"
              </span>
            </button>
          </section>

          {/* Performance Summary */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
              {loadingQuizData ? (
                <div className="text-3xl font-bold text-blue-600 mb-1">...</div>
              ) : (
                <div className="text-3xl font-bold text-blue-600 mb-1">{quizStats.totalQuizzes}</div>
              )}
              <div className="text-gray-700 dark:text-gray-300 text-sm">Toplam Quiz</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
              {loadingQuizData ? (
                <div className="text-3xl font-bold text-purple-600 mb-1">...</div>
              ) : (
                <div className="text-3xl font-bold text-purple-600 mb-1">{quizStats.avgScore}%</div>
              )}
              <div className="text-gray-700 dark:text-gray-300 text-sm">Ortalama Skor</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
              {loadingQuizData ? (
                <div className="text-3xl font-bold text-green-600 mb-1">...</div>
              ) : (
                <div className="text-3xl font-bold text-green-600 mb-1">{quizStats.streak} gün</div>
              )}
              <div className="text-gray-700 dark:text-gray-300 text-sm">Günlük Quiz Serisi</div>
            </div>
          </section>

          {/* Subject-Based Accuracy */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Konu Bazlı Doğruluk (Son 10 Quiz)</h2>
            {loadingQuizData ? (
              <div className="text-gray-500 text-sm">Yükleniyor...</div>
            ) : quizStats.accuracyBySubject.length === 0 ? (
              <div className="text-gray-500 text-sm">Henüz quiz çözülmemiş.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {quizStats.accuracyBySubject.map((s) => (
                  <div key={s.subject} className="flex items-center gap-2">
                    <span className="w-28 text-gray-700 dark:text-gray-300 text-sm">{s.subject}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded transition-all duration-300" 
                        style={{ width: `${s.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right text-gray-700 dark:text-gray-300 text-sm">{s.accuracy}%</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Weak/Strong Subjects */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2"><FireIcon className="w-5 h-5" /> Zayıf Konular</h3>
              {loadingQuizData ? (
                <div className="text-gray-500 text-sm">Yükleniyor...</div>
              ) : quizStats.weakest.length === 0 ? (
                <div className="text-gray-500 text-sm">Henüz yeterli veri yok.</div>
              ) : (
                <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 mb-2">
                  {quizStats.weakest.map((w) => (
                    <li key={w} className="flex items-center gap-2">
                      <span>{w}</span>
                      <Link href={`/quiz/new?subject=${w}`} className="text-blue-600 underline text-xs">Hataları İncele</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2"><StarIcon className="w-5 h-5" /> Güçlü Konular</h3>
              {loadingQuizData ? (
                <div className="text-gray-500 text-sm">Yükleniyor...</div>
              ) : quizStats.strongest.length === 0 ? (
                <div className="text-gray-500 text-sm">Henüz yeterli veri yok.</div>
              ) : (
                <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 mb-2">
                  {quizStats.strongest.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Recent Quiz History */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Son Quizler</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-700 border-b">
                    <th className="py-2 px-2 text-left">Tarih</th>
                    <th className="py-2 px-2 text-left">Konu</th>
                    <th className="py-2 px-2 text-left">Skor</th>
                    <th className="py-2 px-2 text-left">Tip</th>
                    <th className="py-2 px-2 text-left">Hata</th>
                    <th className="py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {loadingQuizData ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500">Yükleniyor...</td>
                    </tr>
                  ) : quizHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500">Henüz quiz çözülmemiş.</td>
                    </tr>
                  ) : (
                    quizHistory.map((q) => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Saved Notes / Explanations */}
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex gap-2 mb-4 items-center justify-between">
              <div className="flex gap-2">
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
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                onClick={() => {
                  if (notesTab === 'note') {
                    window.location.href = '/notes';
                  } else {
                    window.location.href = '/ai-explanations';
                  }
                }}
              >
                Tümünü Gör <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div>
              {loadingNotes && notesTab === 'note' ? (
                <div className="text-gray-500 text-sm">Yükleniyor...</div>
              ) : loadingExplanations && notesTab === 'ai' ? (
                <div className="text-gray-500 text-sm">Yükleniyor...</div>
              ) : notesTab === 'note' && notes.length === 0 ? (
                <div className="text-gray-500 text-sm">Henüz kayıtlı notunuz yok.</div>
              ) : notesTab === 'ai' && aiExplanations.length === 0 ? (
                <div className="text-gray-500 text-sm">Henüz kayıtlı AI açıklamanız yok.</div>
              ) : (
                <>
                  {notesTab === 'note' && notes.map((note) => (
                    <div key={note.id} className="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/notes/${note.id}`} className="font-semibold text-gray-900 dark:text-white hover:underline">
                          {note.title}
                        </Link>
                        {note.subjects?.name && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded">{note.subjects.name}</span>
                        )}
                        {note.tags?.map((tag: string) => (
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
                  {notesTab === 'ai' && aiExplanations.map((explanation) => (
                    <div key={explanation.id} className="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/ai-explanations/${explanation.id}`} className="font-semibold text-gray-900 dark:text-white hover:underline">
                          {explanation.title}
                        </Link>
                        {explanation.subject && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded">{explanation.subject}</span>
                        )}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 text-sm mb-2">{explanation.content}</div>
                      <div className="flex gap-2">
                        <button className="text-xs text-blue-600 underline">Düzenle</button>
                        <button className="text-xs text-red-600 underline">Sil</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>

          {/* Leaderboard Preview Section */}
          <section className="flex flex-col items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 shadow-sm mt-2 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <StarIcon className="w-6 h-6 text-yellow-500" />
              <span className="font-semibold text-yellow-800 dark:text-yellow-200 text-base">Sıralaman</span>
            </div>
            {loadingLeaderboard ? (
              <span className="text-gray-800 dark:text-yellow-100 text-center text-lg font-medium">Yükleniyor...</span>
            ) : leaderboardData.userRank ? (
              <span className="text-gray-800 dark:text-yellow-100 text-center text-lg font-medium">{leaderboardData.insight}</span>
            ) : (
              <span className="text-gray-800 dark:text-yellow-100 text-center text-lg font-medium">Henüz quiz çözülmemiş.</span>
            )}
            <Link href="/leaderboard" className="mt-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow text-sm font-semibold">Tüm Sıralamayı Gör →</Link>
          </section>
        </>
      )}
    </div>
  );
} 