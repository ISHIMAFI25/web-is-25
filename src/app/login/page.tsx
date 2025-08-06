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
      {/* Efek kompas di pojok */}
      <div className="fixed top-10 right-10 w-32 h-32 opacity-30 z-10">
        <Compass size={128} className="text-amber-800" />
      </div>
      
      {/* Efek gulungan di pojok kiri */}
      <div className="fixed bottom-10 left-10 w-24 h-24 opacity-35 z-10">
        <ScrollText size={96} className="text-amber-900" />
      </div>

      {/* Teks "INTELLEKTULLE SCHULE" dengan ukuran besar, tebal, dan warna kustom */}
      <h1
        className="text-6xl font-extrabold mb-8 drop-shadow-lg relative z-20"
        style={{ color: '#603017' }} // Inline style untuk warna masih diperlukan
      >
        INTELLEKTULLE SCHULE 2025
      </h1>
      {/* Menggunakan komponen LoginForm yang telah dibuat */}
      <div className="relative z-20">
        <LoginForm />
      </div>
    </div>
  );
}
