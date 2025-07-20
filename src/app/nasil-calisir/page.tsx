import Head from "next/head";
import { 
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/solid';
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: DocumentTextIcon,
    title: "Yapay Zeka Destekli Quizler",
    desc: "Kişiselleştirilmiş soru seçimi ile güçlü ve zayıf yanlarınıza odaklanın.",
    premium: false
  },
  {
    icon: ChartBarIcon,
    title: "Detaylı Performans Analizi",
    desc: "Konu bazında başarı oranlarınızı görün ve gelişim alanlarınızı belirleyin.",
    premium: true
  },
  {
    icon: ClockIcon,
    title: "Geçmiş Quiz Arşivi",
    desc: "Çözdüğünüz tüm quizleri tekrar inceleyin ve öğrenme sürecinizi takip edin.",
    premium: true
  },
  {
    icon: ArrowTrendingUpIcon,
    title: "İlerleme Takibi",
    desc: "Günlük, haftalık ve aylık performans grafiklerinizi görün.",
    premium: false
  },
  {
    icon: ExclamationTriangleIcon,
    title: "Yanlış Cevap Analizi",
    desc: "Yanlış cevapladığınız soruların detaylı açıklamalarını ve benzer soruları görün.",
    premium: true
  },
  {
    icon: Cog6ToothIcon,
    title: "Kişiselleştirilmiş Ayarlar",
    desc: "Quiz zorluk seviyesi, konu tercihleri ve bildirim ayarlarınızı yönetin.",
    premium: false
  }
];

const dashboardPreview = {
  totalQuizzes: 24,
  correctAnswers: 156,
  averageScore: 65,
  streakDays: 7
};

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
      <div className="w-full max-w-6xl mx-auto px-4 py-12 flex flex-col gap-16">
        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-6">
          <Image src="/logo.svg" alt="TusAI Logo" width={80} height={80} className="mb-2" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-tusai-blue mb-4">Nasıl Çalışır?</h1>
          <p className="text-xl text-tusai-dark dark:text-tusai-light max-w-3xl mx-auto">
            TusAI ile TUS&apos;a hazırlık sürecinizde başarıya ulaşmak çok kolay! Kişiselleştirilmiş ve güvenilir bir öğrenme deneyimi sizi bekliyor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/kayit" className="bg-tusai-blue text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-tusai-teal transition">
              Ücretsiz Başla
            </Link>
            <Link href="/pricing" className="bg-white border border-tusai-blue text-tusai-blue font-semibold px-8 py-3 rounded-lg shadow hover:bg-tusai-light transition">
              Premium Özellikler
            </Link>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="bg-white dark:bg-tusai-dark/80 rounded-xl shadow-lg border border-tusai-light dark:border-tusai-dark p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-tusai-dark dark:text-tusai-light mb-4">Dashboard Önizlemesi</h2>
            <p className="text-tusai-dark/60 dark:text-tusai-light/60">
              Kayıt olduktan sonra böyle bir dashboard ile performansınızı takip edebileceksiniz
            </p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 rounded-lg bg-tusai-light dark:bg-tusai-dark/50">
              <div className="text-2xl font-bold text-tusai-blue">{dashboardPreview.totalQuizzes}</div>
              <div className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">Toplam Quiz</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-tusai-light dark:bg-tusai-dark/50">
              <div className="text-2xl font-bold text-tusai-teal">{dashboardPreview.correctAnswers}</div>
              <div className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">Doğru Cevap</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-tusai-light dark:bg-tusai-dark/50">
              <div className="text-2xl font-bold text-tusai-purple">%{dashboardPreview.averageScore}</div>
              <div className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">Ortalama Skor</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-tusai-light dark:bg-tusai-dark/50">
              <div className="text-2xl font-bold text-tusai-accent">{dashboardPreview.streakDays}</div>
              <div className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">Günlük Seri</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 bg-tusai-blue text-white font-semibold px-6 py-4 rounded-lg flex items-center justify-center gap-3">
              <DocumentTextIcon className="w-6 h-6" />
              Yeni Quiz Oluştur
            </div>
            <div className="flex-1 bg-white border border-tusai-blue text-tusai-blue font-semibold px-6 py-4 rounded-lg flex items-center justify-center gap-3">
              <ClockIcon className="w-6 h-6" />
              Geçmiş Quizler
            </div>
          </div>

          {/* Recent Activity Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-tusai-light dark:border-tusai-dark rounded-lg p-4">
              <h3 className="font-semibold text-tusai-dark dark:text-tusai-light mb-3">Son Quizler</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-tusai-dark dark:text-tusai-light">Anatomi Quiz #12</span>
                  <span className="text-tusai-blue">%85</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tusai-dark dark:text-tusai-light">Fizyoloji Quiz #8</span>
                  <span className="text-tusai-blue">%72</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tusai-dark dark:text-tusai-light">Biokimya Quiz #5</span>
                  <span className="text-tusai-blue">%68</span>
                </div>
              </div>
            </div>
            <div className="border border-tusai-light dark:border-tusai-dark rounded-lg p-4">
              <h3 className="font-semibold text-tusai-dark dark:text-tusai-light mb-3">Geliştirilmesi Gereken Alanlar</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-tusai-dark dark:text-tusai-light">Kardiyoloji</span>
                  <span className="text-tusai-error">%45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tusai-dark dark:text-tusai-light">Nöroloji</span>
                  <span className="text-tusai-error">%52</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tusai-dark dark:text-tusai-light">Endokrinoloji</span>
                  <span className="text-tusai-error">%58</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-tusai-dark dark:text-tusai-light mb-4">Özellikler</h2>
            <p className="text-tusai-dark/60 dark:text-tusai-light/60">
              TusAI&apos;nin sunduğu tüm özellikler ve Premium avantajları
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow border border-tusai-light dark:border-tusai-dark p-6">
                <div className="flex items-start gap-4">
                  <feature.icon className={`w-8 h-8 ${feature.premium ? 'text-tusai-purple' : 'text-tusai-teal'} flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-tusai-dark dark:text-tusai-light">{feature.title}</h3>
                      {feature.premium && (
                        <span className="text-xs bg-tusai-purple text-white px-2 py-1 rounded">Premium</span>
                      )}
                    </div>
                    <p className="text-sm text-tusai-dark/80 dark:text-tusai-light/80">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-tusai-purple to-tusai-blue rounded-xl shadow p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Hemen Başlayın</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            TusAI ile TUS hazırlık sürecinizi daha verimli hale getirin. Yapay zeka destekli quizler ve detaylı analizlerle başarıya ulaşın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kayit" className="bg-white text-tusai-purple font-semibold px-8 py-3 rounded-lg hover:bg-tusai-light transition">
              Ücretsiz Hesap Oluştur
            </Link>
            <Link href="/pricing" className="border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition">
              Premium&apos;a Geç
            </Link>
          </div>
        </section>
      </div>
    </>
  );
} 