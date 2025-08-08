"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { UserRoundCheck, Compass, ScrollText } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
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

        {/* Kolom Informasi */}
        <section className="w-full max-w-2xl">
        <Card 
          className="relative border-4 shadow-2xl"
          style={{ 
            backgroundColor: "#f4e4bc",
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(101, 67, 33, 0.15) 3px, transparent 3px),
              radial-gradient(circle at 75% 75%, rgba(101, 67, 33, 0.1) 2px, transparent 2px),
              radial-gradient(circle at 60% 40%, rgba(101, 67, 33, 0.08) 4px, transparent 4px),
              radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.12) 2px, transparent 2px),
              radial-gradient(circle at 90% 20%, rgba(160, 82, 45, 0.1) 3px, transparent 3px),
              linear-gradient(45deg, rgba(139, 69, 19, 0.03) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(139, 69, 19, 0.03) 25%, transparent 25%),
              linear-gradient(0deg, rgba(101, 67, 33, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px, 30px 30px, 50px 50px, 35px 35px, 45px 45px, 60px 60px, 60px 60px, 80px 80px",
            borderStyle: "solid",
            borderColor: "#8B4513",
            borderImage: "linear-gradient(45deg, #8B4513, #654321, #A0522D, #8B4513) 1",
            boxShadow: `
              0 0 0 2px #654321,
              0 0 0 4px #8B4513,
              inset 0 0 20px rgba(139, 69, 19, 0.3),
              inset 0 0 40px rgba(101, 67, 33, 0.2),
              0 10px 30px rgba(0, 0, 0, 0.4)
            `
          }}
        >
          {/* Gulungan Atas */}
          <div className="absolute -top-4 left-0 right-0 h-8 flex justify-center z-20">
            <div 
              className="w-full h-8 rounded-t-full shadow-lg relative"
              style={{
                background: "linear-gradient(180deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)",
                boxShadow: "0 -2px 10px rgba(0,0,0,0.3), inset 0 2px 4px rgba(160,82,45,0.5)"
              }}
            >
              {/* Tekstur kayu gulungan atas */}
              <div 
                className="w-full h-full rounded-t-full opacity-30"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(90deg, 
                      rgba(101,67,33,0.3) 0px, 
                      rgba(101,67,33,0.3) 2px, 
                      transparent 2px, 
                      transparent 4px
                    )
                  `
                }}
              ></div>
              
              {/* Bulatan ujung kiri gulungan atas */}
              <div 
                className="absolute -left-4 top-1/2 w-8 h-8 rounded-full shadow-lg transform -translate-y-1/2"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #A0522D, #8B4513)",
                  boxShadow: "-2px 0 8px rgba(0,0,0,0.4), inset 2px 2px 4px rgba(160,82,45,0.3)"
                }}
              ></div>
              
              {/* Bulatan ujung kanan gulungan atas */}
              <div 
                className="absolute -right-4 top-1/2 w-8 h-8 rounded-full shadow-lg transform -translate-y-1/2"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #A0522D, #8B4513)",
                  boxShadow: "2px 0 8px rgba(0,0,0,0.4), inset -2px 2px 4px rgba(160,82,45,0.3)"
                }}
              ></div>
              
              {/* Tali pengikat gulungan atas */}
              <div className="absolute top-1/2 left-1/4 w-2 h-6 bg-amber-900 rounded-full transform -translate-y-1/2 opacity-60"></div>
              <div className="absolute top-1/2 right-1/4 w-2 h-6 bg-amber-900 rounded-full transform -translate-y-1/2 opacity-60"></div>
            </div>
          </div>

          {/* Gulungan Bawah */}
          <div className="absolute -bottom-4 left-0 right-0 h-8 flex justify-center z-20">
            <div 
              className="w-full h-8 rounded-b-full shadow-lg relative"
              style={{
                background: "linear-gradient(0deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(160,82,45,0.5)"
              }}
            >
              {/* Tekstur kayu gulungan bawah */}
              <div 
                className="w-full h-full rounded-b-full opacity-30"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(90deg, 
                      rgba(101,67,33,0.3) 0px, 
                      rgba(101,67,33,0.3) 2px, 
                      transparent 2px, 
                      transparent 4px
                    )
                  `
                }}
              ></div>
              
              {/* Bulatan ujung kiri gulungan bawah */}
              <div 
                className="absolute -left-4 top-1/2 w-8 h-8 rounded-full shadow-lg transform -translate-y-1/2"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #A0522D, #8B4513)",
                  boxShadow: "-2px 0 8px rgba(0,0,0,0.4), inset 2px -2px 4px rgba(160,82,45,0.3)"
                }}
              ></div>
              
              {/* Bulatan ujung kanan gulungan bawah */}
              <div 
                className="absolute -right-4 top-1/2 w-8 h-8 rounded-full shadow-lg transform -translate-y-1/2"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #A0522D, #8B4513)",
                  boxShadow: "2px 0 8px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(160,82,45,0.3)"
                }}
              ></div>
              
              {/* Tali pengikat gulungan bawah */}
              <div className="absolute top-1/2 left-1/4 w-2 h-6 bg-amber-900 rounded-full transform -translate-y-1/2 opacity-60"></div>
              <div className="absolute top-1/2 right-1/4 w-2 h-6 bg-amber-900 rounded-full transform -translate-y-1/2 opacity-60"></div>
            </div>
          </div>
          <CardHeader className="relative">
            {/* Decorative worn corners */}
            <div className="absolute top-1 left-1 w-6 h-6 border-l-3 border-t-3 border-amber-800 opacity-70"></div>
            <div className="absolute top-1 right-1 w-6 h-6 border-r-3 border-t-3 border-amber-800 opacity-70"></div>
            <div className="absolute bottom-1 left-1 w-6 h-6 border-l-3 border-b-3 border-amber-800 opacity-70"></div>
            <div className="absolute bottom-1 right-1 w-6 h-6 border-r-3 border-b-3 border-amber-800 opacity-70"></div>
            
            {/* Age spots and stains */}
            <div className="absolute top-3 left-8 w-3 h-3 rounded-full bg-amber-900 opacity-20"></div>
            <div className="absolute top-12 right-12 w-2 h-2 rounded-full bg-amber-800 opacity-25"></div>
            <div className="absolute bottom-8 left-20 w-4 h-2 rounded-full bg-amber-900 opacity-15"></div>
            <div className="absolute top-8 right-6 w-2 h-4 rounded-full bg-amber-800 opacity-20"></div>
            
            {/* Torn edge effects */}
            <div className="absolute top-0 left-16 w-8 h-1 bg-amber-900 opacity-30 transform -skew-x-12"></div>
            <div className="absolute bottom-0 right-20 w-6 h-1 bg-amber-800 opacity-25 transform skew-x-6"></div>
            
            <CardTitle className="text-center text-3xl font-bold mb-4 relative z-10" style={{ 
              color: "#603017",
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              fontFamily: "serif"
            }}>
              Day ke-3
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-6 relative">
            {/* Heavy aged paper effect with multiple layers */}
            <div className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.4) 2px, transparent 2px),
                  radial-gradient(circle at 80% 20%, rgba(101, 67, 33, 0.5) 3px, transparent 3px),
                  radial-gradient(circle at 40% 40%, rgba(160, 82, 45, 0.3) 2px, transparent 2px),
                  radial-gradient(circle at 70% 70%, rgba(139, 69, 19, 0.6) 1px, transparent 1px),
                  radial-gradient(circle at 10% 30%, rgba(101, 67, 33, 0.4) 2px, transparent 2px)
                `,
                backgroundSize: "60px 60px, 80px 80px, 40px 40px, 100px 100px, 70px 70px"
              }}
            ></div>
            
            {/* Water stains and age marks */}
            <div className="absolute top-4 right-8 w-12 h-8 rounded-full bg-amber-900 opacity-10 blur-sm"></div>
            <div className="absolute bottom-12 left-6 w-16 h-6 rounded-full bg-amber-800 opacity-8 blur-sm"></div>
            <div className="absolute top-16 left-12 w-8 h-12 rounded-full bg-amber-900 opacity-12 blur-md"></div>
            
            {/* Crease lines */}
            <div className="absolute top-0 left-1/3 w-px h-full bg-amber-800 opacity-20"></div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-amber-900 opacity-15"></div>
            
            {/* Informasi */}
            <div className="relative z-10">
              <div className="space-y-2" style={{ 
                color: "#603017",
                fontFamily: "serif",
                textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.2)",
                fontSize: "18px"
              }}>
                <p><strong>Materi:</strong> Algoritma dan Pemrograman Dasar</p>
                <p><strong>Waktu:</strong> 08.00 - 15.00 WIB</p>
                <p><strong>Ruangan:</strong> Lab Komputer 2</p>
              </div>
            </div>

            {/* Spek */}
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-3 text-left" style={{ 
                color: "#603017",
                fontFamily: "serif",
                textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.2)",
                fontSize: "18px"
              }}>Spek:</h3>
              <ul className="list-disc pl-5 space-y-2" style={{ 
                color: "#603017",
                fontFamily: "serif",
                textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.2)",
                fontSize: "18px"
              }}>
                <li>Laptop/Notebook</li>
                <li>Charger Laptop</li>
                <li>Mouse (Opsional)</li>
                <li>Buku Catatan dan Alat Tulis</li>
                <li>Botol Minum</li>
              </ul>
            </div>

            {/* Tombol Absen */}
            <div className="flex justify-center pt-4 relative z-10">
              <Link href="/absensi">
                <button 
                  className="px-6 py-3 rounded-md hover:opacity-90 transition font-medium flex items-center gap-2 shadow-lg text-white border-2 border-amber-800 transform hover:scale-105"
                  style={{ 
                    backgroundColor: "#603017",
                    fontFamily: "serif",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
                  }}
                >
                  <UserRoundCheck size={20} color="white" />
                  Absen Sekarang
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
      </div>
    </div>
  );
}