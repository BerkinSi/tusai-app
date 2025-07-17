export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tusai-light dark:bg-tusai-dark">
      <div className="bg-white dark:bg-tusai-dark border border-tusai rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-tusai">Sayfa Bulunamadı</h1>
        <p className="mb-4">Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <a href="/" className="bg-tusai text-white px-4 py-2 rounded font-semibold hover:bg-tusai-accent transition">Ana Sayfa&apos;ya Dön</a>
      </div>
    </div>
  );
} 