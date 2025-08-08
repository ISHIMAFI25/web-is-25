// src/components/admin/AdminUserRegistrationForm.tsx
'use client';

import { useState } from 'react';
import { createUser } from '@/app/actions';

interface AdminUserRegistrationFormProps {
  onUserCreated?: () => void; // Callback untuk refresh user list
}

export default function AdminUserRegistrationForm({ onUserCreated }: AdminUserRegistrationFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    namaLengkap: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await createUser(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'User berhasil dibuat!' });
        setFormData({ username: '', password: '', namaLengkap: '' });
        
        // Panggil callback untuk refresh user list
        if (onUserCreated) {
          onUserCreated();
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Gagal membuat user' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat membuat user' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white/85 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
        Buat User Baru
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base md:text-sm"
            placeholder="Masukkan username"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base md:text-sm"
            placeholder="Masukkan password"
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="namaLengkap" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            id="namaLengkap"
            name="namaLengkap"
            value={formData.namaLengkap}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base md:text-sm"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 md:py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base md:text-sm font-medium"
        >
          {loading ? 'Membuat User...' : 'Buat User'}
        </button>
      </form>
    </div>
  );
}
