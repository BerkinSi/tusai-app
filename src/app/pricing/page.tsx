import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const plans = [
  {
    name: "Ücretsiz",
    price: "0 TL",
    features: [
      { text: "Günde 1 quiz", included: true },
      { text: "Sınırlı açıklamalar", included: true },
      { text: "Quiz geçmişi kilitli", included: false },
      { text: "PDF olarak dışa aktarım yok", included: false },
    ],
    cta: { text: "Ücretsiz Başla", href: "/kayit", style: "primary" },
  },
  {
    name: "Premium",
    price: "99 TL/ay",
    features: [
      { text: "Günde 5 quiz", included: true },
      { text: "Tüm açıklamalara erişim", included: true },
      { text: "Quiz geçmişi açık", included: true },
      { text: "PDF olarak dışa aktarım", included: true },
    ],
    cta: { text: "Premium’a Geç", href: "https://tusaiapp.gumroad.com/l/ofwbw", style: "secondary", external: true },
  },
];

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Fiyatlandırma | TusAI</title>
        <meta name="description" content="TusAI ile TUS sınavına hazırlık için ücretsiz ve premium üyelik seçenekleri. Yapay zeka destekli quizlerle sınava bir adım önde başlayın." />
        <meta property="og:title" content="Fiyatlandırma | TusAI" />
        <meta property="og:description" content="TusAI ile TUS sınavına hazırlık için ücretsiz ve premium üyelik seçenekleri. Yapay zeka destekli quizlerle sınava bir adım önde başlayın." />
        <meta property="og:image" content="/logo.svg" />
      </Head>
      <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-12">
        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-4">
          <Image src="/logo.svg" alt="TusAI Logo" width={60} height={60} className="mb-2" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-tusai-blue mb-2">TusAI Üyelik Planları</h1>
          <p className="text-lg text-tusai-dark dark:text-tusai-light max-w-2xl mx-auto">
            Yapay Zeka Destekli TUS Hazırlık Asistanı ile sınava bir adım önde başlayın. Ücretsiz ve Premium seçenekleriyle, ihtiyacınıza uygun çözüm.
          </p>
        </section>

        {/* Pricing Table */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
          {plans.map((plan, idx) => (
            <div key={plan.name} className={`flex flex-col rounded-xl shadow-lg p-8 bg-white/90 dark:bg-tusai-dark/90 border ${idx === 1 ? 'border-tusai-blue' : 'border-tusai-light'}`}>
              <h2 className="text-xl font-bold mb-1 text-tusai-blue">{plan.name}</h2>
              <div className="text-3xl font-extrabold mb-4 text-tusai-dark dark:text-tusai-light">{plan.price}</div>
              <ul className="flex-1 mb-6 space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-tusai-dark dark:text-tusai-light">
                    {f.included ? (
                      <CheckCircleIcon className="w-5 h-5 text-tusai-teal" aria-hidden="true" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-tusai-error" aria-hidden="true" />
                    )}
                    <span className={f.included ? '' : 'line-through opacity-60'}>{f.text}</span>
                  </li>
                ))}
              </ul>
              {plan.cta.external ? (
                <a href={plan.cta.href} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-tusai-blue text-white font-semibold py-2 rounded-lg shadow hover:bg-tusai-purple transition text-lg">
                  {plan.cta.text}
                </a>
              ) : (
                <Link href={plan.cta.href} className="block w-full text-center bg-tusai-blue text-white font-semibold py-2 rounded-lg shadow hover:bg-tusai-purple transition text-lg">
                  {plan.cta.text}
                </Link>
              )}
            </div>
          ))}
        </section>

        {/* Trust Section */}
        <section className="flex flex-col items-center gap-2 mt-8">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-tusai-teal" aria-hidden="true" />
            <span className="font-semibold text-tusai-dark dark:text-tusai-light">1000+ TUS adayı tarafından güveniliyor</span>
          </div>
          <p className="text-xs text-tusai-dark/80 dark:text-tusai-light/80">Ödeme işlemleri güvenli olarak Gumroad üzerinden gerçekleşir.</p>
        </section>
      </div>
    </>
  );
} 