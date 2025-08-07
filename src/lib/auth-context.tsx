// src/lib/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  checkSession: async () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Fungsi untuk memeriksa apakah user adalah admin
  const checkAdminStatus = () => {
    if (typeof window !== 'undefined') {
      const adminCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('is-admin='))
        ?.split('=')[1] === 'true';
      setIsAdmin(adminCookie);
      return adminCookie;
    }
    return false;
  };

  // Fungsi untuk memeriksa session yang valid
  const checkSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        // Clear cookies jika session tidak valid
        if (typeof window !== 'undefined') {
          document.cookie = "is-admin=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
        return false;
      }

      setSession(session);
      setUser(session.user);
      checkAdminStatus();
      return true;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  };

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      setLoading(true);
      await checkSession();
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          // Clear admin cookie
          if (typeof window !== 'undefined') {
            document.cookie = "is-admin=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          }
        } else {
          setSession(session);
          setUser(session.user);
          checkAdminStatus();
        }
        setLoading(false);
      }
    );

    // Set up session monitoring interval
    const sessionCheckInterval = setInterval(async () => {
      if (!loading) {
        const isValid = await checkSession();
        if (!isValid && window.location.pathname !== '/login') {
          router.push('/login');
        }
      }
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear admin cookie
      if (typeof window !== 'undefined') {
        document.cookie = "is-admin=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signOut,
    checkSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
