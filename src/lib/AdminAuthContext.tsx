"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { adminSupabase } from './adminSupabaseClient';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  adminLoading: boolean;
  adminSignIn: (email: string, password: string) => Promise<{ error: any }>;
  adminSignOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    checkAdminSession();
    
    // Listen for auth changes
    const { data: { subscription } } = adminSupabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await checkAdminStatus();
        } else if (event === 'SIGNED_OUT') {
          setAdminUser(null);
        }
        setAdminLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminSession = async () => {
    try {
      const { data: { session } } = await adminSupabase.auth.getSession();
      if (session?.user) {
        await checkAdminStatus();
      }
    } catch (error) {
      console.error('Admin session check error:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const checkAdminStatus = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await adminSupabase.auth.getUser();
      if (!user) {
        setAdminUser(null);
        return false;
      }

      // Check if user is admin
      const { data: profile, error } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        setAdminUser(null);
        return false;
      }

      if (!profile.is_admin) {
        setAdminUser(null);
        return false;
      }

      const adminUser: AdminUser = {
        id: user.id,
        email: user.email || '',
        full_name: profile.full_name || '',
        is_admin: profile.is_admin
      };

      setAdminUser(adminUser);
      return true;
    } catch (error) {
      console.error('Admin status check error:', error);
      setAdminUser(null);
      return false;
    }
  };

  const adminSignIn = async (email: string, password: string) => {
    try {
      const { error } = await adminSupabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error };
      }

      // Check if user is admin
      const isAdmin = await checkAdminStatus();
      if (!isAdmin) {
        // Sign out if not admin
        await adminSupabase.auth.signOut();
        return { error: { message: 'Access denied. Admin privileges required.' } };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const adminSignOut = async () => {
    try {
      await adminSupabase.auth.signOut();
      setAdminUser(null);
    } catch (error) {
      console.error('Admin sign out error:', error);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminLoading,
        adminSignIn,
        adminSignOut,
        checkAdminStatus
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
} 