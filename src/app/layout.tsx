import '../app/globals.css';

import { AuthProvider } from '../lib/AuthContext';
import NavbarClient from './NavbarClient';
import Footer from './Footer';
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
          {/* Non-sticky header */}
          <header className="bg-white/95 dark:bg-tusai-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <NavbarClient />
          </header>
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
