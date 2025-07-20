"use client";
import { useAuth } from '../../lib/AuthContext';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function DashboardClient() {
  const { user, profile } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = {
    totalQuizzes: 24,
    correctAnswers: 156,
    totalQuestions: 240,
    averageScore: 65,
    streakDays: 7,
    timeSpent: '12h 30m'
  };

  const recentQuizzes = [
    { id: 1, title: 'Anatomi Quiz #12', score: 85, date: '2024-01-20', questions: 20 },
    { id: 2, title: 'Fizyoloji Quiz #8', score: 72, date: '2024-01-19', questions: 15 },
    { id: 3, title: 'Biokimya Quiz #5', score: 68, date: '2024-01-18', questions: 18 },
  ];

  const weakAreas = [
    { subject: 'Kardiyoloji', accuracy: 45, questions: 12 },
    { subject: 'Nöroloji', accuracy: 52, questions: 8 },
    { subject: 'Endokrinoloji', accuracy: 58, questions: 15 },
  ];

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
            {recentQuizzes.map((quiz) => (
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
            ))}
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
            {weakAreas.map((area, index) => (
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
            ))}
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