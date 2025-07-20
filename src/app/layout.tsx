import '../app/globals.css';

import { AuthProvider } from '../lib/AuthContext';
import NavbarClient from './NavbarClient';
import { Geist, Geist_Mono } from 'next/font/google';
import Head from 'next/head';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <Head>
        <title>Yapay Zeka Destekli TUS Hazırlık Uygulaması | TusAI</title>
        <meta name="description" content="TusAI, TUS sınavına hazırlanan uzman doktor adayları için yapay zeka destekli quizlerle kişiselleştirilmiş bir öğrenme deneyimi sunar. Hemen ücretsiz deneyin!" />
        <meta property="og:title" content="Yapay Zeka Destekli TUS Hazırlık Uygulaması | TusAI" />
        <meta property="og:description" content="TusAI, TUS sınavına hazırlanan uzman doktor adayları için yapay zeka destekli quizlerle kişiselleştirilmiş bir öğrenme deneyimi sunar. Hemen ücretsiz deneyin!" />
        <meta property="og:image" content="/logo.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-tusai-light dark:bg-tusai-dark text-tusai-dark dark:text-tusai-light`}>
        <AuthProvider>
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-tusai-dark/95 shadow-md border-b border-tusai-light dark:border-tusai-dark">
            <NavbarClient />
          </header>
          <main className="min-h-[80vh] flex flex-col items-center justify-center w-full">
            {children}
          </main>
          <footer className="w-full py-8 px-4 bg-tusai-light dark:bg-tusai-dark border-t border-tusai-light dark:border-tusai-dark text-center text-xs text-tusai-dark dark:text-tusai-light">
            © {new Date().getFullYear()} TusAI – TUS Hazırlık Asistanı | <a href="mailto:destek@tusai.app" className="underline">destek@tusai.app</a>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
