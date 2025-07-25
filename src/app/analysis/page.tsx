"use client";
import { useAuth } from "../../lib/AuthContext";
import { getQuizHistory, QuizResult } from "../../lib/quizHistory";
import { useEffect, useMemo, useState } from "react";
import FeatureGate from "../../lib/FeatureGate";
import Link from "next/link";
import BackButton from '../../components/BackButton';

const SUBJECTS = [
  "Fizyoloji",
  "Biyokimya",
  "Mikrobiyoloji",
  "Farmakoloji",
  "Patoloji",
  // Add more as needed
];

export default function AnalysisPage() {
  const { user, authState } = useAuth();
  const [history, setHistory] = useState<QuizResult[]>([]);

  useEffect(() => {
    if (user?.id) {
      setHistory(getQuizHistory(user.id));
    }
  }, [user]);

  if (authState === "loading") return (
    <div className="w-full flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <div className="p-8 text-center">Giriş yapmalısınız.</div>;

  // Stats
  const totalQuizzes = history.length;
  const avgScore = totalQuizzes ? Math.round(history.reduce((sum, q) => sum + q.score, 0) / totalQuizzes) : 0;
  const subjectStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number; mistakes: number }> = {};
    history.forEach(q => {
      q.questions.forEach((qq, idx) => {
        SUBJECTS.forEach(subject => {
          if (qq.soru.includes(subject)) {
            if (!stats[subject]) stats[subject] = { count: 0, total: 0, mistakes: 0 };
            stats[subject].count += 1;
            if (q.answers[idx] === qq.dogru) stats[subject].total += 1;
            else stats[subject].mistakes += 1;
          }
        });
      });
    });
    return stats;
  }, [history]);

  const bestSubject = Object.entries(subjectStats).sort((a, b) => b[1].total - a[1].total)[0]?.[0] || "-";
  const worstSubject = Object.entries(subjectStats).sort((a, b) => a[1].mistakes - b[1].mistakes)[0]?.[0] || "-";

  // Wrong answer analysis
  const wrongAnswers = useMemo(() => {
    const mistakes: Record<string, number> = {};
    history.forEach(q => {
      q.questions.forEach((qq, idx) => {
        if (q.answers[idx] !== qq.dogru) {
          const key = qq.soru;
          mistakes[key] = (mistakes[key] || 0) + 1;
        }
      });
    });
    return Object.entries(mistakes).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [history]);

  // Mock leaderboard data for general analysis
  const mockLeaderboard = Array.from({ length: 20 }, (_, i) => ({
    rank: i + 1,
    displayName: `anon_${2000 + i * 3}`,
    questionsSolved: 120 - i * 3,
    correctAnswers: 110 - i * 3,
    accuracy: 95 - i,
  }));
  const leaderboardAvgScore = Math.round(mockLeaderboard.reduce((sum, row) => sum + row.correctAnswers, 0) / mockLeaderboard.length);
  const leaderboardAvgAccuracy = Math.round(mockLeaderboard.reduce((sum, row) => sum + row.accuracy, 0) / mockLeaderboard.length);
  const leaderboardTopSubject = "Farmakoloji";

  console.log('AnalysisPage', { user, authState, history });

  return (
    <FeatureGate premium>
      <BackButton className="mb-4" />
      <div className="w-full max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-tusai mb-2">Kişisel Analiz</h1>
        {/* Genel Analiz Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h2 className="font-semibold text-blue-700 mb-2">Genel Analiz</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li className="text-blue-900">Senin ortalama skorun: <b>{avgScore}</b> | Liderlerin ortalaması: <b>{leaderboardAvgScore}</b></li>
            <li className="text-blue-900">Senin ortalama doğruluk oranın: <b>{Object.entries(subjectStats).length ? Math.round((Object.values(subjectStats).reduce((sum, s) => sum + (s.count ? (s.total / s.count) * 100 : 0), 0) / Object.values(subjectStats).length)) : 0}%</b> | Liderlerin ortalaması: <b>{leaderboardAvgAccuracy}%</b></li>
            <li className="text-blue-900">En iyi olduğun konu: <b>{bestSubject}</b> | Liderlerin en iyi olduğu konu: <b>{leaderboardTopSubject}</b></li>
            <li className="text-blue-900">Odaklanman gereken konu: <b>{worstSubject}</b> (daha fazla pratik yap!)</li>
            <li className="text-blue-900">Tavsiyemiz: {avgScore < leaderboardAvgScore ? "Skorunu artırmak için daha fazla quiz çöz ve yanlış yaptığın konulara odaklan." : "Harika gidiyorsun! Liderlerle arandaki farkı kapatmak için bu tempoyu koru."}</li>
          </ul>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow border p-4 flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{totalQuizzes}</div>
            <div className="text-gray-700 text-sm">Toplam Quiz</div>
          </div>
          <div className="bg-white rounded-xl shadow border p-4 flex flex-col items-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">{avgScore}</div>
            <div className="text-gray-700 text-sm">Ortalama Skor</div>
          </div>
          <div className="bg-white rounded-xl shadow border p-4 flex flex-col items-center">
            <div className="text-lg font-bold text-green-600 mb-1">En İyi: {bestSubject}</div>
            <div className="text-lg font-bold text-red-600 mb-1">En Zayıf: {worstSubject}</div>
          </div>
        </div>
        {/* Subject Table */}
        <div className="bg-white rounded-xl shadow border p-4 overflow-x-auto">
          <h2 className="font-semibold text-blue-600 mb-2">Konu Bazlı Performans</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-700 border-b">
                <th className="py-2 px-2 text-left">Konu</th>
                <th className="py-2 px-2 text-left">Doğru</th>
                <th className="py-2 px-2 text-left">Yanlış</th>
                <th className="py-2 px-2 text-left">Toplam</th>
                <th className="py-2 px-2 text-left">Başarı (%)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(subjectStats).length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Kayıt bulunamadı.</td></tr>
              ) : (
                Object.entries(subjectStats).map(([subject, stat]) => (
                  <tr key={subject} className="border-b last:border-0">
                    <td className="py-2 px-2 font-semibold">{subject}</td>
                    <td className="py-2 px-2">{stat.total}</td>
                    <td className="py-2 px-2">{stat.mistakes}</td>
                    <td className="py-2 px-2">{stat.count}</td>
                    <td className="py-2 px-2">{stat.count ? Math.round((stat.total / stat.count) * 100) : 0}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Wrong Answer Analysis */}
        <div className="bg-white rounded-xl shadow border p-4">
          <h2 className="font-semibold text-red-600 mb-2">Yanlış Cevap Analizi</h2>
          {wrongAnswers.length === 0 ? (
            <div className="text-gray-400">Yeterli veri yok.</div>
          ) : (
            <ul className="list-disc pl-6 space-y-1">
              {wrongAnswers.map(([question, count], i) => (
                <li key={i} className="text-red-700">{question} <span className="text-xs text-gray-500">({count} kez yanlış)</span></li>
              ))}
            </ul>
          )}
          <div className="mt-4 text-xs text-gray-500">En çok yanlış yapılan sorulara odaklanarak tekrar çözmeni öneririz.</div>
        </div>
      </div>
    </FeatureGate>
  );
} 