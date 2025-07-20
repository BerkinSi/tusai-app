"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../lib/AuthContext";
import { useState } from "react";
import { Bars3Icon, XMarkIcon, Cog6ToothIcon, ChartBarIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';

export default function NavbarClient() {
  const { user, profile, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // For non-logged in users
  if (!loading && !user) {
    return (
      <nav className="w-full flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image src="/logo.svg" alt="TusAI Logo" width={36} height={36} className="mr-2" />
          </Link>
          <span className="font-bold text-tusai-dark dark:text-tusai-light text-lg">TusAI</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/" className="hover:underline text-tusai-dark dark:text-tusai-light">Ana Sayfa</Link>
          <Link href="/nasil-calisir" className="hover:underline text-tusai-dark dark:text-tusai-light">Nasıl Çalışır?</Link>
          <Link href="/pricing" className="hover:underline text-tusai-dark dark:text-tusai-light">Fiyatlandırma</Link>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/giris" className="text-xs bg-tusai text-white px-3 py-1 rounded hover:bg-tusai-accent transition">Giriş Yap</Link>
          <Link href="/kayit" className="text-xs border border-tusai text-tusai px-3 py-1 rounded hover:bg-tusai-light hover:border-tusai-accent transition">Kayıt Ol</Link>
        </div>
      </nav>
    );
  }

  // For logged-in users
  return (
    <nav className="w-full flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Image src="/logo.svg" alt="TusAI Logo" width={36} height={36} className="mr-2" />
        </Link>
        <span className="font-bold text-tusai-dark dark:text-tusai-light text-lg">TusAI</span>
      </div>
      
      {/* Main action - New Quiz */}
      <div className="flex-1 flex justify-center">
        <Link 
          href="/quiz/new" 
          className="bg-tusai-blue text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-tusai-teal transition flex items-center gap-2"
        >
          <DocumentTextIcon className="w-5 h-5" />
          Yeni Quiz Oluştur
        </Link>
      </div>

      {/* Hamburger menu */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg hover:bg-tusai-light dark:hover:bg-tusai-dark/50 transition"
        >
          {isMenuOpen ? (
            <XMarkIcon className="w-6 h-6 text-tusai-dark dark:text-tusai-light" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-tusai-dark dark:text-tusai-light" />
          )}
        </button>

        {/* Dropdown menu */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-tusai-dark border border-tusai-light dark:border-tusai-dark rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-tusai-light dark:border-tusai-dark">
              <div className="flex items-center gap-3">
                <UserIcon className="w-8 h-8 text-tusai-blue" />
                <div>
                  <div className="font-semibold text-tusai-dark dark:text-tusai-light">
                    {profile?.full_name || user?.email}
                  </div>
                  <div className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">
                    {profile?.is_premium ? 'Premium Üye' : 'Ücretsiz Üye'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-tusai-light dark:hover:bg-tusai-dark/50 text-tusai-dark dark:text-tusai-light"
                onClick={() => setIsMenuOpen(false)}
              >
                <ChartBarIcon className="w-5 h-5" />
                Dashboard
              </Link>
              
              <Link 
                href="/quiz/history" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-tusai-light dark:hover:bg-tusai-dark/50 text-tusai-dark dark:text-tusai-light"
                onClick={() => setIsMenuOpen(false)}
              >
                <DocumentTextIcon className="w-5 h-5" />
                Geçmiş Quizler
                {!profile?.is_premium && (
                  <span className="ml-auto text-xs bg-tusai-purple text-white px-2 py-1 rounded">Premium</span>
                )}
              </Link>
              
              <Link 
                href="/analysis" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-tusai-light dark:hover:bg-tusai-dark/50 text-tusai-dark dark:text-tusai-light"
                onClick={() => setIsMenuOpen(false)}
              >
                <ChartBarIcon className="w-5 h-5" />
                Kişisel Analiz
                {!profile?.is_premium && (
                  <span className="ml-auto text-xs bg-tusai-purple text-white px-2 py-1 rounded">Premium</span>
                )}
              </Link>
              
              <Link 
                href="/analysis/wrong-answers" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-tusai-light dark:hover:bg-tusai-dark/50 text-tusai-dark dark:text-tusai-light"
                onClick={() => setIsMenuOpen(false)}
              >
                <ChartBarIcon className="w-5 h-5" />
                Yanlış Cevap Analizi
                {!profile?.is_premium && (
                  <span className="ml-auto text-xs bg-tusai-purple text-white px-2 py-1 rounded">Premium</span>
                )}
              </Link>
              
              <div className="border-t border-tusai-light dark:border-tusai-dark my-2"></div>
              
              <Link 
                href="/settings" 
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-tusai-light dark:hover:bg-tusai-dark/50 text-tusai-dark dark:text-tusai-light"
                onClick={() => setIsMenuOpen(false)}
              >
                <Cog6ToothIcon className="w-5 h-5" />
                Ayarlar
              </Link>
              
              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-tusai-error/10 text-tusai-error"
              >
                <UserIcon className="w-5 h-5" />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 