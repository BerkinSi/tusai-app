"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [loading, setLoading] = useState(true);

  // Computed loading state - only true when we're actively loading
  const isLoading = authState === 'loading';

  useEffect(() => {
    console.log('AuthContext: Initializing auth state');
    setAuthState('loading');
    
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting session:', error);
          setAuthState('error');
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('AuthContext: User found, loading profile');
          setUser(session.user);
          // Don't set loading here, let loadUserProfile handle the state
          await loadUserProfile(session.user);
        } else {
          console.log('AuthContext: No user found');
          setAuthState('unauthenticated');
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthContext: Unexpected error during auth init:', error);
        setAuthState('error');
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    // TEMPORARILY DISABLED - causing loading issues
    /*
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Only reload if we don't have a user OR if we have a different user
        const isSameUser = user && user.id === session.user.id;
        const isAlreadyAuthenticated = authState === 'authenticated' && profile;
        
        if (!isSameUser && !isAlreadyAuthenticated) {
          console.log('AuthContext: New user signed in, loading profile');
          setAuthState('loading');
          setUser(session.user);
          await loadUserProfile(session.user);
        } else {
          console.log('AuthContext: Same user already authenticated, skipping re-load');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthContext: User signed out');
        setAuthState('unauthenticated');
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
    */
  }, []);

  const loadUserProfile = async (user: User) => {
    try {
      console.log('AuthContext: Loading profile for user:', user.id);
      setAuthState('loading'); // Set loading at the start
      
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('AuthContext: Error loading profile:', error);
        setAuthState('error');
        setLoading(false);
        return;
      }

      if (!existingProfile) {
        console.log('AuthContext: Creating new profile for user');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
            email: user.email,
            is_premium: false,
          })
          .select()
          .single();

        if (createError) {
          console.error('AuthContext: Error creating profile:', createError);
          setAuthState('error');
          setLoading(false);
          return;
        }

        setProfile(newProfile);
      } else {
        console.log('AuthContext: Profile loaded:', existingProfile.id);
        setProfile(existingProfile);
      }

      // Always set to authenticated when profile is loaded/created
      console.log('AuthContext: Setting state to authenticated');
      setAuthState('authenticated');
      setLoading(false);
    } catch (error) {
      console.error('AuthContext: Unexpected error loading profile:', error);
      setAuthState('error');
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('AuthContext: SignOut called');
    try {
      setAuthState('loading');
      
      // Clear local state immediately for better UX
      setUser(null);
      setProfile(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Error during signOut:', error);
        // Even if there's an error, we should still clear the state
        setAuthState('unauthenticated');
        setLoading(false);
        return;
      }
      
      setAuthState('unauthenticated');
      setLoading(false);
      console.log('AuthContext: SignOut completed successfully');
    } catch (error) {
      console.error('AuthContext: Unexpected error during signOut:', error);
      // Even if there's an error, clear the state
      setAuthState('unauthenticated');
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log('AuthContext: SignInWithGoogle called');
    try {
      setAuthState('loading');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('AuthContext: Error during Google sign in:', error);
        setAuthState('error');
        setLoading(false);
      }
    } catch (error) {
      console.error('AuthContext: Unexpected error during Google sign in:', error);
      setAuthState('error');
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    // Same as signInWithGoogle for OAuth
    return signInWithGoogle();
  };

  const value = {
    user,
    profile,
    authState,
    loading: isLoading,
    signOut,
    signInWithGoogle,
    signUpWithGoogle,
  };

  // Debug logging for auth state changes
  console.log('AuthContext: Current state:', {
    authState,
    hasUser: !!user,
    hasProfile: !!profile,
    loading: isLoading
  });

  return (
    <AuthContext.Provider value={value}>
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