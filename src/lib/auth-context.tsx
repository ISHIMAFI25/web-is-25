// src/lib/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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
  const checkAdminStatus = useCallback(() => {
    if (typeof window !== 'undefined') {
      const adminCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('is-admin='))
        ?.split('=')[1] === 'true';
      setIsAdmin(adminCookie);
      return adminCookie;
    }
    return false;
  }, []);

  // Fungsi untuk memeriksa session yang valid
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      // Pastikan Supabase client tersedia
      if (!supabase) {
        console.error('Supabase client not available');
        return false;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        // Clear cookies jika session tidak valid
        if (typeof window !== 'undefined') {
          document.cookie = "is-admin=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        }
        return false;
      }

      if (!session) {
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
      // Reset state on error
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      return false;
    }
  }, [checkAdminStatus]);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const initializeAuth = async () => {
      if (!mounted) return;
      setLoading(true);
      await checkSession();
      if (mounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
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

    // Set up session monitoring interval (only in browser)
    let sessionCheckInterval: NodeJS.Timeout | null = null;
    
    if (typeof window !== 'undefined') {
      sessionCheckInterval = setInterval(async () => {
        if (!loading && mounted) {
          try {
            const isValid = await checkSession();
            if (!isValid && window.location.pathname !== '/login') {
              console.log('Session invalid, redirecting to login');
              router.push('/login');
            }
          } catch (error) {
            console.error('Session check error:', error);
            // Force logout on error
            setSession(null);
            setUser(null);
            setIsAdmin(false);
            if (window.location.pathname !== '/login') {
              router.push('/login');
            }
          }
        }
      }, 30000); // Check every 30 seconds instead of 60
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, []); // Remove dependencies to avoid infinite loops

  const signOut = async () => {
    try {
      console.log('Starting logout process...');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signout error:', error);
      }
      
      // Clear all cookies
      if (typeof window !== 'undefined') {
        // Clear admin cookie
        document.cookie = "is-admin=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        
        // Clear all Supabase auth cookies
        const allCookies = document.cookie.split(';');
        allCookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('sb-') && name.includes('auth-token')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          }
        });
        
        // Clear localStorage
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Reset state
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      
      console.log('Logout complete, redirecting to login...');
      
      // Force redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even on error, clear local state and redirect
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      router.push('/login');
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
