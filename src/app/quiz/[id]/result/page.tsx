"use client";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../lib/AuthContext";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { ArrowLeft, FileDown } from "lucide-react";

// Placeholder/mock quiz result data
const MOCK_RESULT = {
  total: 10,
  correct: 7,
  wrong: 3,
  score: 70,
  mode: "Karma",
  timeSpent: 312, // seconds
  questions: [
    {
      id: 1,
      text: "Aşağıdakilerden hangisi DNA'nın bir parçasıdır?",
      options: ["Adenin", "Glukoz", "Lipid", "Kalsiyum", "Protein"],
      correct: 0,
      user: 0,
      explanation: "Adenin, DNA'nın bazlarından biridir.",
      subject: "Biyokimya"
    },
    {
      id: 2,
      text: "İnsan vücudunda en bol bulunan mineral nedir?",
      options: ["Demir", "Kalsiyum", "Potasyum", "Sodyum", "Magnezyum"],
      correct: 1,
      user: 2,
      explanation: "Kalsiyum, kemiklerde en bol bulunan mineraldir.",
      subject: "Fizyoloji"
    },
    // ...more questions
  ],
  subjectStats: [
    { subject: "Biyokimya", correct: 3, total: 4 },
    { subject: "Fizyoloji", correct: 2, total: 3 },
    { subject: "Patoloji", correct: 2, total: 3 },
  ],
  aiSuggestion: "Fizyoloji konusuna odaklanmayı deneyin.",
  streak: 4,
};

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export default function QuizResultPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  // const quizId = params.id; // TODO: fetch real data
  const result = MOCK_RESULT;
  const isPremium = !!profile?.is_premium;

  // For free users: only show 1 explanation (first wrong or first question)
  const [allowedExplanationIdx, setAllowedExplanationIdx] = useState<number>(0);
  useEffect(() => {
    if (!isPremium) {
      const firstWrong = result.questions.findIndex(
        (q) => q.user !== null && q.user !== q.correct
      );
      setAllowedExplanationIdx(firstWrong !== -1 ? firstWrong : 0);
    }
  }, [isPremium, result.questions]);

  // PDF export (premium only)
  function handleDownloadPDF() {
    const doc = new jsPDF();
    
    // Set up fonts and colors
    doc.setFont("helvetica");
    doc.setTextColor(0, 0, 0);
    
    // Header
    doc.setFillColor(59, 130, 246); // Blue background
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TusAI Quiz Sonucu", 105, 15, { align: "center" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    let y = 35;
    
    // Summary section
    doc.setFillColor(243, 244, 246); // Light gray background
    doc.rect(10, y, 190, 20, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Özet", 15, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Doğru: ${result.correct} / ${result.total}`, 15, y + 15);
    doc.text(`Skor: %${result.score}`, 60, y + 15);
    doc.text(`Mod: ${result.mode}`, 100, y + 15);
    if (result.timeSpent) {
      doc.text(`Süre: ${formatTime(result.timeSpent)}`, 140, y + 15);
    }
    
    y += 30;
    
    // Subject stats section
    if (result.subjectStats.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Konu Bazlı Doğruluk", 15, y);
      y += 8;
      
      result.subjectStats.forEach((stat, index) => {
        const accuracy = Math.round((stat.correct / stat.total) * 100);
        const barWidth = (stat.correct / stat.total) * 80; // Max 80 units wide
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`${stat.subject}:`, 15, y);
        doc.text(`${accuracy}%`, 120, y);
        
        // Progress bar
        doc.setFillColor(200, 200, 200);
        doc.rect(15, y + 2, 80, 4, "F");
        doc.setFillColor(59, 130, 246);
        doc.rect(15, y + 2, barWidth, 4, "F");
        
        y += 10;
      });
      y += 5;
    }
    
    // Questions section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Cevap Analizi", 15, y);
    y += 8;
    
    result.questions.forEach((q, i) => {
      // Check if we need a new page
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      // Question header
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 190, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Soru ${i + 1}`, 12, y + 6);
      
      y += 12;
      
      // Question text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const questionLines = doc.splitTextToSize(q.text, 180);
      questionLines.forEach((line: string) => {
        doc.text(line, 12, y);
        y += 4;
      });
      
      y += 2;
      
      // Options
      q.options.forEach((opt, j) => {
        const isCorrect = j === q.correct;
        const isUserAnswer = j === q.user;
        const isWrong = isUserAnswer && !isCorrect;
        
        // Option background color
        if (isCorrect) {
          doc.setFillColor(220, 252, 231); // Light green for correct
        } else if (isWrong) {
          doc.setFillColor(254, 226, 226); // Light red for wrong
        } else {
          doc.setFillColor(255, 255, 255);
        }
        
        doc.rect(12, y, 186, 6, "F");
        doc.setDrawColor(200, 200, 200);
        doc.rect(12, y, 186, 6, "S");
        
        // Option text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        let optionText = `${OPTION_LABELS[j]}. ${opt}`;
        
        if (isCorrect) {
          optionText += " ✓";
          doc.setTextColor(34, 197, 94);
        } else if (isWrong) {
          optionText += " ✗";
          doc.setTextColor(239, 68, 68);
        }
        
        if (isUserAnswer) {
          optionText += " (Seçildi)";
        }
        
        doc.text(optionText, 14, y + 4);
        doc.setTextColor(0, 0, 0); // Reset color
        
        y += 8;
      });
      
      // Explanation (premium only)
      if (isPremium && q.explanation) {
        y += 2;
        doc.setFillColor(254, 249, 195); // Light yellow background
        doc.rect(12, y, 186, 8, "F");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text(`Açıklama: ${q.explanation}`, 14, y + 5);
        y += 10;
      }
      
      y += 5;
    });
    
    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("TusAI tarafından oluşturuldu", 105, 290, { align: "center" });
    
    doc.save("TusAI-Quiz-Sonucu.pdf");
  }

  // Format time spent
  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Calculate subject-wise accuracy for bar chart
  const maxSubjectTotal = Math.max(...result.subjectStats.map(s => s.total));

  return (
    <div className="min-h-screen bg-tusai-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-tusai overflow-hidden">
          {/* Header with summary and buttons */}
          <div className="bg-gradient-to-r from-tusai-accent to-[#ede9fe] p-6 text-white relative">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold mb-2">Quiz Sonucu</h1>
                <div className="text-sm opacity-90 mb-3">Mod: <span className="font-semibold">{result.mode}</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 text-sm">
                  <div><span className="font-bold">Toplam Soru:</span> <span className="font-normal">{result.total}</span></div>
                  <div><span className="font-bold">Doğru:</span> <span className="font-normal text-green-300">{result.correct}</span></div>
                  <div><span className="font-bold">Yanlış:</span> <span className="font-normal text-red-300">{result.wrong}</span></div>
                  <div><span className="font-bold">Skor:</span> <span className="font-normal">%{result.score}</span></div>
                  <div><span className="font-bold">Süre:</span> <span className="font-normal">{formatTime(result.timeSpent)}</span></div>
                </div>
              </div>
              {/* Button group, stacked, right-aligned, with icons and spacing */}
              <div className="flex flex-col gap-3 items-end pt-2 pb-2 min-w-[140px]">
                <button
                  onClick={() => router.replace("/dashboard")}
                  className="flex items-center gap-2 w-full justify-center text-tusai-accent hover:text-tusai transition bg-white/90 px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md font-semibold text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Panele Dön
                </button>
                {isPremium && (
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 w-full justify-center bg-tusai-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-tusai transition shadow-sm hover:shadow-md text-sm"
                  >
                    <FileDown className="w-4 h-4" />
                    PDF İndir
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* AI Suggestion & Streak */}
            {isPremium && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-blue-900 mb-1">AI Önerisi</div>
                    <div className="text-blue-800">{result.aiSuggestion}</div>
                    {result.streak && (
                      <div className="text-xs text-blue-600 mt-2">Günlük quiz seriniz: <span className="font-bold">{result.streak} gün</span></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Subject-wise accuracy bar chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="font-semibold mb-4 text-tusai">Konu Bazlı Doğruluk</div>
              <div className="space-y-3">
                {result.subjectStats.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-32 text-sm text-tusai-dark font-medium flex-shrink-0">{s.subject}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden min-w-0">
                      <div 
                        className="bg-gradient-to-r from-tusai-accent to-tusai h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${(s.correct / s.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right text-tusai-accent text-sm font-semibold flex-shrink-0">%{Math.round((s.correct / s.total) * 100)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Answer Breakdown */}
            <div>
              <div className="font-semibold text-tusai mb-4">Cevap Analizi</div>
              <div className="space-y-4">
                {result.questions.map((q, i) => {
                  const isCorrect = q.user === q.correct;
                  const showExplanation = isPremium || i === allowedExplanationIdx;
                  return (
                    <div key={q.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="font-medium mb-3 text-tusai-dark">{i + 1}. {q.text}</div>
                      <div className="space-y-2 mb-3">
                        {q.options.map((opt, j) => (
                          <div
                            key={j}
                            className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-3 transition-colors
                              ${q.user === j ? (isCorrect ? "bg-green-100 border-green-400 text-green-800" : "bg-red-100 border-red-400 text-red-800") : "bg-white border-gray-200 text-tusai-dark"}
                            `}
                          >
                            <span className="font-bold text-tusai-accent flex-shrink-0">{OPTION_LABELS[j]}</span> 
                            <span className="flex-1 min-w-0">{opt}</span>
                            {q.user === j && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {isCorrect ? (
                                  <>
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-xs font-semibold text-green-600">Doğru</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-xs font-semibold text-red-600">Yanlış</span>
                                  </>
                                )}
                              </div>
                            )}
                            {q.correct === j && q.user !== j && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs font-semibold text-green-600">Doğru Cevap</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {showExplanation && q.explanation && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <span className="font-semibold">Açıklama:</span> {q.explanation}
                            </div>
                          </div>
                        </div>
                      )}
                      {!isPremium && !showExplanation && (
                        <div className="text-xs text-tusai-accent bg-tusai-accent/10 rounded-lg p-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Daha fazla açıklama görmek için Premium'a geçin.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Free user CTA */}
            {!isPremium && (
              <div className="bg-gradient-to-r from-tusai-accent/10 to-tusai/10 rounded-lg p-6 border border-tusai-accent/20">
                <div className="text-center">
                  <div className="font-semibold text-tusai-accent mb-3">Daha fazlası için Premium'a geçin!</div>
                  <ul className="text-sm text-tusai-dark mb-4 space-y-1">
                    <li>• Tüm açıklamalara erişim</li>
                    <li>• Quiz sonuçlarını PDF olarak dışa aktar</li>
                    <li>• Zayıf konu analizi ve AI önerileri</li>
                    <li>• Quiz geçmişinizi kaydedin ve tekrar inceleyin</li>
                  </ul>
                  <button 
                    className="bg-tusai-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-tusai transition shadow-lg hover:shadow-xl" 
                    onClick={() => router.push("/pricing")}
                  >
                    Premium'a Geç
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 