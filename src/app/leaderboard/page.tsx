"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../lib/AuthContext";
import { UserCircleIcon, ArrowTrendingUpIcon, TrophyIcon, ArrowDownIcon, ArrowUpIcon, PlayIcon } from '@heroicons/react/24/solid';
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import BackButton from "../../components/BackButton";

export default function LeaderboardPage() {
  const { profile, authState } = useAuth();
  const [subject, setSubject] = useState<string>("Genel");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [sortBy, setSortBy] = useState<string>("correct");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const userRowRef = useRef<HTMLTableRowElement>(null);

  // Fetch subjects from backend
  useEffect(() => {
    if (authState === 'authenticated') {
      fetchSubjects();
    }
  }, [authState]);

  // Force refresh subjects
  const forceRefreshSubjects = () => {
    setSubjects([]);
    setSubject("Genel"); // Reset to Genel
    setTimeout(() => {
      fetchSubjects();
    }, 100);
  };

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return;
      }

      const response = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const subjectsData = await response.json();
        const subjectNames = subjectsData.map((subject: any) => subject.name);
        
        // Add "Genel" at the beginning of the subjects list
        const allSubjects = ["Genel", ...subjectNames];
        setSubjects(allSubjects);
        
        // Always ensure "Genel" is selected initially
        setSubject("Genel");
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Fallback to default subjects if API fails
      const fallbackSubjects = ["Genel", "Farmakoloji", "Mikrobiyoloji", "Fizyoloji", "Biyokimya", "Patoloji"];
      setSubjects(fallbackSubjects);
      setSubject("Genel");
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Fetch leaderboard data based on selected subject
  useEffect(() => {
    if (authState === 'authenticated' && subject) {
      fetchLeaderboardData();
    }
  }, [authState, subject]);

  const fetchLeaderboardData = async () => {
    setLoadingLeaderboard(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return;
      }

      // Always pass the subject parameter, even for "Genel"
      const url = `/api/leaderboard?subject=${encodeURIComponent(subject || 'Genel')}`;

      const response = await fetch(url, {
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

  // Empty state: user not in leaderboard for this subject
  const isEmpty = false; // set to true to test empty state

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
        <div className="flex items-center gap-3 mb-2">
          <BackButton iconOnly={true} iconColorClass="text-black" />
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 flex items-center gap-2 mb-1">
            <TrophyIcon className="w-7 h-7 text-yellow-500" /> Sıralamalar
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Konulara göre sıralamalarda nerede olduğunu gör.</p>
      </header>

      {/* Subject Selector Card */}
      <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-2">
        <div className="mb-2">
          <span className="text-sm text-gray-500 font-medium">Konu Seç:</span>
        </div>
        
        <div className="w-full">
          {loadingSubjects ? (
            <p className="px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all border text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700">Yükleniyor...</p>
          ) : subjects.length === 0 ? (
            <p className="px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all border text-sm bg-red-200 dark:bg-red-700 text-red-600 dark:text-red-300 border-red-300 dark:border-red-700">Konular yüklenemedi</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s, index) => (
                  <button
                    key={`${s}-${index}`}
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
            </>
          )}
        </div>
      </section>

      {/* Personal Rank Insight (Not sticky) */}
      <aside className="mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
          <ArrowTrendingUpIcon className="w-7 h-7 text-blue-600" />
          <div className="flex-1">
            {loadingLeaderboard ? (
              <div className="font-semibold text-blue-700 dark:text-blue-200 text-base">
                Yükleniyor...
              </div>
            ) : (() => {
              return leaderboardData && leaderboardData.insight;
            })() ? (
              <>
                <div className="font-semibold text-blue-700 dark:text-blue-200 text-base">
                  {leaderboardData.insight}
                </div>
                {leaderboardData.userRank && (
                  <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                    Ortalama skorun: <b>{leaderboardData.userScore}</b>
                  </div>
                )}
              </>
            ) : (
              <div className="font-semibold text-blue-700 dark:text-blue-200 text-base">
                {!subject || subject === null || subject === 'null' || subject === 'Genel' 
                  ? 'Henüz quiz çözülmemiş.' 
                  : `${subject} konusunda henüz quiz çözülmemiş.`
                }
              </div>
            )}
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
              {loadingLeaderboard ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : leaderboardData?.topPerformers && leaderboardData.topPerformers.length > 0 ? (
                leaderboardData.topPerformers.map((row: any, index: number) => (
                  <tr key={row.user_id} className="border-b last:border-0">
                    <td className="py-2 px-2 font-semibold">{index + 1}</td>
                    <td className="py-2 px-2 flex items-center gap-2">
                      <UserCircleIcon className="w-5 h-5 text-gray-400" />
                      <span>{row.name}</span>
                    </td>
                    <td className="py-2 px-2">{row.quizCount}</td>
                    <td className="py-2 px-2 font-semibold text-blue-600">{row.avgScore}</td>
                    <td className="py-2 px-2">{Math.round((row.avgScore / row.quizCount) * 100)}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    {!subject || subject === 'null' || subject === 'Genel' 
                      ? 'Henüz hiç quiz çözülmemiş.' 
                      : `${subject} konusunda henüz quiz çözülmemiş.`
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-4 text-xs text-gray-500 text-center">
            Bu sıralama anonim kullanıcı verilerine dayanmaktadır.
          </div>
        </section>
      ) : (
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {!subject || subject === 'null' || subject === 'Genel' 
              ? 'Henüz Sıralamada Değilsin' 
              : `${subject} Konusunda Henüz Sıralamada Değilsin`
            }
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {!subject || subject === 'null' || subject === 'Genel'
              ? 'Henüz hiç quiz çözülmemiş. İlk quiz\'ini çözerek sıralamaya katıl!'
              : `${subject} konusunda henüz quiz çözülmemiş. İlk quiz'ini çözerek sıralamaya katıl!`
            }
          </p>
          <Link href="/quiz" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Quiz Çöz
          </Link>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
              Sıralamada yükselmek ister misin?
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md">
            {subject === 'Genel' 
              ? 'Tüm konulardan karışık bir quiz çöz ve genel sıralamada yerini al!'
              : `${subject} konusunda yeni bir quiz çöz ve sıralamada yüksel!`
            }
          </p>
          <Link 
            href={subject === 'Genel' 
              ? '/quiz/new?subjects=all' 
              : `/quiz/new?subject=${encodeURIComponent(subject)}`
            }
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            <PlayIcon className="w-5 h-5" />
            {subject === 'Genel' ? 'Karışık Quiz Başlat' : `${subject} Quiz'i Başlat`}
          </Link>
        </div>
      </section>

      {/* Privacy Note */}
      <footer className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
        Bu sıralama anonim kullanıcı verilerine dayanmaktadır.
      </footer>
    </div>
  );
} 