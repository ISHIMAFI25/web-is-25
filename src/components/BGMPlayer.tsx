"use client";

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX } from 'lucide-react';

export default function BGMPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAttemptedPlay, setHasAttemptedPlay] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  const pathname = usePathname();

  // Cek apakah berada di halaman admin atau login
  const isAdminPage = pathname?.startsWith('/admin') || isAdmin;
  const isLoginPage = pathname?.startsWith('/login');
  const shouldNotPlayBGM = isAdminPage || isLoginPage;

  // Effect untuk setup audio properties
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set properties audio
    audio.volume = 0.3; // Volume 30%
    audio.loop = true;
    audio.preload = 'auto';
  }, []);

  // Effect untuk handle autoplay berdasarkan auth status
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Jika di halaman admin atau login, stop BGM
    if (shouldNotPlayBGM) {
      audio.pause();
      setHasAttemptedPlay(false);
      return;
    }

    // Skip jika masih loading TAPI set fallback timer
    if (loading) {
      // Fallback: Coba play setelah 3 detik meski masih loading
      const fallbackTimer = setTimeout(() => {
        if (audio.paused && !shouldNotPlayBGM) {
          audio.play().catch(() => {/* Silent fail */});
        }
      }, 3000);
      return () => clearTimeout(fallbackTimer);
    }

    // Jika user authenticated, selalu coba play BGM
    if (user) {
      const playBGM = async () => {
        try {
          if (audio.paused) { // Hanya play jika sedang paused
            await audio.play();
          }
          setHasAttemptedPlay(true);
        } catch (error) {
          setHasAttemptedPlay(true);
        }
      };

      // Minimal delay untuk DOM ready
      const timer = setTimeout(playBGM, 100);
      return () => clearTimeout(timer);
    } else if (!loading) {
      // Jika tidak ada user dan tidak loading, stop BGM
      setHasAttemptedPlay(false);
      audio.pause();
    }
  }, [user, isAdminPage, loading]);

  // Effect untuk aggressive fallback jika auth terlalu lama
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || shouldNotPlayBGM) return;

    // Aggressive fallback: Start BGM setelah 5 detik meski auth belum ready
    const aggressiveTimer = setTimeout(() => {
      if (audio.paused && !shouldNotPlayBGM) {
        audio.play().catch(() => {/* Silent fail */});
      }
    }, 5000);

    return () => clearTimeout(aggressiveTimer);
  }, [shouldNotPlayBGM]);

  // Effect untuk handle user interaction fallback
  useEffect(() => {
    if (hasAttemptedPlay || shouldNotPlayBGM) return;

    const handleUserInteraction = async () => {
      const audio = audioRef.current;
      if (!audio || shouldNotPlayBGM) return;

      try {
        if (audio.paused) {
          await audio.play();
          setHasAttemptedPlay(true);
        }
        
        // Remove listeners after successful play
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      } catch (error) {
        // Silent fail
      }
    };

    // Add interaction listeners
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [hasAttemptedPlay, shouldNotPlayBGM]);



  // Handle mute/unmute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  // Jika di halaman admin atau login, tidak render control
  if (shouldNotPlayBGM) return null;

  return (
    <>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src="/bgm_mars_himafi.mp3"
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* BGM Control (Fixed Position) */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className="bg-black/70 text-white p-3 rounded-full hover:bg-black/80 transition-all duration-200 backdrop-blur-sm"
          title={isMuted ? 'Unmute BGM' : 'Mute BGM'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  );
}