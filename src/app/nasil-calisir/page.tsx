import Head from "next/head";
import { AcademicCapIcon, CheckCircleIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import Image from "next/image";

const steps = [
  {
    icon: UserGroupIcon,
    title: "Kayıt Ol",
    desc: "Hızlıca ücretsiz hesap oluşturun ve platforma giriş yapın."
  },
  {
    icon: AcademicCapIcon,
    title: "Quiz Çöz",
    desc: "Çıkmış veya karışık sorulardan quiz seçin, çözmeye başlayın."
  },
  {
    icon: CheckCircleIcon,
    title: "Sonuçları İncele",
    desc: "Doğru ve yanlışlarınızı, açıklamalarla birlikte görün. Performansınızı takip edin."
  },
];

export default function NasilCalisirPage() {
  return (
    <>
      <Head>
        <title>Nasıl Çalışır? | TusAI</title>
        <meta name="description" content="TusAI ile TUS sınavına hazırlık sürecinizde yapay zeka destekli quizlerle nasıl daha verimli çalışabileceğinizi öğrenin." />
        <meta property="og:title" content="Nasıl Çalışır? | TusAI" />
        <meta property="og:description" content="TusAI ile TUS sınavına hazırlık sürecinizde yapay zeka destekli quizlerle nasıl daha verimli çalışabileceğinizi öğrenin." />
        <meta property="og:image" content="/logo.svg" />
      </Head>
      <div className="w-full max-w-3xl mx-auto px-4 py-12 flex flex-col gap-12">
        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-4">
          <Image src="/logo.svg" alt="TusAI Logo" width={60} height={60} className="mb-2" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-tusai-blue mb-2">Nasıl Çalışır?</h1>
          <p className="text-lg text-tusai-dark dark:text-tusai-light max-w-2xl mx-auto">
            TusAI ile TUS’a hazırlık sürecinizde başarıya ulaşmak çok kolay! Sadece 3 adımda, kişiselleştirilmiş ve güvenilir bir öğrenme deneyimi sizi bekliyor.
          </p>
        </section>

        {/* Steps */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white dark:bg-tusai-dark/80 shadow-sm">
              <s.icon className="w-10 h-10 text-tusai-teal mb-2" aria-hidden="true" />
              <div className="font-semibold text-lg text-tusai-dark dark:text-tusai-light">{s.title}</div>
              <div className="text-tusai-dark/80 dark:text-tusai-light/80 text-sm text-center">{s.desc}</div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
} 