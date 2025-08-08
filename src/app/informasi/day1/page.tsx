"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Compass, ScrollText } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Day1Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect ke login jika belum login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Jika masih loading, tampilkan loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
      </div>
    );
  }

  // Jika belum login, tampilkan loading (akan redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="w-full max-w-4xl mb-8">
          <h1 className="text-5xl font-extrabold text-center mb-4 drop-shadow-lg" style={{ color: "#603017" }}>
            Informasi Day 1
          </h1>
          <p className="text-xl text-center" style={{ color: "#8B4513", fontFamily: "serif" }}>
            Selamat datang di Hari Pertama - Materi dan Panduan
          </p>
        </div>

        {/* Content Cards */}
        <section className="w-full max-w-4xl grid gap-6 md:grid-cols-2">
          {/* Materi Hari 1 */}
          <Card 
            className="relative border-4 shadow-2xl"
            style={{ 
              backgroundColor: "#f4e4bc",
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(101, 67, 33, 0.15) 3px, transparent 3px),
                radial-gradient(circle at 75% 75%, rgba(101, 67, 33, 0.1) 2px, transparent 2px)
              `,
              borderStyle: "solid",
              borderColor: "#8B4513",
              boxShadow: `
                0 0 0 2px #654321,
                0 0 0 4px #8B4513,
                inset 0 0 20px rgba(139, 69, 19, 0.3),
                0 10px 30px rgba(0, 0, 0, 0.4)
              `
            }}
          >
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold" style={{ 
                color: "#603017",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                fontFamily: "serif"
              }}>
                📚 Materi Pembelajaran
              </CardTitle>
            </CardHeader>
            <CardContent style={{ color: "#603017", fontFamily: "serif" }}>
              <div className="space-y-4">
                <div className="p-4 bg-amber-100 rounded-lg border-2 border-amber-800">
                  <h3 className="font-semibold text-lg mb-2">Topik Hari Ini:</h3>
                  <ul className="space-y-2">
                    <li>• Pengenalan Framework dan Tools</li>
                    <li>• Setup Development Environment</li>
                    <li>• Best Practices</li>
                    <li>• Hands-on Workshop</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-600">
                  <h4 className="font-semibold mb-2">Jadwal:</h4>
                  <ul className="text-sm space-y-1">
                    <li>09:00 - 10:30: Sesi 1 - Pengenalan</li>
                    <li>10:30 - 10:45: Break</li>
                    <li>10:45 - 12:00: Sesi 2 - Setup</li>
                    <li>13:00 - 14:30: Sesi 3 - Workshop</li>
                    <li>14:30 - 15:00: Q&A dan Review</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Panduan dan Resources */}
          <Card 
            className="relative border-4 shadow-2xl"
            style={{ 
              backgroundColor: "#f4e4bc",
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(101, 67, 33, 0.15) 3px, transparent 3px),
                radial-gradient(circle at 75% 75%, rgba(101, 67, 33, 0.1) 2px, transparent 2px)
              `,
              borderStyle: "solid",
              borderColor: "#8B4513",
              boxShadow: `
                0 0 0 2px #654321,
                0 0 0 4px #8B4513,
                inset 0 0 20px rgba(139, 69, 19, 0.3),
                0 10px 30px rgba(0, 0, 0, 0.4)
              `
            }}
          >
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold" style={{ 
                color: "#603017",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                fontFamily: "serif"
              }}>
                🔧 Resources & Tools
              </CardTitle>
            </CardHeader>
            <CardContent style={{ color: "#603017", fontFamily: "serif" }}>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                  <h3 className="font-semibold text-lg mb-2">Tools yang Dibutuhkan:</h3>
                  <ul className="space-y-2">
                    <li>• Visual Studio Code</li>
                    <li>• Node.js (LTS Version)</li>
                    <li>• Git</li>
                    <li>• Browser (Chrome/Firefox)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-300">
                  <h4 className="font-semibold mb-2">Links Penting:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <a href="#" className="text-blue-600 hover:underline">Download Node.js</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">VS Code Extensions</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Git Tutorial</a></li>
                    <li>• <a href="#" className="text-blue-600 hover:underline">Documentation</a></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tugas Hari 1 */}
          <Card 
            className="relative border-4 shadow-2xl md:col-span-2"
            style={{ 
              backgroundColor: "#f4e4bc",
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(101, 67, 33, 0.15) 3px, transparent 3px),
                radial-gradient(circle at 75% 75%, rgba(101, 67, 33, 0.1) 2px, transparent 2px)
              `,
              borderStyle: "solid",
              borderColor: "#8B4513",
              boxShadow: `
                0 0 0 2px #654321,
                0 0 0 4px #8B4513,
                inset 0 0 20px rgba(139, 69, 19, 0.3),
                0 10px 30px rgba(0, 0, 0, 0.4)
              `
            }}
          >
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold" style={{ 
                color: "#603017",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                fontFamily: "serif"
              }}>
                📝 Tugas dan Assignment
              </CardTitle>
            </CardHeader>
            <CardContent style={{ color: "#603017", fontFamily: "serif" }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-400">
                  <h3 className="font-semibold text-lg mb-3">Tugas Praktik:</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>Setup development environment</li>
                    <li>Clone repository starter</li>
                    <li>Buat project sederhana</li>
                    <li>Deploy ke hosting platform</li>
                  </ol>
                  
                  <div className="mt-4 p-3 bg-yellow-100 rounded border">
                    <p className="font-semibold text-sm">⏰ Deadline:</p>
                    <p className="text-sm">Hari ini sebelum jam 17:00</p>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-400">
                  <h3 className="font-semibold text-lg mb-3">Kriteria Penilaian:</h3>
                  <ul className="space-y-2">
                    <li>✅ Environment setup lengkap</li>
                    <li>✅ Code bersih dan terstruktur</li>
                    <li>✅ Berhasil deploy</li>
                    <li>✅ Dokumentasi README</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-purple-100 rounded border">
                    <p className="font-semibold text-sm">📤 Submit:</p>
                    <p className="text-sm">Upload melalui platform tugas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer Navigation */}
        <div className="w-full max-w-4xl mt-8 flex justify-center">
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/informasi/day0')}
              className="px-6 py-3 rounded-md hover:opacity-90 transition font-medium shadow-lg border-2 border-amber-800"
              style={{ 
                backgroundColor: "transparent",
                color: "#603017",
                fontFamily: "serif"
              }}
            >
              ← Day 0
            </button>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-md hover:opacity-90 transition font-medium shadow-lg text-white border-2 border-amber-800"
              style={{ 
                backgroundColor: "#603017",
                fontFamily: "serif",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
              }}
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
