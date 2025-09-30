// src/components/HomeContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';
import UpcomingDayInfo from '@/components/UpcomingDayInfo';

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

export default function HomeContent() {
  const [countdownData, setCountdownData] = useState<CountdownData | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const { isAdmin, user } = useAuth();

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
        const totalHours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({
          days: 0, // We'll include days in hours
          hours: totalHours,
          minutes: minutes,
          seconds: seconds
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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

  // Jika countdown mode aktif dan user bukan admin
  const showCountdownMode = countdownData && countdownData.showOnlyCountdown && !isAdmin;

  return (
    <div 
      className="min-h-screen relative"
      style={showCountdownMode ? {
        backgroundImage: 'url("/hari-kemenangan.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      {/* Dark overlay untuk countdown mode */}
      {showCountdownMode && (
        <div className="absolute inset-0 bg-black/40 z-0"></div>
      )}
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">
        {/* Logo */}
        <div className="mb-6 md:mb-8">
          <Image
            src="/logois.png"
            alt="Logo"
            width={100}
            height={100}
            className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain"
            priority
          />
        </div>

        {/* Teks "INTELLEKTULLE SCHULE" */}
        <h1
          className={`text-3xl md:text-4xl lg:text-6xl font-extrabold mb-6 md:mb-8 px-2 ${
            showCountdownMode ? 'text-white' : ''
          }`}
          style={showCountdownMode ? { 
            textShadow: '2px 2px 4px rgba(0,0,0,0.8), 4px 4px 8px rgba(0,0,0,0.6), 6px 6px 12px rgba(0,0,0,0.4)'
          } : { 
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8), 4px 4px 8px rgba(0,0,0,0.6), 6px 6px 12px rgba(0,0,0,0.4)'
          }}
        >
          INTELLEKTUELLE SCHULE 2025
        </h1>

        {/* Countdown di bawah title jika countdown mode aktif */}
        {showCountdownMode && countdownData && !countdownData.isExpired && (
          <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 mr-2 text-white" />
              <h2 className="text-xl md:text-2xl font-bold text-white">{countdownData.title}</h2>
            </div>
            
            {countdownData.description && (
              <p className="text-sm md:text-base text-white/90 mb-6 max-w-2xl mx-auto">
                {countdownData.description}
              </p>
            )}

            <div className="flex justify-center items-center">
              <div className="text-6xl md:text-8xl lg:text-9xl font-bold text-white font-mono tracking-wider">
                {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        )}

        {/* Konten Day Info - hanya tampil jika bukan countdown mode atau jika admin */}
        {(!showCountdownMode || isAdmin) && (
          <div className="w-full max-w-4xl">
            <UpcomingDayInfo />
          </div>
        )}
      </div>
    </div>
  );
}