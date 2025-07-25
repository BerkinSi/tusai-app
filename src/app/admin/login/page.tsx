"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/AuthContext";
import { useRouter } from "next/navigation";

// Define admin emails - only these can access admin panel
const ADMIN_EMAILS = [
  'berkinsili@gmail.com',
  'ilkeeceadali@gmail.com'
];

export default function AdminLoginPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user) {
      // Check if user is admin
      if (ADMIN_EMAILS.includes(user.email || '')) {
        // User is admin, redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        // User is not admin, show access denied
        setIsChecking(false);
      }
    } else {
      // No user logged in, show login prompt
      setIsChecking(false);
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      // This will trigger the Google OAuth flow
      // The user will be redirected back here after login
      window.location.href = '/giris';
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (user && !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erişim Reddedildi</h1>
            <p className="text-gray-600 mb-4">
              Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </p>
            <p className="text-sm text-gray-500">
              Sadece yetkili yöneticiler bu alana erişebilir.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Girişi</h1>
          <p className="text-gray-600 mb-6">
            Yönetici paneline erişmek için Google hesabınızla giriş yapın.
          </p>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile Giriş Yap
          </button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Sadece yetkili yöneticiler giriş yapabilir.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 