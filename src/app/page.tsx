"use client";

import Link from "next/link";
import { UserRoundCheck, Compass, ScrollText } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import UpcomingDayInfo from "@/components/UpcomingDayInfo";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect ke login jika belum login
    if (!loading && !user) {
      // Gunakan timeout untuk menghindari konflik navigasi
      const timer = setTimeout(() => {
        router.push('/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: "#603017" }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show loading (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: "#603017" }}>
            Redirecting...
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative">
      {/* Efek kompas di pojok */}
      <div className="fixed top-10 right-10 w-32 h-32 opacity-30 z-10">
        <Compass size={128} className="text-amber-800" />
      </div>
      
      {/* Efek gulungan di pojok kiri */}
      <div className="fixed bottom-10 left-10 w-24 h-24 opacity-35 z-10">
        <ScrollText size={96} className="text-amber-900" />
      </div>

      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        {/* Judul Web */}
        <h1 className="text-6xl font-extrabold mb-8 drop-shadow-lg" style={{ color: "#603017" }}>
          IS 2025
        </h1>

        {/* Upcoming Day Information */}
        <section className="w-full max-w-4xl">
          <UpcomingDayInfo />
        </section>
      </div>
    </div>
  );
}
