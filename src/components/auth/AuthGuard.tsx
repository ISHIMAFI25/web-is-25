// src/components/auth/AuthGuard.tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const AuthGuard = ({ 
  children, 
  requireAuth = true,
  requireAdmin = false, 
  redirectTo = '/login' 
}: AuthGuardProps) => {
  const { user, session, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not logged in
      if (requireAuth && (!user || !session)) {
        console.log('AuthGuard: No valid session, redirecting to login');
        router.push(redirectTo);
        return;
      }

      // If admin is required but user is not admin
      if (requireAdmin && (!isAdmin || !user)) {
        console.log('AuthGuard: Admin required but user is not admin, redirecting to home');
        router.push('/'); 
        return;
      }

      // If user is logged in but trying to access login page, redirect to appropriate page
      if (!requireAuth && user && window.location.pathname === '/login') {
        console.log('AuthGuard: User logged in but on login page, redirecting');
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
        return;
      }
    }
  }, [user, session, loading, isAdmin, requireAuth, requireAdmin, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-amber-800">Loading...</div>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (requireAuth && (!user || !session)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold text-amber-800">Redirecting...</div>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold text-amber-800">Access Denied</div>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default AuthGuard;
