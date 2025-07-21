"use client";

export default function IletisimPage() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-12 flex flex-col gap-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-600 mb-8">İletişim</h1>
      <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          TusAI ekibi olarak her türlü soru, görüş ve önerinizi duymaktan memnuniyet duyarız. Size yardımcı olmak için buradayız!
        </p>
        <ul className="list-none pl-0 text-gray-700 dark:text-gray-300 mb-4">
          <li className="mb-2">
            <span className="font-semibold">Destek:</span> <a href="mailto:support@tusai.app" className="text-blue-600 underline">support@tusai.app</a>
          </li>
          <li>
            <span className="font-semibold">Genel Bilgi:</span> <a href="mailto:info@tusai.app" className="text-blue-600 underline">info@tusai.app</a>
          </li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300">
          Size en kısa sürede geri dönüş yapmaya çalışacağız. Teşekkürler!
        </p>
      </section>
    </div>
  );
} 