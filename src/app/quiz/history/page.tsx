"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../../../lib/AuthContext";
import { quizzesApi, Quiz } from "../../../lib/api";
import Link from "next/link";
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const SUBJECTS = [
  "Fizyoloji",
  "Biyokimya",
  "Mikrobiyoloji",
  "Farmakoloji",
  "Patoloji",
  // Add more as needed
];

const QUIZ_TYPES = [
  { key: "Karma Quiz", label: "Karma" },
  { key: "Zayıf Konular", label: "Zayıf Konular" },
  { key: "Çıkmış Sorular", label: "Çıkmış" },
];

export default function QuizHistoryPage() {
  const { user, authState } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedChartSubject, setSelectedChartSubject] = useState<string>(SUBJECTS[0]);
  const [selectedSuccessSubject, setSelectedSuccessSubject] = useState<string>(SUBJECTS[0]);
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      loadQuizzes();
    }
  }, [user]);

  const loadQuizzes = async () => {
    if (!user?.id) return;
    
    setLoadingQuizzes(true);
    try {
      const response = await quizzesApi.getQuizzes();
      if (response.data) {
        setQuizzes(response.data);
      } else {
        console.error('Failed to load quizzes:', response.error);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // Filtered and sorted quizzes
  const filtered = useMemo(() => {
    let data = [...quizzes];
    if (subjectFilter) {
      data = data.filter(q => q.subjects?.some(s => s.includes(subjectFilter)));
    }
    if (typeFilter) {
      data = data.filter(q => q.mode === typeFilter);
    }
    data.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortBy === "score") cmp = (a.score || 0) - (b.score || 0);
      else if (sortBy === "type") cmp = a.mode.localeCompare(b.mode);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [quizzes, subjectFilter, typeFilter, sortBy, sortDir]);

  // Stats
  const totalQuizzes = quizzes.length;
  const avgScore = totalQuizzes ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / totalQuizzes) : 0;
  const subjectStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {};
    quizzes.forEach(q => {
      q.subjects?.forEach(subject => {
        if (!stats[subject]) stats[subject] = { count: 0, total: 0 };
        stats[subject].count += 1;
        if (q.score && q.total_questions) {
          stats[subject].total += Math.round((q.score / 100) * q.total_questions);
        }
      });
    });
    return stats;
  }, [quizzes]);

  const bestSubject = Object.entries(subjectStats).sort((a, b) => b[1].total - a[1].total)[0]?.[0] || "-";
  const worstSubject = Object.entries(subjectStats).sort((a, b) => a[1].total - b[1].total)[0]?.[0] || "-";

  // --- Insights Logic ---
  // For each subject, compare last 3 quizzes vs previous 3 quizzes
  const insights = useMemo(() => {
    const result: { subject: string; message: string }[] = [];
    SUBJECTS.forEach(subject => {
      // Get all quizzes with this subject
      const subjectQuizzes = quizzes.filter(q => q.subjects?.some(s => s.includes(subject)));
      if (subjectQuizzes.length < 4) return; // Need at least 4 for trend
      // Sort by date
      const sorted = subjectQuizzes.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const last3 = sorted.slice(-3);
      const prev3 = sorted.slice(-6, -3);
      const avg = (arr: Quiz[]) => arr.length ? Math.round(arr.reduce((sum, q) => sum + (q.score || 0), 0) / arr.length) : 0;
      const lastAvg = avg(last3);
      const prevAvg = avg(prev3);
      if (lastAvg > prevAvg) {
        result.push({ subject, message: `${subject} testlerindeki başarın son 3 quizde %${lastAvg - prevAvg} arttı!` });
      } else if (lastAvg < prevAvg) {
        result.push({ subject, message: `${subject} testlerinde başarı oranı düştü (%${prevAvg} → %${lastAvg}). Daha fazla pratik yapmalısın!` });
      } else {
        result.push({ subject, message: `${subject} testlerinde ilerleme kaydedilmiyor. Tekrar gözden geçir!` });
      }
    });
    return result;
  }, [quizzes]);

  // --- Chart 1: Questions solved per date for selected subject ---
  const solvedPerDate = useMemo(() => {
    const subjectQuizzes = quizzes
      .filter(q => q.subjects?.some(s => s.includes(selectedChartSubject)))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const data = subjectQuizzes.map(q => {
      return {
        x: new Date(q.created_at).toLocaleDateString('tr-TR'),
        y: q.total_questions || 0,
      };
    });
    return {
      labels: data.map(d => d.x),
      datasets: [
        {
          label: `${selectedChartSubject} - Çözülen Soru`,
          data: data.map(d => d.y),
          backgroundColor: (ctx: { chart: ChartJS }) => {
            const chart = ctx.chart;
            const {ctx: c, chartArea} = chart;
            if (!chartArea) return 'rgba(59,130,246,0.7)';
            const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(59,130,246,0.7)');
            gradient.addColorStop(1, 'rgba(99,102,241,0.7)');
            return gradient;
          },
          borderRadius: 8,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
      ],
    };
  }, [quizzes, selectedChartSubject]);

  // --- Chart 2: Success % per date for selected subject ---
  const successPerDate = useMemo(() => {
    const subjectQuizzes = quizzes
      .filter(q => q.subjects?.some(s => s.includes(selectedSuccessSubject)))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const data = subjectQuizzes.map(q => {
      return {
        x: new Date(q.created_at).toLocaleDateString('tr-TR'),
        y: q.score || 0,
      };
    });
    return {
      labels: data.map(d => d.x),
      datasets: [
        {
          label: `${selectedSuccessSubject} - Başarı (%)`,
          data: data.map(d => d.y),
          fill: true,
          borderColor: 'rgba(16,185,129,0.9)',
          backgroundColor: (ctx: { chart: ChartJS }) => {
            const chart = ctx.chart;
            const {ctx: c, chartArea} = chart;
            if (!chartArea) return 'rgba(16,185,129,0.2)';
            const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(16,185,129,0.25)');
            gradient.addColorStop(1, 'rgba(16,185,129,0.05)');
            return gradient;
          },
          pointBackgroundColor: 'rgba(16,185,129,1)',
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
        },
      ],
    };
  }, [quizzes, selectedSuccessSubject]);

  // --- Chart options ---
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1e293b',
        bodyColor: '#334155',
        borderColor: '#3b82f6',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'Tarih', color: '#64748b', font: { size: 14, weight: 700 } },
        grid: { color: 'rgba(203,213,225,0.3)' },
        ticks: { color: '#334155', font: { size: 13 } },
      },
      y: {
        title: { display: true, text: 'Çözülen Soru', color: '#64748b', font: { size: 14, weight: 700 } },
        grid: { color: 'rgba(203,213,225,0.3)' },
        ticks: { color: '#334155', font: { size: 13 } },
        beginAtZero: true,
      },
    },
    layout: { padding: 16 },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1e293b',
        bodyColor: '#334155',
        borderColor: '#10b981',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
      title: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'Tarih', color: '#64748b', font: { size: 14, weight: 700 } },
        grid: { color: 'rgba(203,213,225,0.2)' },
        ticks: { color: '#334155', font: { size: 13 } },
      },
      y: {
        title: { display: true, text: 'Başarı (%)', color: '#64748b', font: { size: 14, weight: 700 } },
        grid: { color: 'rgba(203,213,225,0.2)' },
        ticks: { color: '#334155', font: { size: 13 } },
        min: 0,
        max: 100,
      },
    },
    layout: { padding: 16 },
  };

  if (authState === 'loading') return <div className="p-8 text-center">Yükleniyor...</div>;
  if (authState === 'unauthenticated') return <div className="p-8 text-center">Giriş yapmalısınız.</div>;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-tusai mb-2">Quiz Geçmişi</h1>
      
      {loadingQuizzes && (
        <div className="text-center py-4 text-gray-600">Quiz geçmişi yükleniyor...</div>
      )}
      
      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h2 className="font-semibold text-blue-700 mb-2">Kişisel İpuçları</h2>
          <ul className="list-disc pl-6 space-y-1">
            {insights.map((ins, i) => (
              <li key={i} className="text-blue-900">{ins.message}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Stats, Filters, Table */}
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
      
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Konu</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Quiz Tipi</option>
          {QUIZ_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="date">Tarih</option>
          <option value="score">Skor</option>
          <option value="type">Tip</option>
        </select>
        <select value={sortDir} onChange={e => setSortDir(e.target.value as "asc" | "desc")} className="border rounded px-2 py-1 text-sm">
          <option value="desc">Azalan</option>
          <option value="asc">Artan</option>
        </select>
      </div>
      
      <div className="bg-white rounded-xl shadow border p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-700 border-b">
              <th className="py-2 px-2 text-left">Tarih</th>
              <th className="py-2 px-2 text-left">Konu</th>
              <th className="py-2 px-2 text-left">Skor</th>
              <th className="py-2 px-2 text-left">Tip</th>
              <th className="py-2 px-2 text-left">Toplam Soru</th>
              <th className="py-2 px-2 text-left">İncele</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">
                {loadingQuizzes ? "Yükleniyor..." : "Kayıt bulunamadı."}
              </td></tr>
            ) : (
              filtered.map((q, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 px-2">{new Date(q.created_at).toLocaleDateString("tr-TR")}</td>
                  <td className="py-2 px-2">{q.subjects?.join(", ") || "-"}</td>
                  <td className="py-2 px-2">{q.score || 0}%</td>
                  <td className="py-2 px-2">{q.mode}</td>
                  <td className="py-2 px-2">{q.total_questions || 0}</td>
                  <td className="py-2 px-2">
                    <Link href={`/quiz/${q.id}`} className="text-blue-600 underline text-xs">İncele</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Charts Section (below table) */}
      <div className="flex flex-col gap-8 mt-8">
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-blue-600">Konuya Göre Çözülen Soru (Zamanla)</h3>
            <select value={selectedChartSubject} onChange={e => setSelectedChartSubject(e.target.value)} className="ml-2 border rounded px-2 py-1 text-sm">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Bar ref={barChartRef} data={solvedPerDate} options={barOptions} />
        </div>
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-blue-600">Konuya Göre Başarı Oranı (Zamanla)</h3>
            <select value={selectedSuccessSubject} onChange={e => setSelectedSuccessSubject(e.target.value)} className="ml-2 border rounded px-2 py-1 text-sm">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Line ref={lineChartRef} data={successPerDate} options={lineOptions} />
        </div>
      </div>
    </div>
  );
} 