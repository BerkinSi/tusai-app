"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import FeatureGate from "../lib/FeatureGate";

export default function HomeClient() {
  const { user, profile, loading } = useAuth();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-tusai-light dark:bg-tusai-dark text-tusai-dark dark:text-tusai-light">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-xl">
        <Image
          className="mb-4"
          src="/logo.svg"
          alt="TusAI Logo"
          width={120}
          height={120}
          priority
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-center">TusAI</h1>
        <p className="text-lg text-center mb-4">
          Yapay Zeka Destekli TUS Hazırlık Asistanı
        </p>
        {!loading && !user && (
          <div className="flex gap-4 justify-center">
            <Link href="/giris" className="rounded-lg bg-tusai font-semibold text-white px-6 py-2 hover:bg-tusai-accent transition">
              Giriş Yap
            </Link>
            <Link href="/kayit" className="rounded-lg border border-tusai font-semibold text-tusai px-6 py-2 hover:bg-tusai-light hover:border-tusai-accent transition">
              Kayıt Ol
            </Link>
          </div>
        )}
        {!loading && user && (
          <div className="flex flex-col gap-2 items-center">
            <span>Hoş geldin, {profile?.full_name || user.email}!</span>
            <Link href="/quiz" className="rounded-lg bg-tusai font-semibold text-white px-6 py-2 hover:bg-tusai-accent transition">
              Quizlere Başla
            </Link>
            <FeatureGate premium>
              <div className="mt-4 p-4 border border-tusai-accent rounded bg-tusai-accent/10 text-tusai-accent w-full text-center">
                <strong>Quiz Geçmişi</strong> (Premium Özellik)
                <div className="text-xs mt-2">Tüm geçmiş quizlerinizi burada görebilirsiniz.</div>
              </div>
            </FeatureGate>
          </div>
        )}
      </main>
      <footer className="row-start-3 text-xs text-center opacity-70">
        © {new Date().getFullYear()} TusAI – TUS Hazırlık Asistanı
      </footer>
    </div>
  );
} 