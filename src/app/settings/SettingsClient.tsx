"use client";
import { useAuth } from '../../lib/AuthContext';
import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  CreditCardIcon,
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsClient() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/giris');
    }
  }, [user, router]);

  // Show loading or redirect if not authenticated
  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Yönlendiriliyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSubscriptionManagement = async () => {
    setIsLoading(true);
    try {
      // Redirect to Gumroad subscription management
      // You'll need to replace this with your actual Gumroad URL
      const gumroadUrl = `https://gumroad.com/account/subscriptions?email=${encodeURIComponent(user?.email || '')}`;
      window.open(gumroadUrl, '_blank');
    } catch (error) {
      console.error('Error opening subscription management:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Süresiz';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

      <div className="grid grid-cols-1 gap-6">
        {/* Main Settings */}
        <div className="space-y-6">
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

          {/* Enhanced Subscription Management */}
          <div className="bg-white dark:bg-tusai-dark/80 rounded-lg shadow border border-tusai-light dark:border-tusai-dark p-6">
            <div className="flex items-center gap-4 mb-6">
              <SparklesIcon className="w-8 h-8 text-tusai-purple" />
              <div>
                <h2 className="text-xl font-semibold text-tusai-dark dark:text-tusai-light">Üyelik Yönetimi</h2>
                <p className="text-tusai-dark/60 dark:text-tusai-light/60">Premium aboneliğinizi yönetin</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Current Status */}
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
                        ? `Premium üyeliğiniz ${formatDate(profile.premium_until || '')} tarihine kadar geçerli`
                        : 'Premium özelliklere erişmek için yükseltin'
                      }
                    </div>
                  </div>
                </div>
                
                {profile?.is_premium ? (
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4 text-tusai-dark/60 dark:text-tusai-light/60" />
                    <span className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">
                      {formatDate(profile.premium_until || '')}
                    </span>
                  </div>
                ) : (
                  <Link 
                    href="/pricing"
                    className="bg-tusai-purple text-white font-semibold px-4 py-2 rounded hover:bg-tusai-blue transition"
                  >
                    Premium&apos;a Geç
                  </Link>
                )}
              </div>

              {/* Subscription Management */}
              {profile?.is_premium && (
                <div className="border border-tusai-light dark:border-tusai-dark rounded-lg p-4">
                  <h3 className="font-semibold text-tusai-dark dark:text-tusai-light mb-3">
                    Abonelik Yönetimi
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm text-tusai-dark/60 dark:text-tusai-light/60">
                      Aboneliğinizi yönetmek, ödeme yöntemini değiştirmek veya iptal etmek için Gumroad hesabınıza gidin.
                    </div>
                    <button
                      onClick={handleSubscriptionManagement}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-tusai-blue text-white font-semibold px-4 py-2 rounded hover:bg-tusai-teal transition disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      )}
                      Aboneliği Yönet
                    </button>
                  </div>
                </div>
              )}

              {/* Premium Features Info */}
              <div className="bg-gradient-to-r from-tusai-purple/10 to-tusai-blue/10 border border-tusai-purple/20 rounded-lg p-4">
                <h3 className="font-semibold text-tusai-dark dark:text-tusai-light mb-2">
                  Premium Özellikler
                </h3>
                <ul className="text-sm text-tusai-dark/60 dark:text-tusai-light/60 space-y-1">
                  <li>• Günde 5 quiz oluşturma hakkı</li>
                  <li>• Detaylı açıklamalar ve analizler</li>
                  <li>• Zaman sınırlı quizler</li>
                  <li>• PDF indirme özelliği</li>
                  <li>• Kişiselleştirilmiş AI tavsiyeleri</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Enhanced Theme Settings */}
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-tusai-blue focus:ring-offset-2 ${
                  isDarkMode ? 'bg-tusai-blue' : 'bg-tusai-light dark:bg-tusai-dark/50'
                }`}
                aria-label={`${isDarkMode ? 'Disable' : 'Enable'} dark mode`}
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
      </div>
    </div>
  );
} 