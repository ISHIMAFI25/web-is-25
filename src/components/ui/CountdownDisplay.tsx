// src/components/ui/CountdownDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface CountdownData {
  id: number;
  title: string;
  description: string;
  targetTime: string;
  showOnlyCountdown: boolean;
  isExpired: boolean;
  timeRemaining: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownDisplay() {
  const [countdownData, setCountdownData] = useState<CountdownData | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const { isAdmin, user, signOut } = useAuth(); // Tambah signOut function

  useEffect(() => {
    fetchCountdownStatus();
    const interval = setInterval(fetchCountdownStatus, 30000); // Update setiap 30 detik

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!countdownData || countdownData.isExpired) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(countdownData.targetTime).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Refresh data ketika countdown habis
        fetchCountdownStatus();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownData]);

  const fetchCountdownStatus = async () => {
    try {
      const response = await fetch('/api/countdown/status');
      const result = await response.json();

      if (result.success) {
        setCountdownData(result.data);
      }
    } catch (error) {
      console.error('Error fetching countdown status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return null; // Jangan tampilkan apa-apa saat loading
  }

  if (!countdownData) {
    return null; // Tidak ada countdown aktif
  }

  // Jika user belum login, jangan tampilkan countdown (agar bisa akses login page)
  if (!user) {
    return null;
  }

  if (countdownData.isExpired) {
    // Jika expired dan user belum login, jangan tampilkan
    if (!user) {
      return null;
    }
    
    // Jika admin, jangan tampilkan expired screen
    if (isAdmin) {
      return null;
    }
    
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50">
        <div className="text-center text-white p-8">
          <Clock className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{countdownData.title}</h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-6">Waktu telah tiba!</p>
          {countdownData.description && (
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">{countdownData.description}</p>
          )}
        </div>
      </div>
    );
  }

  // Mode countdown only - NORMAL LAYOUT (bukan fullscreen)
  if (countdownData.showOnlyCountdown && !isAdmin) {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 mr-2" />
              <h2 className="text-xl md:text-2xl font-bold">{countdownData.title}</h2>
            </div>
            
            {countdownData.description && (
              <p className="text-sm md:text-base text-white/90 mb-4 max-w-2xl mx-auto">
                {countdownData.description}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-md mx-auto">
              <div className="bg-white/20 rounded-lg p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{timeLeft.hours}</div>
                <div className="text-xs md:text-sm text-white/80">Jam</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{timeLeft.minutes}</div>
                <div className="text-xs md:text-sm text-white/80">Menit</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{timeLeft.seconds}</div>
                <div className="text-xs md:text-sm text-white/80">Detik</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode normal - banner di atas (hanya untuk non-admin atau jika admin ingin melihat preview)
  if (!isAdmin) {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 mr-2" />
              <h2 className="text-xl md:text-2xl font-bold">{countdownData.title}</h2>
            </div>
            
            {countdownData.description && (
              <p className="text-sm md:text-base text-white/90 mb-4 max-w-2xl mx-auto">
                {countdownData.description}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-md mx-auto">
              <div className="bg-white/20 rounded-lg p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{timeLeft.hours}</div>
                <div className="text-xs md:text-sm text-white/80">Jam</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{timeLeft.minutes}</div>
                <div className="text-xs md:text-sm text-white/80">Menit</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2 md:p-3">
                <div className="text-lg md:text-2xl font-bold">{timeLeft.seconds}</div>
                <div className="text-xs md:text-sm text-white/80">Detik</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin tidak melihat countdown di mode normal
  return null;
}