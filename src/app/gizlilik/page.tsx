"use client";

export default function GizlilikPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-600 mb-8">📄 Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
      <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          TusAI olarak kişisel verilerinizi önemsiyor, güvenliğinizi en üst düzeyde tutuyoruz. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve yürürlükteki diğer yasal düzenlemelere uygun olarak hazırlanmıştır.
        </p>
        <h2 className="text-lg font-semibold mt-6 mb-2">🔐 1. Hangi Verileri Topluyoruz?</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li>İsim, soyisim (isteğe bağlı)</li>
          <li>E-posta adresi (zorunlu)</li>
          <li>Google hesabı ile giriş verileri</li>
          <li>Quiz geçmişiniz ve uygulama içi davranışlarınız</li>
          <li>Tercih ettiğiniz konular ve çalışma modları</li>
        </ul>
        <h2 className="text-lg font-semibold mt-6 mb-2">🎯 2. Veriler Ne Amaçla Kullanılır?</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li>Quiz ve açıklamaları kişiselleştirmek</li>
          <li>Performansınıza göre eksik olduğunuz konuları analiz etmek</li>
          <li>Üyelik ve abonelik işlemlerini yönetmek</li>
          <li>Teknik sorunları çözmek ve kullanıcı deneyimini iyileştirmek</li>
          <li>Yasal yükümlülüklerimizi yerine getirmek</li>
        </ul>
        <h2 className="text-lg font-semibold mt-6 mb-2">🤝 3. Veriler Kimlerle Paylaşılır?</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li>Yasal yükümlülükler nedeniyle resmi mercilerle</li>
          <li>Barındırma ve e-posta hizmetleri için güvenilir altyapı sağlayıcılarıyla (örn. Supabase, Vercel, Gmail)</li>
          <li>İstatistik ve analiz için anonimleştirilmiş verilerle</li>
        </ul>
        <h2 className="text-lg font-semibold mt-6 mb-2">🌍 4. Veriler Nerede Saklanır?</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Verileriniz, güvenli sunucularda ve Supabase altyapısında saklanır. Tüm veri aktarımı HTTPS üzerinden şifrelenerek gerçekleştirilir.
        </p>
        <h2 className="text-lg font-semibold mt-6 mb-2">🔄 5. Haklarınız Nelerdir?</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>Hangi verilerin işlendiğini ve nasıl kullanıldığını öğrenme</li>
          <li>Verilerin düzeltilmesini veya silinmesini talep etme</li>
          <li>Otomatik sistemler ile analiz edilen sonuçlara itiraz etme</li>
          <li>Gerekli hallerde yasal yollara başvurma</li>
        </ul>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Talepleriniz için bize <a href="mailto:support@tusai.app" className="text-blue-600 underline">support@tusai.app</a> adresinden ulaşabilirsiniz.
        </p>
        <h2 className="text-lg font-semibold mt-6 mb-2">🧾 6. Çerez (Cookie) Kullanımı</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          TusAI uygulaması yalnızca oturum ve güvenlik amaçlı çerezler kullanır. Takip veya reklam amaçlı çerezler kullanılmaz.
        </p>
        <h2 className="text-lg font-semibold mt-6 mb-2">⚙️ 7. Değişiklik Hakkı</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Gizlilik politikamızı zaman zaman güncelleyebiliriz. Önemli değişiklikler web sitemizde duyurulur.
        </p>
        <h2 className="text-lg font-semibold mt-6 mb-2">📬 İletişim</h2>
        <p className="mb-2 text-gray-700 dark:text-gray-300">Her türlü soru, görüş ve talepleriniz için:</p>
        <ul className="list-none pl-0 text-gray-700 dark:text-gray-300">
          <li><b>TusAI Ekibi</b></li>
          <li>📧 <a href="mailto:support@tusai.app" className="text-blue-600 underline">support@tusai.app</a></li>
          <li>🌐 <a href="https://tusai.app" className="text-blue-600 underline">https://tusai.app</a></li>
        </ul>
      </section>
    </div>
  );
} 