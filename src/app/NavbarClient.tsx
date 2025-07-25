"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../lib/AuthContext";
import { useRef, useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon, Cog6ToothIcon, ChartBarIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

export default function NavbarClient() {
  const { user, profile, signOut, authState } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMenuOpen]);

  // Responsive breakpoint
  const navLinks = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/nasil-calisir", label: "Nasıl Çalışır?" },
    { href: "/sss", label: "SSS" },
    { href: "/pricing", label: "Fiyatlandırma" },
  ];

  // For non-logged in users
  if (authState === 'unauthenticated' && !user) {
    return (
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.svg" alt="TusAI Logo" width={32} height={32} className="flex-shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-white text-lg">TusAI</span>
            </Link>
          </div>
          {/* Desktop links */}
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex gap-3 items-center">
            <Link
              href="/giris"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 font-medium"
            >
              Kayıt Ol
            </Link>
          </div>
          {/* Hamburger for mobile */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Menüyü Aç/Kapat"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="flex flex-col gap-1 p-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <Link
                    href="/giris"
                    className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/kayit"
                    className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Kayıt Ol
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // For logged-in users
  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="TusAI Logo" width={32} height={32} className="flex-shrink-0" />
            <span className="font-semibold text-gray-900 dark:text-white text-lg">TusAI</span>
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
            <div ref={menuRef} className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-8 h-8 text-blue-600" />
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
                  <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">Premium</span>
                </Link>
                
                <Link 
                  href="/notes" 
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  Notlarım
                </Link>
                
                {/* Remove Yanlış Cevap Analizi link */}
                {/* <Link 
                  href="/analysis/wrong-answers" 
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ChartBarIcon className="w-4 h-4" />
                  Yanlış Cevap Analizi
                  {!profile?.is_premium && (
                    <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">Premium</span>
                  )}
                </Link> */}
                
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
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Logout button clicked!');
                    try {
                      console.log('Calling signOut...');
                      await signOut();
                      console.log('SignOut completed, redirecting...');
                      setIsMenuOpen(false);
                      // Force a page reload to ensure clean state
                      window.location.href = "/giris";
                    } catch (error) {
                      console.error('Logout error:', error);
                      // Still redirect even if there's an error
                      setIsMenuOpen(false);
                      window.location.href = "/giris";
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 cursor-pointer"
                  type="button"
                  style={{ zIndex: 1000 }}
                >
                  <UserIcon className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 