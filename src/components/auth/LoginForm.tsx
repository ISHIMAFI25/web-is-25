// src/components/auth/LoginForm.tsx
"use client"; // Ini menandakan bahwa ini adalah Client Component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter dari next/navigation

// Definisi interface untuk props komponen LoginForm (jika ada, saat ini tidak ada props eksternal)
interface LoginFormProps {
  // Anda bisa menambahkan props di sini jika form ini perlu menerima data atau fungsi dari parent
}

const LoginForm: React.FC<LoginFormProps> = () => {
  // State untuk menyimpan nilai input email dan password
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  // State untuk mengelola status loading saat submit form
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State untuk menyimpan pesan error atau sukses
  const [message, setMessage] = useState<string>('');
  // State untuk menentukan apakah pesan adalah error atau sukses
  const [isError, setIsError] = useState<boolean>(false);

  const router = useRouter(); // Inisialisasi router

  // Fungsi untuk menangani submit form
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Mencegah refresh halaman default dari submit form

    setMessage(''); // Reset pesan sebelumnya
    setIsError(false); // Reset status error

    // Validasi sederhana: pastikan email dan password tidak kosong
    if (!email || !password) {
      setMessage('Email dan password tidak boleh kosong.');
      setIsError(true);
      return;
    }

    setIsLoading(true); // Aktifkan status loading

    try {
      // Simulasikan panggilan API ke backend untuk proses login
      // Dalam aplikasi nyata, Anda akan mengirimkan data ke API Anda di sini
      const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === 'user@example.com' && password === 'password123') {
            resolve({ success: true, message: 'Login berhasil!' });
          } else {
            reject({ success: false, message: 'Email atau password salah.' });
          }
        }, 1500); // Simulasi penundaan jaringan 1.5 detik
      });

      // Jika login berhasil
      setMessage((response as { message: string }).message);
      setIsError(false);
      // Di sini Anda bisa mengarahkan pengguna ke dashboard atau halaman lain
      // Contoh: router.push('/dashboard');
      console.log('Login berhasil:', response);
      
      // REDIRECT PENGGUNA KE HALAMAN UPLOAD SETELAH LOGIN BERHASIL
      router.push('/upload'); // Mengarahkan pengguna ke halaman /upload
      
    } catch (error: any) {
      // Jika login gagal
      setMessage(error.message || 'Terjadi kesalahan saat login.');
      setIsError(true);
      console.error('Login gagal:', error);
    } finally {
      setIsLoading(false); // Nonaktifkan status loading
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-900">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 text-gray-900 input-text-roboto"
            placeholder="masukkan email Anda"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 text-gray-900 input-text-roboto"
            placeholder="masukkan password Anda"
          />
        </div>

        {/* Menampilkan pesan sukses/error */}
        {message && (
          <div className={`p-3 rounded-md text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading} // Nonaktifkan tombol saat loading
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memuat...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;