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
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="TusAI Logo" width={32} height={32} className="flex-shrink-0" />
            <span className="font-bold text-tusai-dark dark:text-tusai-light text-lg">TusAI</span>
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/" className="hover:underline text-tusai-dark dark:text-tusai-light">Ana Sayfa</Link>
          <Link href="/nasil-calisir" className="hover:underline text-tusai-dark dark:text-tusai-light">Nasıl Çalışır?</Link>
          <Link href="/pricing" className="hover:underline text-tusai-dark dark:text-tusai-light">Fiyatlandırma</Link>
        </div>
        <div className="flex gap-3 items-center">
          <Link 
            href="/giris" 
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            Giriş Yap
          </Link>
          <Link 
            href="/kayit" 
            className="text-sm bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            Kayıt Ol
          </Link>
        </div>
      </nav>
    );
  }

  // For logged-in users
  return (
    <nav className="w-full flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="TusAI Logo" width={32} height={32} className="flex-shrink-0" />
          <span className="font-bold text-tusai-dark dark:text-tusai-light text-lg">TusAI</span>
        </Link>
      </div>
      
      {/* Main action - New Quiz */}
      <div className="flex-1 flex justify-center">
        <Link 
          href="/quiz/new" 
          className="bg-black dark:bg-white text-white dark:text-black font-medium px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <DocumentTextIcon className="w-4 h-4" />
          Yeni Quiz Oluştur
        </Link>
      </div>

      {/* Hamburger menu */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          {isMenuOpen ? (
            <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Dropdown menu */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <UserIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {profile?.full_name || user?.email}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {profile?.is_premium ? 'Premium Üye' : 'Ücretsiz Üye'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <ChartBarIcon className="w-4 h-4" />
                Dashboard
              </Link>
              
              <Link 
                href="/quiz/history" 
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <DocumentTextIcon className="w-4 h-4" />
                Geçmiş Quizler
                {!profile?.is_premium && (
                  <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">Premium</span>
                )}
              </Link>
              
              <Link 
                href="/analysis" 
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <ChartBarIcon className="w-4 h-4" />
                Kişisel Analiz
                {!profile?.is_premium && (
                  <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">Premium</span>
                )}
              </Link>
              
              <Link 
                href="/analysis/wrong-answers" 
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <ChartBarIcon className="w-4 h-4" />
                Yanlış Cevap Analizi
                {!profile?.is_premium && (
                  <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">Premium</span>
                )}
              </Link>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              
              <Link 
                href="/settings" 
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <Cog6ToothIcon className="w-4 h-4" />
                Ayarlar
              </Link>
              
              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              >
                <UserIcon className="w-4 h-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 