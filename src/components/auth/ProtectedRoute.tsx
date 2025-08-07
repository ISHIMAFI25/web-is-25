// src/components/auth/ProtectedRoute.tsx
'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, session, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Jika tidak ada user atau session, redirect ke login
      if (!user || !session) {
        router.push(redirectTo);
        return;
      }

      // Jika halaman memerlukan admin tapi user bukan admin
      if (requireAdmin && !isAdmin) {
        router.push('/'); // Redirect ke home
        return;
      }
    }
  }, [user, session, loading, isAdmin, requireAdmin, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || !session || (requireAdmin && !isAdmin)) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
