"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/lib/AdminAuthContext';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, adminLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!adminLoading) {
      // If not loading and no admin user, redirect to admin login
      if (!adminUser && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      // If admin user is logged in and on login page, redirect to admin dashboard
      else if (adminUser && pathname === '/admin/login') {
        router.push('/admin/dashboard');
      }
    }
  }, [adminUser, adminLoading, router, pathname]);

  // Show loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tusai mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // If not admin user and not on login page, don't render anything (will redirect)
  if (!adminUser && pathname !== '/admin/login') {
    return null;
  }

  // If admin user is logged in or on login page, render children
  return <>{children}</>;
} 