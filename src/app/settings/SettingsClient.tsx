"use client";
import { useAuth } from '../../lib/AuthContext';
import { useState } from 'react';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  CreditCardIcon,
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function SettingsClient() {
  const { user, profile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would update the theme in localStorage and apply it
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tusai-dark dark:text-tusai-light mb-2">
          Ayarlar
        </h1>
        <p className="text-tusai-dark/60 dark:text-tusai-light/60">
          Hesap ayarlarınızı ve tercihlerinizi yönetin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Info */}
          <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow border border-tusai-light dark:border-tusai-dark p-6">
            <div className="flex items-center gap-4 mb-6">
              <UserIcon className="w-8 h-8 text-tusai-blue" />
              <div>
                <h2 className="text-xl font-semibold text-tusai-dark dark:text-tusai-light">Hesap Bilgileri</h2>
                <p className="text-tusai-dark/60 dark:text-tusai-light/60">Kişisel bilgileriniz</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tusai-dark dark:text-tusai-light mb-2">
                  E-posta
                </label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full px-3 py-2 border border-tusai-light dark:border-tusai-dark rounded bg-tusai-light dark:bg-tusai-dark/50 text-tusai-dark dark:text-tusai-light"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-tusai-dark dark:text-tusai-light mb-2">
                  Ad Soyad
                </label>
                <input 
                  type="text" 
                  value={profile?.full_name || ''} 
                  placeholder="Adınızı ve soyadınızı girin"
                  className="w-full px-3 py-2 border border-tusai-light dark:border-tusai-dark rounded focus:ring-2 focus:ring-tusai-blue focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Membership Status */}
          <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow border border-tusai-light dark:border-tusai-dark p-6">
            <div className="flex items-center gap-4 mb-6">
              <CreditCardIcon className="w-8 h-8 text-tusai-purple" />
              <div>
                <h2 className="text-xl font-semibold text-tusai-dark dark:text-tusai-light">Üyelik Durumu</h2>
                <p className="text-tusai-dark/60 dark:text-tusai-light/60">Premium özellikleriniz</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-tusai-light dark:bg-tusai-dark/50 rounded-lg">
              <div className="flex items-center gap-3">
                {profile?.is_premium ? (
                  <CheckCircleIcon className="w-6 h-6 text-tusai-teal" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-tusai-error" />
                )}
                <div>
                  <div className="font-semibold text-tusai-dark dark:text-tusai-light">
                    {profile?.is_premium ? 'Premium Üye' : 'Ücretsiz Üye'}
                  </div>
                  <div className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">
                    {profile?.is_premium 
                      ? `Premium üyeliğiniz ${profile.premium_until ? new Date(profile.premium_until).toLocaleDateString('tr-TR') : 'süresiz'} tarihine kadar geçerli`
                      : 'Premium özelliklere erişmek için yükseltin'
                    }
                  </div>
                </div>
              </div>
              
              {!profile?.is_premium && (
                <Link 
                  href="/pricing"
                  className="bg-tusai-purple text-white font-semibold px-4 py-2 rounded hover:bg-tusai-blue transition"
                >
                  Premium'a Geç
                </Link>
              )}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow border border-tusai-light dark:border-tusai-dark p-6">
            <div className="flex items-center gap-4 mb-6">
              <Cog6ToothIcon className="w-8 h-8 text-tusai-accent" />
              <div>
                <h2 className="text-xl font-semibold text-tusai-dark dark:text-tusai-light">Görünüm</h2>
                <p className="text-tusai-dark/60 dark:text-tusai-light/60">Tema tercihleriniz</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-tusai-dark dark:text-tusai-light">Karanlık Mod</div>
                <div className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">
                  Karanlık tema kullanın
                </div>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-tusai-blue' : 'bg-tusai-light dark:bg-tusai-dark/50'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                {isDarkMode ? (
                  <MoonIcon className="absolute right-1 w-3 h-3 text-white" />
                ) : (
                  <SunIcon className="absolute left-1 w-3 h-3 text-tusai-dark dark:text-tusai-light" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow border border-tusai-light dark:border-tusai-dark p-6">
            <h3 className="font-semibold text-tusai-dark dark:text-tusai-light mb-4">Hızlı İşlemler</h3>
            <div className="space-y-3">
              <Link 
                href="/quiz/new"
                className="block w-full text-center bg-tusai-blue text-white font-semibold px-4 py-2 rounded hover:bg-tusai-teal transition"
              >
                Yeni Quiz Oluştur
              </Link>
              <Link 
                href="/quiz/history"
                className="block w-full text-center bg-white border border-tusai-blue text-tusai-blue font-semibold px-4 py-2 rounded hover:bg-tusai-light transition"
              >
                Geçmiş Quizler
              </Link>
              <Link 
                href="/analysis"
                className="block w-full text-center bg-white border border-tusai-purple text-tusai-purple font-semibold px-4 py-2 rounded hover:bg-tusai-light transition"
              >
                Kişisel Analiz
              </Link>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow border border-tusai-light dark:border-tusai-dark p-6">
            <h3 className="font-semibold text-tusai-dark dark:text-tusai-light mb-4">Hesap İşlemleri</h3>
            <div className="space-y-3">
              <button className="block w-full text-left text-tusai-dark dark:text-tusai-light hover:text-tusai-blue transition">
                Şifre Değiştir
              </button>
              <button className="block w-full text-left text-tusai-dark dark:text-tusai-light hover:text-tusai-blue transition">
                Bildirim Ayarları
              </button>
              <button className="block w-full text-left text-tusai-error hover:text-tusai-error/80 transition">
                Hesabı Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 