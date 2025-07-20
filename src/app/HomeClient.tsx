"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import { CheckCircleIcon, LightBulbIcon, AcademicCapIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const features = [
  {
    icon: LightBulbIcon,
    title: "Yapay Zeka Desteği",
    desc: "Soruların zorluk seviyesine ve performansına göre kişiselleştirilmiş quizler."
  },
  {
    icon: AcademicCapIcon,
    title: "Çıkmış Sorular",
    desc: "Gerçek TUS sınavlarından alınmış, güncel ve güvenilir soru havuzu."
  },
  {
    icon: CheckCircleIcon,
    title: "Anında Geri Bildirim",
    desc: "Cevaplarınızı anında görün, açıklamalarla öğrenin."
  },
  {
    icon: ShieldCheckIcon,
    title: "Güvenilir ve Türkçe",
    desc: "Tamamen Türkçe arayüz, güvenli ve gizliliğe önem veren platform."
  },
];

const steps = [
  {
    icon: UserGroupIcon,
    title: "Kayıt Ol",
    desc: "Hızlıca ücretsiz hesap oluşturun."
  },
  {
    icon: AcademicCapIcon,
    title: "Quiz Çöz",
    desc: "Çıkmış veya karışık sorulardan quiz seçin, çözmeye başlayın."
  },
  {
    icon: CheckCircleIcon,
    title: "Sonuçları İncele",
    desc: "Doğru ve yanlışlarınızı, açıklamalarla birlikte görün."
  },
];

export default function HomeClient() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user: _user, profile: _profile, loading: _loading } = useAuth();

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10 flex flex-col gap-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 py-12 px-6">
        <div className="flex items-center gap-3 mb-2">
          <Image src="/logo.svg" alt="TusAI Logo" width={48} height={48} className="flex-shrink-0" />
          <span className="font-semibold text-2xl text-gray-900 dark:text-white">TusAI</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-blue-600">
          TUS&apos;a Yapay Zeka ile Hazırlan
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
        Çıkmış sorular ve yapay zekâ destekli içeriklerle quiz çöz, eksiklerini keşfet, sıralamadaki yerini gör.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/kayit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 text-lg"
          >
            Ücretsiz Başla
          </Link>
          <a 
            href="/pricing" 
            className="text-blue-600 border border-blue-600 font-medium px-8 py-3 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-lg"
          >
            Premium&apos;a Geç
          </a>
        </div>
      </section>

      {/* Why TusAI Section */}
      <section className="flex flex-col items-center gap-8 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold mb-2 text-blue-600">Neden TusAI?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
              <f.icon className={`w-8 h-8 ${i % 2 === 0 ? 'text-blue-600' : 'text-purple-600'} flex-shrink-0`} aria-hidden="true" />
              <div className="text-left">
                <div className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{f.title}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="flex flex-col items-center gap-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold mb-2 text-blue-600">Nasıl Çalışır?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <s.icon className={`w-10 h-10 ${i === 0 ? 'text-blue-600' : i === 1 ? 'text-purple-600' : 'text-green-600'} mb-2`} aria-hidden="true" />
              <div className="font-semibold text-lg text-gray-900 dark:text-white">{s.title}</div>
              <div className="text-gray-600 dark:text-gray-300 text-sm text-center">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="flex flex-col items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-blue-600">TUS Adaylarının Güvendiği Platform</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-xl">
          1000+ TUS adayı tarafından güvenle kullanılan, yapay zeka destekli quiz platformu. Hemen ücretsiz deneyin ve sınava bir adım önde başlayın!
        </p>
      </section>
    </div>
  );
} 