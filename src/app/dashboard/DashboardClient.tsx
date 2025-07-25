"use client";
import { useAuth } from '../../lib/AuthContext';
import { quizzesApi, Quiz } from '../../lib/api';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function DashboardClient() {
  const { user, profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadQuizzes();
    }
  }, [user]);

  const loadQuizzes = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await quizzesApi.getQuizzes({ limit: 10 });
      if (response.data) {
        setQuizzes(response.data);
      } else {
        console.error('Failed to load quizzes:', response.error);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from real data
  const stats = {
    totalQuizzes: quizzes.length,
    correctAnswers: quizzes.reduce((sum, q) => sum + (q.correct_count || 0), 0),
    totalQuestions: quizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0),
    averageScore: quizzes.length ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length) : 0,
    streakDays: 7, // This would need a separate calculation
    timeSpent: '12h 30m' // This would need a separate calculation
  };

  // Get recent quizzes (last 3)
  const recentQuizzes = quizzes.slice(0, 3).map(quiz => ({
    id: quiz.id,
    title: `${quiz.subjects?.[0] || 'Quiz'} #${quiz.id.slice(-4)}`,
    score: quiz.score || 0,
    date: new Date(quiz.created_at).toLocaleDateString('tr-TR'),
    questions: quiz.total_questions || 0
  }));

  // Calculate weak areas based on quiz data
  const weakAreas = useMemo(() => {
    const subjectStats: Record<string, { total: number; correct: number; count: number }> = {};
    
    quizzes.forEach(quiz => {
      quiz.subjects?.forEach(subject => {
        if (!subjectStats[subject]) {
          subjectStats[subject] = { total: 0, correct: 0, count: 0 };
        }
        subjectStats[subject].total += quiz.total_questions || 0;
        subjectStats[subject].correct += quiz.correct_count || 0;
        subjectStats[subject].count += 1;
      });
    });

    return Object.entries(subjectStats)
      .map(([subject, stats]) => ({
        subject,
        accuracy: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0,
        questions: stats.total
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);
  }, [quizzes]);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tusai-dark dark:text-tusai-light mb-2">
          Hoş geldin, {profile?.full_name || user?.email}!
        </h1>
        <p className="text-tusai-dark/60 dark:text-tusai-light/60">
          TUS hazırlık yolculuğunda nasıl gidiyorsun? İşte senin performans özetin.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/quiz/new"
            className="flex-1 bg-tusai-blue text-white font-semibold px-6 py-4 rounded-lg shadow hover:bg-tusai-teal transition flex items-center justify-center gap-3"
          >
            <DocumentTextIcon className="w-6 h-6" />
            Yeni Quiz Oluştur
          </Link>
          <Link 
            href="/quiz/history"
            className="flex-1 bg-white border border-tusai-blue text-tusai-blue font-semibold px-6 py-4 rounded-lg shadow hover:bg-tusai-light transition flex items-center justify-center gap-3"
          >
            <ClockIcon className="w-6 h-6" />
            Geçmiş Quizler
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow p-6 border border-tusai-light dark:border-tusai-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">Toplam Quiz</p>
              <p className="text-2xl font-bold text-tusai-dark dark:text-tusai-light">{stats.totalQuizzes}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-tusai-blue" />
          </div>
        </div>

        <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow p-6 border border-tusai-light dark:border-tusai-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">Doğru Cevap</p>
              <p className="text-2xl font-bold text-tusai-dark dark:text-tusai-light">{stats.correctAnswers}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-tusai-teal" />
          </div>
        </div>

        <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow p-6 border border-tusai-light dark:border-tusai-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">Ortalama Skor</p>
              <p className="text-2xl font-bold text-tusai-dark dark:text-tusai-light">%{stats.averageScore}</p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-tusai-purple" />
          </div>
        </div>

        <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow p-6 border border-tusai-light dark:border-tusai-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">Günlük Seri</p>
              <p className="text-2xl font-bold text-tusai-dark dark:text-tusai-light">{stats.streakDays} gün</p>
            </div>
            <ClockIcon className="w-8 h-8 text-tusai-accent" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Quizzes */}
        <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow border border-tusai-light dark:border-tusai-dark">
          <div className="p-6 border-b border-tusai-light dark:border-tusai-dark">
            <h2 className="text-xl font-semibold text-tusai-dark dark:text-tusai-light">Son Quizler</h2>
          </div>
          <div className="p-6">
            {recentQuizzes.length > 0 ? (
              recentQuizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between py-3 border-b border-tusai-light dark:border-tusai-dark last:border-b-0">
                  <div>
                    <p className="font-medium text-tusai-dark dark:text-tusai-light">{quiz.title}</p>
                    <p className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">
                      {quiz.date} • {quiz.questions} soru
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-tusai-dark dark:text-tusai-light">%{quiz.score}</p>
                    <p className="text-xs text-tusai-dark/60 dark:text-tusai-light/60">Skor</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Henüz quiz çözülmemiş
              </div>
            )}
            <Link 
              href="/quiz/history"
              className="mt-4 text-tusai-blue hover:text-tusai-teal text-sm font-medium"
            >
              Tüm quizleri gör →
            </Link>
          </div>
        </div>

        {/* Weak Areas */}
        <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow border border-tusai-light dark:border-tusai-dark">
          <div className="p-6 border-b border-tusai-light dark:border-tusai-dark">
            <h2 className="text-xl font-semibold text-tusai-dark dark:text-tusai-light">Geliştirilmesi Gereken Alanlar</h2>
          </div>
          <div className="p-6">
            {weakAreas.length > 0 ? (
              weakAreas.map((area, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-tusai-light dark:border-tusai-dark last:border-b-0">
                  <div>
                    <p className="font-medium text-tusai-dark dark:text-tusai-light">{area.subject}</p>
                    <p className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">
                      {area.questions} soru çözüldü
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-tusai-error">%{area.accuracy}</p>
                    <p className="text-xs text-tusai-dark/60 dark:text-tusai-light/60">Doğruluk</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Henüz yeterli veri yok
              </div>
            )}
            <Link 
              href="/analysis"
              className="mt-4 text-tusai-blue hover:text-tusai-teal text-sm font-medium"
            >
              Detaylı analiz gör →
            </Link>
          </div>
        </div>
      </div>

      {/* Premium Features Promo */}
      {!profile?.is_premium && (
        <div className="mt-8 bg-gradient-to-r from-tusai-purple to-tusai-blue rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Premium&apos;a Geç</h3>
              <p className="text-white/80 mb-4">
                Detaylı analizler, geçmiş quizler ve kişiselleştirilmiş öneriler için Premium üyeliğe geçin.
              </p>
              <Link 
                href="/pricing"
                className="bg-white text-tusai-purple font-semibold px-6 py-2 rounded hover:bg-tusai-light transition"
              >
                Premium&apos;a Geç
              </Link>
            </div>
            <div className="hidden sm:block">
              <ChartBarIcon className="w-16 h-16 text-white/20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 