"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../lib/AuthContext";
import jsPDF from "jspdf";

// Placeholder subjects - replace with Supabase fetch if needed
const SUBJECTS = [
  "Mikrobiyoloji",
  "Patoloji",
  "Fizyoloji",
  "Biyokimya",
  "Farmakoloji",
  "Histoloji",
  "Anatomi",
  "Kardiyoloji",
  "Nöroloji",
  "Endokrinoloji"
];

const MODES = [
  { key: "karma", label: "Karma" },
  { key: "zayif", label: "Zayıf Konular" },
  { key: "cikmis", label: "Çıkmış Sorular" }
];

const QUESTION_COUNTS = [10, 20, 40];
const TIME_LIMITS = [10, 30, 60];

const MODE_DESCRIPTIONS: Record<string, string> = {
  karma: "Yapay Zeka tarafından olşturulan sorular ile çıkmış soruların karışımı",
  zayif: "Son quiz sonuçlarına göre en zayıf olduğunuz konulardan sorular",
  cikmis: "ÖSYM tarafından yayımlanmış geçmiş sınav sorularından oluşur"
};

export default function QuizNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();

  // Step state
  const [step, setStep] = useState(1);

  // Step 1: Subject & Mode
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [mode, setMode] = useState<string>("");

  // Step 2: Config
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  // Step 3: Loading/Result
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle URL parameters for pre-selection
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    const urlSubjects = searchParams.get('subjects');
    
    if (urlMode && MODES.some(m => m.key === urlMode)) {
      setMode(urlMode);
      
      // Handle special cases for different modes
      if (urlMode === 'zayif') {
        // TODO: Replace with real weak subjects from user stats
        setSelectedSubjects(SUBJECTS.slice(0, 3));
      } else if (urlSubjects) {
        // Handle specific subjects from URL
        const subjects = urlSubjects.split(',').filter(s => SUBJECTS.includes(s));
        if (subjects.length > 0) {
          setSelectedSubjects(subjects);
        }
      }
    }
  }, [searchParams]);

  // Edge cases
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/giris?next=/quiz/new");
    }
  }, [user, loading, router]);

  // TODO: Replace with real daily limit logic
  const quizLimit = profile?.is_premium ? 5 : 1;
  const quizCountToday = 0; // TODO: fetch from Supabase
  const canCreateQuiz = quizCountToday < quizLimit;

  // Step 1: Subject & Mode Selection
  function handleSubjectToggle(subject: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  }

  function handleModeSelect(m: string) {
    setMode(m);
    if (m === "zayif") {
      // TODO: Replace with real weak subjects from user stats
      setSelectedSubjects(SUBJECTS.slice(0, 3));
    }
  }

  function handleNextStep1() {
    if (selectedSubjects.length === 0 || !mode) {
      setError("Lütfen en az bir konu ve bir mod seçin.");
      return;
    }
    setError(null);
    setStep(2);
  }

  // Step 2: Config
  function handleNextStep2() {
    // For free users, force questionCount = 10, timeLimit = null
    if (!profile?.is_premium) {
      setQuestionCount(10);
      setTimeLimit(null);
    }
    setStep(3);
  }

  // Step 3: Quiz Generation & Session Creation
  async function handleCreateQuiz() {
    setCreating(true);
    setError(null);
    try {
      // TODO: Replace with real Supabase logic and AI call if needed
      // Simulate quiz creation and get a quiz_id
      const quiz_id = Math.random().toString(36).substring(2, 10);
      // Simulate network delay
      await new Promise((res) => setTimeout(res, 1200));
      // TODO: Store quiz session in Supabase
      setCreatedQuizId(quiz_id); // Save for next step
      setStep(4); // Go to final options step
    } catch (e) {
      setError("Quiz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setCreating(false);
    }
  }

  // New state for created quiz id
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);

  // PDF export for premium users
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
    doc.text("TusAI Quiz", 105, 15, { align: "center" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    let y = 35;
    
    // Quiz info section
    doc.setFillColor(243, 244, 246); // Light gray background
    doc.rect(10, y, 190, 25, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Quiz Bilgileri", 15, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Mod: ${mode}`, 15, y + 15);
    doc.text(`Soru Sayısı: ${questionCount}`, 60, y + 15);
    if (timeLimit) {
      doc.text(`Süre: ${timeLimit} dakika`, 120, y + 15);
    }
    
    y += 35;
    
    // Subjects section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Konular", 15, y);
    y += 8;
    
    selectedSubjects.forEach((subject, i) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${i + 1}. ${subject}`, 15, y);
      y += 6;
    });
    
    y += 10;
    
    // Questions section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Sorular", 15, y);
    y += 8;
    
    for (let i = 0; i < questionCount; i++) {
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
      
      // Question text placeholder
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Soru metni buraya gelecek...", 12, y);
      y += 8;
      
      // Options
      for (let j = 0; j < 5; j++) {
        doc.setFillColor(255, 255, 255);
        doc.rect(12, y, 186, 6, "F");
        doc.setDrawColor(200, 200, 200);
        doc.rect(12, y, 186, 6, "S");
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`${String.fromCharCode(65 + j)}. Şık metni buraya gelecek...`, 14, y + 4);
        
        y += 8;
      }
      
      y += 5;
    }
    
    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("TusAI tarafından oluşturuldu", 105, 290, { align: "center" });
    
    doc.save("TusAI-Quiz.pdf");
    // TODO: Mark quiz as 'unsolved' and add to Past Quizzes (Supabase)
    if (createdQuizId) {
      // Simulate navigation to dashboard or past quizzes
      router.replace("/dashboard");
    }
  }

  // Edge: Free user daily limit
  if (!loading && user && !canCreateQuiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-tusai-dark rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-tusai">Günlük Quiz Hakkınız Doldu</h2>
          <p className="mb-6">Daha fazla quiz oluşturmak için Premium üyeliğe geçebilirsiniz.</p>
          <a href="/pricing" className="bg-tusai-accent text-white px-6 py-2 rounded font-semibold hover:bg-tusai transition">Premium’a Geç</a>
        </div>
      </div>
    );
  }

  // Main wizard UI
  useEffect(() => {
    if (step === 3 && !creating) {
      handleCreateQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tusai-light dark:bg-tusai-dark py-8 px-2">
      <div className="w-full max-w-lg bg-white dark:bg-tusai-dark border border-tusai rounded-lg shadow-lg p-6 sm:p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-tusai mb-6 text-center">Yeni Quiz Oluştur</h1>
        {/* Stepper */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-2 rounded-full ${step >= s ? "bg-tusai-accent" : "bg-gray-200"}`}></div>
          ))}
        </div>
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-tusai">Konu ve Mod Seçimi</h2>
            <div className="mb-4 w-full">
              <div className="mb-2 font-medium">Konu:</div>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    className={`px-3 py-1 rounded-full border text-sm font-medium ${selectedSubjects.includes(subject) ? "bg-tusai-accent text-white border-tusai-accent" : "bg-gray-100 dark:bg-tusai-dark/40 border-gray-300 dark:border-tusai-light/20 text-tusai"}`}
                    onClick={() => mode === "zayif" ? undefined : handleSubjectToggle(subject)}
                    disabled={mode === "zayif"}
                  >
                    {subject}
                  </button>
                ))}
              </div>
              {mode === "zayif" && (
                <div className="mt-2 text-tusai-accent text-sm font-medium">Zayıf konularınız sistem tarafından otomatik belirlenecektir.</div>
              )}
            </div>
            <div className="mb-4 w-full">
              <div className="mb-2 font-medium">Quiz Modu:</div>
              <div className="flex flex-col gap-2">
                {MODES.map((m) => (
                  <label key={m.key} className={`flex flex-col gap-1 px-2 py-1 rounded cursor-pointer border ${mode === m.key ? "border-tusai-accent bg-tusai-accent/10" : "border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mode"
                        checked={mode === m.key}
                        onChange={() => handleModeSelect(m.key)}
                        className="accent-tusai-accent"
                      />
                      <span className="font-medium">{m.label}</span>
                    </div>
                    <span className="text-xs text-gray-500 pl-6">{MODE_DESCRIPTIONS[m.key]}</span>
                  </label>
                ))}
              </div>
            </div>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <button className="w-full bg-tusai-accent text-white py-2 rounded font-semibold hover:bg-tusai transition mt-4" onClick={handleNextStep1}>
              Devam Et
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-tusai">Quiz Ayarları</h2>
            <div className="mb-4 w-full">
              <div className="mb-2 font-medium">Soru Sayısı:</div>
              <div className="flex gap-2">
                {QUESTION_COUNTS.map((count) => (
                  <button
                    key={count}
                    className={`px-4 py-2 rounded border font-semibold ${questionCount === count ? "bg-tusai-accent text-white border-tusai-accent" : "bg-gray-100 dark:bg-tusai-dark/40 border-gray-300 dark:border-tusai-light/20 text-tusai"}`}
                    onClick={() => setQuestionCount(count)}
                    disabled={!profile?.is_premium && count !== 10}
                  >
                    {count}
                  </button>
                ))}
              </div>
              {!profile?.is_premium && (
                <div className="text-xs text-tusai-accent mt-1">Ücretsiz kullanıcılar sadece 10 soruluk quiz oluşturabilir.</div>
              )}
            </div>
            <div className="mb-4 w-full">
              <div className="text-xs text-gray-500">
                {profile?.is_premium 
                  ? "Premium kullanıcılar tüm açıklamalara erişebilir."
                  : "Ücretsiz kullanıcılar günde sadece 1 yanlış açıklaması görebilir."
                }
              </div>
            </div>
            <div className="mb-4 w-full">
              <div className="mb-2 font-medium">Süre Sınırı (opsiyonel):</div>
              <div className="flex gap-2">
                {TIME_LIMITS.map((min) => (
                  <button
                    key={min}
                    className={`px-4 py-2 rounded border font-semibold ${timeLimit === min ? "bg-tusai-accent text-white border-tusai-accent" : "bg-gray-100 dark:bg-tusai-dark/40 border-gray-300 dark:border-tusai-light/20 text-tusai"}`}
                    onClick={() => setTimeLimit(timeLimit === min ? null : min)}
                    disabled={!profile?.is_premium}
                  >
                    {min} dk
                  </button>
                ))}
              </div>
              {!profile?.is_premium && (
                <div className="text-xs text-tusai-accent mt-1">Ücretsiz kullanıcılar için süre sınırı yoktur.</div>
              )}
            </div>
            <button className="w-full bg-tusai-accent text-white py-2 rounded font-semibold hover:bg-tusai transition mt-4" onClick={handleNextStep2}>
              Quiz Oluştur
            </button>
            <button className="w-full mt-2 text-tusai-accent underline" onClick={() => setStep(1)}>
              ← Geri
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-tusai">Quiz Oluşturuluyor...</h2>
            <div className="w-full flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 border-4 border-tusai-accent border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-tusai-accent font-medium">Lütfen bekleyin</div>
            </div>
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          </>
        )}
        {step === 4 && createdQuizId && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-tusai">Quiz Hazır!</h2>
            <div className="w-full flex flex-col gap-4 items-center">
              <button
                className="w-full bg-tusai-accent text-white py-2 rounded font-semibold hover:bg-tusai transition"
                onClick={() => router.replace(`/quiz/${createdQuizId}`)}
              >
                Quize Başla
              </button>
              {profile?.is_premium && (
                <button
                  className="w-full bg-tusai-light text-tusai-accent border border-tusai-accent py-2 rounded font-semibold hover:bg-tusai-accent/10 transition"
                  onClick={handleDownloadPDF}
                >
                  PDF Oluştur / İndir
                </button>
              )}
              {profile?.is_premium && (
                <div className="text-xs text-tusai-accent mt-1 text-center">PDF ile quizinizi yazdırabilir veya offline çözebilirsiniz. PDF oluşturduğunuz quizler geçmişinize kaydedilecek.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 