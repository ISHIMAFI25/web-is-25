"use client";

import Sidebar from "@/components/ui/sidebar";
import UpcomingDayInfo from "@/components/UpcomingDayInfo";
import AuthGuard from "@/components/auth/AuthGuard";

export default function HomePage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-16">
          <div className="min-h-screen relative">
            
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 text-center">

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
              <UpcomingDayInfo />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
