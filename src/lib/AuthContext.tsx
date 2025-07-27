"use client";
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  is_premium: boolean;
  premium_until?: string | null;
  gumroad_sale_id?: string | null;
  is_admin?: boolean;
}

type AuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  authState: AuthState;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [loading, setLoading] = useState(true);

  console.log('AuthContext: Component rendered with state:', {
    authState,
    hasUser: !!user,
    hasProfile: !!profile,
    loading
  });

  // Initialize auth state
  useEffect(() => {
    console.log('AuthContext: useEffect triggered');
    
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Starting initialization...');
        setLoading(true);
        setAuthState('loading');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('AuthContext: Session check result:', !!session?.user, session?.user?.email);
        
        if (error) {
          console.error('AuthContext: Session error:', error);
          setAuthState('error');
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('AuthContext: User found in session:', session.user.email);
          setUser(session.user);
          setAuthState('authenticated');
          setLoading(false);
          
          // Fetch or create profile
          await fetchOrCreateProfile(session.user);
        } else {
          console.log('AuthContext: No session found, setting unauthenticated');
          setAuthState('unauthenticated');
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
        setAuthState('error');
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthContext: User signed in');
          setUser(session.user);
          setAuthState('authenticated');
          setLoading(false);
          await fetchOrCreateProfile(session.user);
        } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          console.log('AuthContext: Clearing state due to auth change:', event);
          setUser(null);
          setProfile(null);
          setAuthState('unauthenticated');
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrCreateProfile = async (user: User) => {
    try {
      console.log('AuthContext: Fetching profile for user:', user.id);
      
      // Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('AuthContext: Error fetching profile:', fetchError);
        return;
      }

      if (existingProfile) {
        console.log('AuthContext: Existing profile found:', existingProfile);
        setProfile(existingProfile);
        return;
      }

      // Create new profile
      console.log('AuthContext: Creating new profile for user:', user.id);
      const newProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
        is_premium: false,
        is_admin: false
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (createError) {
        console.error('AuthContext: Error creating profile:', createError);
        return;
      }

      console.log('AuthContext: Profile created successfully:', createdProfile);
      setProfile(createdProfile);
    } catch (error) {
      console.error('AuthContext: Error in fetchOrCreateProfile:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('AuthContext: Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('AuthContext: Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('AuthContext: Starting sign out...');
      
      // First clear local state immediately
      console.log('AuthContext: Clearing local state immediately...');
      setUser(null);
      setProfile(null);
      setAuthState('unauthenticated');
      setLoading(false); // Clear loading immediately
      
      // Then call Supabase signOut
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Supabase signOut error:', error);
        // Don't throw error, local state is already cleared
      }
      
      console.log('AuthContext: Sign out completed successfully');
    } catch (error) {
      console.error('AuthContext: Sign out error:', error);
      // Don't throw error, local state is already cleared
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    authState,
    loading,
    signOut,
    signInWithGoogle,
    signUpWithGoogle
  };

  console.log('AuthContext: Current state:', {
    authState,
    hasUser: !!user,
    hasProfile: !!profile,
    loading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 