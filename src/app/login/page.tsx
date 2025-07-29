// src/app/login/page.tsx
// Ini adalah Server Component secara default

import LoginForm from '@/components/auth/LoginForm'; // Mengimpor komponen LoginForm

// Tidak perlu lagi mengimpor atau menginisialisasi font Cinzel di sini
// Hapus kode berikut:
// import { Cinzel } from 'next/font/google';
// const cinzel = Cinzel({ ... });

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      {/* Teks "INTELLEKTULLE SCHULE" dengan ukuran besar, tebal, dan warna kustom */}
      <h1
        className="text-6xl font-extrabold mb-8 drop-shadow-lg"
        style={{ color: '#603017' }} // Inline style untuk warna masih diperlukan
      >
        INTELLEKTULLE SCHULE 2025
      </h1>
      {/* Menggunakan komponen LoginForm yang telah dibuat */}
      <LoginForm />
    </div>
  );
}
