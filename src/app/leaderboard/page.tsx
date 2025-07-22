"use client";
import React, { useState, useRef } from "react";
import { useAuth } from "../../lib/AuthContext";
import { UserCircleIcon, ArrowTrendingUpIcon, TrophyIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';
import Link from "next/link";

const SUBJECTS = ["Farmakoloji", "Mikrobiyoloji", "Fizyoloji", "Biyokimya", "Patoloji"];

// Mock leaderboard data
const mockLeaderboard = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  displayName: `anon_${2000 + i * 3}`,
  questionsSolved: 120 - i * 3,
  correctAnswers: 110 - i * 3,
  accuracy: 95 - i,
}));

const currentUser = {
  rank: 113,
  displayName: "Berkin S.",
  avatar: null, // or a URL
  questionsSolved: 74,
  correctAnswers: 66,
  accuracy: 81,
  subject: "Fizyoloji",
  totalUsers: 4800,
  above: { displayName: "anon_2847", correctAnswers: 70, questionsSolved: 78 },
  below: { displayName: "anon_2850", correctAnswers: 62, questionsSolved: 72 },
  toTop: 29,
  toNext: 4,
  toPass: 8,
  toPassCount: 3,
  motivational: "3 kişi geçmek için 8 doğru cevap daha çözmen yeterli. %3’lük dilimdesin, bu harika!"
};



