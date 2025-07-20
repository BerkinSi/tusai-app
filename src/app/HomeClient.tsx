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
    <div className="w-full max-w-4xl mx-auto px-4 py-10 flex flex-col gap-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 bg-white dark:bg-tusai-dark/80 rounded-xl shadow-lg py-10 px-4 border border-tusai-light dark:border-tusai-dark">
        <div className="flex items-center gap-3 mb-2">
          <Image src="/logo.svg" alt="TusAI Logo" width={48} height={48} className="flex-shrink-0" />
          <span className="font-bold text-2xl text-tusai-dark dark:text-tusai-light">TusAI</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 text-tusai-blue">
          Yapay Zeka ile TUS&apos;a Hazırlanmanın Yeni Yolu
        </h1>
        <p className="text-lg sm:text-xl text-tusai-dark dark:text-tusai-light max-w-2xl mx-auto mb-4">
          Çıkmış sorular ve akıllı quizlerle sınava daha bilinçli hazırlan. Üstelik tamamen Türkçe, mobil uyumlu ve kullanıcı dostu.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/kayit" className="bg-tusai-blue text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-tusai-teal transition text-lg focus:outline-none focus:ring-2 focus:ring-tusai-teal">
            Ücretsiz Başla
          </Link>
          <a href="/pricing" className="bg-white border border-tusai-blue text-tusai-blue font-semibold px-8 py-3 rounded-lg shadow hover:bg-tusai-light transition text-lg focus:outline-none focus:ring-2 focus:ring-tusai-blue">
            Premium&apos;a Geç
          </a>
        </div>
      </section>

      {/* Why TusAI Section */}
      <section className="flex flex-col items-center gap-8 bg-tusai-light dark:bg-tusai-dark/70 rounded-xl shadow p-8 border border-tusai-light dark:border-tusai-dark">
        <h2 className="text-2xl font-bold mb-2 text-tusai-blue">Neden TusAI?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-tusai-dark/80 border border-tusai-light dark:border-tusai-dark shadow-sm">
              <f.icon className={`w-8 h-8 ${i % 2 === 0 ? 'text-tusai-teal' : 'text-tusai-purple'} flex-shrink-0`} aria-hidden="true" />
              <div className="text-left">
                <div className="font-semibold text-lg mb-1 text-tusai-dark dark:text-tusai-light">{f.title}</div>
                <div className="text-tusai-dark/80 dark:text-tusai-light/80 text-sm">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="flex flex-col items-center gap-8 bg-white dark:bg-tusai-dark/80 rounded-xl shadow p-8 border border-tusai-light dark:border-tusai-dark">
        <h2 className="text-2xl font-bold mb-2 text-tusai-blue">Nasıl Çalışır?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-lg bg-tusai-light dark:bg-tusai-dark/70 border border-tusai-light dark:border-tusai-dark shadow-sm">
              <s.icon className={`w-10 h-10 ${i === 0 ? 'text-tusai-teal' : i === 1 ? 'text-tusai-blue' : 'text-tusai-purple'} mb-2`} aria-hidden="true" />
              <div className="font-semibold text-lg text-tusai-dark dark:text-tusai-light">{s.title}</div>
              <div className="text-tusai-dark/80 dark:text-tusai-light/80 text-sm text-center">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="flex flex-col items-center gap-4 bg-tusai-light dark:bg-tusai-dark/70 rounded-xl shadow p-6 border border-tusai-light dark:border-tusai-dark">
        <h2 className="text-xl font-bold text-tusai-blue">TUS Adaylarının Güvendiği Platform</h2>
        <p className="text-tusai-dark dark:text-tusai-light text-center max-w-xl">
          1000+ TUS adayı tarafından güvenle kullanılan, yapay zeka destekli quiz platformu. Hemen ücretsiz deneyin ve sınava bir adım önde başlayın!
        </p>
      </section>
    </div>
  );
} 