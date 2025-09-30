// src/components/auth/CountdownModeGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';

interface CountdownModeGuardProps {
  children: React.ReactNode;
  allowedInCountdownMode?: boolean;
}

interface CountdownStatus {
  showOnlyCountdown?: boolean;
}

export default function CountdownModeGuard({ 
  children, 
  allowedInCountdownMode = false 
}: CountdownModeGuardProps) {
  const [countdownStatus, setCountdownStatus] = useState<CountdownStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkCountdownMode = async () => {
      try {
        const response = await fetch('/api/countdown/status');
        const result = await response.json();
        
        if (result.success && result.data) {
          setCountdownStatus(result.data);
          
          // Jika countdown mode aktif dan halaman ini tidak diizinkan
          if (result.data.showOnlyCountdown && !allowedInCountdownMode) {
            router.push('/');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking countdown mode:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCountdownMode();
  }, [allowedInCountdownMode, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Jika countdown mode aktif dan halaman tidak diizinkan, tampilkan pesan redirect
  if (countdownStatus?.showOnlyCountdown && !allowedInCountdownMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <Clock className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mode Countdown Aktif</h2>
          <p className="text-gray-600 mb-6">
            Halaman ini tidak tersedia saat mode countdown sedang aktif. 
            Anda akan dialihkan ke halaman utama.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}