export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [subject, setSubject] = useState("Fizyoloji");
  const [sortBy, setSortBy] = useState("correct");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [userInTop] = useState(false); // For mock, user not in top 20
  const userRowRef = useRef<HTMLTableRowElement>(null);

  // Empty state: user not in leaderboard for this subject
  const isEmpty = false; // set to true to test empty state

  // Sort leaderboard mock data
  const sortedLeaderboard = [...mockLeaderboard].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "solved") cmp = b.questionsSolved - a.questionsSolved;
    else if (sortBy === "accuracy") cmp = b.accuracy - a.accuracy;
    else cmp = b.correctAnswers - a.correctAnswers;
    return sortDir === "desc" ? cmp : -cmp;
  });

  // Table header click handler
  function handleSort(col: string) {
    if (sortBy === col) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 py-8 flex flex-col gap-8">
      {/* Header */}
      <header className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 flex items-center gap-2 mb-1">
          <TrophyIcon className="w-7 h-7 text-yellow-500" /> Sıralamalar
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Konulara göre sıralamalarda nerede olduğunu gör.</p>
      </header>

      {/* Subject Selector Card */}
      <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-2">
        <div className="mb-2">
          <span className="text-sm text-gray-500 font-medium">Konu Seç:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all border text-sm
                ${subject === s
                  ? 'bg-blue-600 text-white border-blue-600 shadow font-bold'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-800 hover:text-blue-700'}
              `}
              style={{ minWidth: 110 }}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Personal Rank Insight (Not sticky) */}
      <aside className="mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
          <ArrowTrendingUpIcon className="w-7 h-7 text-blue-600" />
          <div className="flex-1">
            <div className="font-semibold text-blue-700 dark:text-blue-200 text-base">
              {subject}’de {currentUser.totalUsers} kullanıcı arasında <span className="text-lg font-bold">{currentUser.rank}. sıradasın</span>.
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
              Bir üst sıradaki kullanıcıdan <b>{currentUser.toNext} doğru cevap</b>, liderden <b>{currentUser.toTop} doğru cevap</b> geridesin.
            </div>
            <div className="text-blue-700 dark:text-blue-200 text-sm mt-2 font-semibold">{currentUser.motivational}</div>
          </div>
        </div>
      </aside>

      {/* Leaderboard Table or Empty State */}
      {!isEmpty ? (
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-700 dark:text-gray-300 border-b">
                <th className="py-3 px-2 text-left font-bold">Sıra</th>
                <th className="py-3 px-2 text-left font-bold">Kullanıcı</th>
                <th
                  className={`py-3 px-2 text-left font-bold cursor-pointer select-none transition-colors ${sortBy === 'solved' ? 'text-blue-600' : 'hover:text-blue-500'}`}
                  onClick={() => handleSort('solved')}
                >
                  Çözülen Soru
                  {sortBy === 'solved' && (sortDir === 'desc' ? <ArrowDownIcon className="w-4 h-4 inline ml-1" /> : <ArrowUpIcon className="w-4 h-4 inline ml-1" />)}
                </th>
                <th
                  className={`py-3 px-2 text-left font-bold cursor-pointer select-none transition-colors ${sortBy === 'correct' ? 'text-blue-600' : 'hover:text-blue-500'}`}
                  onClick={() => handleSort('correct')}
                >
                  Doğru Sayısı
                  {sortBy === 'correct' && (sortDir === 'desc' ? <ArrowDownIcon className="w-4 h-4 inline ml-1" /> : <ArrowUpIcon className="w-4 h-4 inline ml-1" />)}
                </th>
                <th
                  className={`py-3 px-2 text-left font-bold cursor-pointer select-none transition-colors ${sortBy === 'accuracy' ? 'text-blue-600' : 'hover:text-blue-500'}`}
                  onClick={() => handleSort('accuracy')}
                >
                  Doğruluk (%)
                  {sortBy === 'accuracy' && (sortDir === 'desc' ? <ArrowDownIcon className="w-4 h-4 inline ml-1" /> : <ArrowUpIcon className="w-4 h-4 inline ml-1" />)}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map((row) => (
                <tr key={row.rank} className="border-b last:border-0">
                  <td className="py-2 px-2 font-semibold">{row.rank}</td>
                  <td className="py-2 px-2 flex items-center gap-2">
                    <UserCircleIcon className="w-5 h-5 text-gray-400" />
                    <span>{row.displayName}</span>
                  </td>
                  <td className={`py-2 px-2 ${sortBy === 'solved' ? 'font-bold text-blue-600' : ''}`}>{row.questionsSolved}</td>
                  <td className={`py-2 px-2 ${sortBy === 'correct' ? 'font-bold text-blue-600' : ''}`}>{row.correctAnswers}</td>
                  <td className={`py-2 px-2 ${sortBy === 'accuracy' ? 'font-bold text-blue-600' : ''}`}>{row.accuracy}%</td>
                </tr>
              ))}
              {/* If user is not in top 20, show ... and their row */}
              {!userInTop && (
                <>
                  <tr><td colSpan={5} className="text-center text-gray-400 py-2">...</td></tr>
                  <tr ref={userRowRef} className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30">
                    <td className="py-2 px-2 font-semibold">{currentUser.rank}</td>
                    <td className="py-2 px-2 flex items-center gap-2">
                      <UserCircleIcon className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-blue-700 dark:text-blue-200">{profile?.full_name || currentUser.displayName}</span>
                    </td>
                    <td className="py-2 px-2 font-bold">{currentUser.questionsSolved}</td>
                    <td className="py-2 px-2 font-bold">{currentUser.correctAnswers}</td>
                    <td className="py-2 px-2 font-bold">{currentUser.accuracy}%</td>
                  </tr>
                  <tr className="border-b last:border-0">
                    <td className="py-2 px-2 font-semibold">{currentUser.rank + 1}</td>
                    <td className="py-2 px-2 flex items-center gap-2">
                      <UserCircleIcon className="w-5 h-5 text-gray-400" />
                      <span>{currentUser.below.displayName}</span>
                    </td>
                    <td className="py-2 px-2">{currentUser.below.questionsSolved}</td>
                    <td className="py-2 px-2">-</td>
                    <td className="py-2 px-2">-</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </section>
      ) : (
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-700 dark:text-gray-300 text-center text-lg font-medium mb-2">Bu sıralamada yer almıyorsun. Quiz çözerek yerini alabilirsin.</p>
          <Link href="/quiz/new" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow text-base font-semibold">Quiz Çöz ve Sıralamaya Katıl →</Link>
        </section>
      )}

      {/* Privacy Note */}
      <footer className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
        Bu sıralama anonim kullanıcı verilerine dayanmaktadır.
      </footer>
    </div>
  );
} 