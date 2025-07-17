import Link from "next/link";
import Image from "next/image";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tusai-light dark:bg-tusai-dark py-12">
      <div className="w-full max-w-2xl bg-white dark:bg-tusai-dark border border-tusai rounded-lg shadow-lg p-8 flex flex-col items-center">
        <Image src="/logo.svg" alt="TusAI Logo" width={64} height={64} className="mb-4" />
        <h1 className="text-3xl font-bold text-tusai mb-2 text-center">TusAI Üyelik Planları</h1>
        <p className="text-lg text-center mb-8">Yapay Zeka Destekli TUS Hazırlık Asistanı ile sınava bir adım önde başlayın.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {/* Free Plan */}
          <div className="border border-tusai rounded-lg p-6 flex flex-col bg-tusai-light/50 dark:bg-tusai-dark/50">
            <h2 className="text-xl font-bold mb-2 text-tusai">Ücretsiz</h2>
            <ul className="mb-4 text-sm space-y-2">
              <li>✔️ Günde 1 quiz</li>
              <li>✔️ Sınırlı açıklamalar</li>
              <li>❌ Quiz geçmişi kilitli</li>
              <li>❌ PDF olarak dışa aktarım yok</li>
            </ul>
            <Link href="/kayit" className="mt-auto bg-tusai text-white font-semibold py-2 rounded hover:bg-tusai-accent transition text-center">
              Ücretsiz Başla
            </Link>
          </div>
          {/* Premium Plan */}
          <div className="border-2 border-tusai-accent rounded-lg p-6 flex flex-col bg-tusai-accent/10 dark:bg-tusai-accent/20">
            <h2 className="text-xl font-bold mb-2 text-tusai-accent">Premium</h2>
            <ul className="mb-4 text-sm space-y-2">
              <li>✔️ Günde 5 quiz</li>
              <li>✔️ Tüm açıklamalara erişim</li>
              <li>✔️ Quiz geçmişi açık</li>
              <li>✔️ PDF olarak dışa aktarım</li>
            </ul>
            <a href="https://tusaiapp.gumroad.com/l/ofwbw" target="_blank" rel="noopener noreferrer" className="mt-auto bg-tusai-accent text-white font-semibold py-2 rounded hover:bg-tusai transition text-center">
              Premium’a Geç
            </a>
          </div>
        </div>
        <p className="text-xs text-center mt-8 opacity-70">Ödeme işlemleri güvenli olarak Gumroad üzerinden gerçekleşir.</p>
      </div>
    </div>
  );
} 