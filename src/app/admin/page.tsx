// src/app/admin/page.tsx
'use client';

import { useState } from 'react';
import { createUser } from '@/app/actions';

// Komponen formulir untuk admin
const AdminUserRegistrationForm = () => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Fungsi untuk menangani pendaftaran user baru oleh admin
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    // Validasi sekarang hanya untuk username dan password
    if (!username || !password) {
      setMessage('Username dan password tidak boleh kosong.');
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      // Memanggil Server Action untuk membuat user
      const result = await createUser({ username, password, namaLengkap });
      
      if (result.error) {
        setMessage(result.error);
        setIsError(true);
      } else {
        setMessage('Akun berhasil dibuat!');
        setIsError(false);
        setNamaLengkap('');
        setUsername('');
        setPassword('');
      }
    } catch (e: any) {
      setMessage(`Terjadi kesalahan: ${e.message}`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-900">Admin - Tambah Peserta</h2>
        <form onSubmit={handleCreateUser} className="space-y-6">
          <div>
            <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700 text-left">
              Nama Lengkap
            </label>
            <input
              id="namaLengkap"
              type="text"
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
              placeholder="Nama Lengkap Peserta"
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 text-left">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
              placeholder="Username Peserta"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
              placeholder="Password Peserta"
            />
          </div>
          {message && (
            <div className={`p-3 rounded-md text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Membuat Akun...' : 'Buat Akun Peserta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserRegistrationForm;