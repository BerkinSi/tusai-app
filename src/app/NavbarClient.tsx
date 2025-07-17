"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../lib/AuthContext";

export default function NavbarClient() {
  const { user, profile, signOut, loading } = useAuth();
  return (
    <nav className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-tusai-dark border-b border-tusai/20">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src="/logo.svg" alt="TusAI Logo" width={36} height={36} className="mr-2" />
        </Link>
        <span className="font-bold text-tusai text-lg">TusAI</span>
      </div>
      <div className="flex gap-4 items-center">
        <Link href="/" className="hover:underline">Ana Sayfa</Link>
        <Link href="/quiz" className="hover:underline">Quizler</Link>
        <Link href="/pricing" className="hover:underline">Fiyatlandırma</Link>
      </div>
      <div className="flex gap-2 items-center">
        {loading ? null : user ? (
          <>
            <span className="text-sm font-medium text-tusai-accent mr-2">{profile?.full_name || user.email}</span>
            <button onClick={signOut} className="text-xs bg-tusai-accent text-white px-3 py-1 rounded hover:bg-tusai transition">Çıkış Yap</button>
          </>
        ) : (
          <>
            <Link href="/giris" className="text-xs bg-tusai text-white px-3 py-1 rounded hover:bg-tusai-accent transition">Giriş Yap</Link>
            <Link href="/kayit" className="text-xs border border-tusai text-tusai px-3 py-1 rounded hover:bg-tusai-light hover:border-tusai-accent transition">Kayıt Ol</Link>
          </>
        )}
      </div>
    </nav>
  );
} 