"use client";

import Sidebar from "@/components/ui/sidebar";
import UpcomingDayInfo from "@/components/UpcomingDayInfo";
import AuthGuard from "@/components/auth/AuthGuard";
import Image from "next/image";

export default function HomePage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <div className="min-h-screen relative">
            
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

              {/* Teks "INTELLEKTULLE SCHULE" - Responsive */}
              <h1
                className="text-3xl md:text-4xl lg:text-6xl font-extrabold mb-6 md:mb-8 px-2"
                style={{ 
                  color: '#FFD700',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8), 4px 4px 8px rgba(0,0,0,0.6), 6px 6px 12px rgba(0,0,0,0.4)'
                }}
              >
                INTELLEKTULLE SCHULE 2025
              </h1>

              {/* Komponen UpcomingDayInfo */}
              <div className="w-full max-w-4xl">
                <UpcomingDayInfo />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
