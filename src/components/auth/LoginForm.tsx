// src/components/auth/LoginForm.tsx
'use client';

// Impor hook yang dibutuhkan dari React dan Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Impor instance Supabase Client yang sudah kita buat
import { supabase } from '@/lib/supabase';

// Impor ikon dari Lucide untuk show/hide password
import { Eye, EyeOff } from 'lucide-react';

// Definisi interface untuk props komponen LoginForm
interface LoginFormProps { }

const LoginForm: React.FC<LoginFormProps> = () => {
  const [username, setUsername] = useState<string>(''); // Ganti dari email menjadi username
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false); // State untuk password visibility
  const router = useRouter();

  // Fungsi yang dipanggil saat submit form login email/password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!username || !password) {
      setMessage('Username dan password tidak boleh kosong.');
      setIsError(true);
      return;
    }

    setIsLoading(true);

    // Supabase memerlukan email, jadi kita buat email dummy dari username
    const email = `${username}@ospek.com`;

    // Menggunakan `supabase.auth.signInWithPassword()` untuk login
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      // Jika Supabase mengembalikan error (misalnya: "Invalid login credentials")
      setMessage(error.message);
      setIsError(true);
    } else {
      // Jika login berhasil
      setMessage('Login berhasil!');
      setIsError(false);
      // Mengarahkan pengguna ke halaman /upload
      router.push('/upload');
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-3xl font-bold text-center text-gray-900">Login Peserta</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 text-left">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 text-gray-900"
            placeholder="masukkan username Anda"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 text-gray-900 pr-10"
              placeholder="masukkan password Anda"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memuat...' : 'Login'}
          </button>
        </div>
      </form>
      <div className="text-sm text-center">
        Belum punya akun?{' '}
        <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
          Daftar di sini
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
