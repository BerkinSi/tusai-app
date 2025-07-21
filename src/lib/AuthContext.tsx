"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  premium_until?: string | null;
  gumroad_sale_id?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await handleUserProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    // Initial load
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        await handleUserProfile(data.user);
      } else {
        setLoading(false);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleUserProfile = async (user: User) => {
    setLoading(true);
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create profile for new users (especially OAuth users)
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          is_premium: false,
        })
        .select()
        .single();
      
      setProfile(newProfile);
    } else {
      setProfile(existingProfile);
    }
    
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      console.error('Google sign in error:', error);
    }
  };

  const signUpWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      console.error('Google sign up error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, signInWithGoogle, signUpWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 