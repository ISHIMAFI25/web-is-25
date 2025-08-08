// src/app/login/page.tsx
// Ini adalah Server Component secara default

import LoginForm from '@/components/auth/LoginForm'; // Mengimpor komponen LoginForm
import { Compass, ScrollText } from "lucide-react";

// Tidak perlu lagi mengimpor atau menginisialisasi font Cinzel di sini
// Hapus kode berikut:
// import { Cinzel } from 'next/font/google';
// const cinzel = Cinzel({ ... });

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center relative">
      {/* Efek kompas di pojok - Responsive */}
      <div className="fixed top-4 right-4 md:top-10 md:right-10 w-16 h-16 md:w-32 md:h-32 opacity-30 z-10">
        <Compass size={64} className="text-amber-800 md:w-32 md:h-32" />
      </div>
      
      {/* Efek gulungan di pojok kiri - Responsive */}
      <div className="fixed bottom-4 left-4 md:bottom-10 md:left-10 w-12 h-12 md:w-24 md:h-24 opacity-35 z-10">
        <ScrollText size={48} className="text-amber-900 md:w-24 md:h-24" />
      </div>

      {/* Teks "INTELLEKTULLE SCHULE" - Responsive */}
      <h1
        className="text-3xl md:text-4xl lg:text-6xl font-extrabold mb-6 md:mb-8 drop-shadow-lg relative z-20 px-2"
        style={{ color: '#603017' }}
      >
        INTELLEKTULLE SCHULE 2025
      </h1>
      {/* LoginForm container - Better mobile spacing */}
      <div className="relative z-20 w-full max-w-sm md:max-w-lg px-4">
        <LoginForm />
      </div>
    </div>
  );
}
