import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.svg" alt="TusAI Logo" width={32} height={32} className="flex-shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-white text-lg">TusAI</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 max-w-md">
              TUS sınavına hazırlanan uzman doktor adayları için yapay zeka destekli quizlerle kişiselleştirilmiş öğrenme deneyimi.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>© {new Date().getFullYear()} TusAI</span>
              <span>•</span>
              <a href="mailto:destek@tusai.app" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                destek@tusai.app
              </a>
            </div>
          </div>

          {/* Useful Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Yararlı Bağlantılar</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/sss" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  SSS
                </Link>
              </li>
              <li>
                <Link 
                  href="/gizlilik" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Gizlilik ve KVK
                </Link>
              </li>
              <li>
                <Link 
                  href="/iletisim" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/nasil-calisir" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Fiyatlandırma
                </Link>
              </li>
              <li>
                <Link 
                  href="/kayit" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
} 