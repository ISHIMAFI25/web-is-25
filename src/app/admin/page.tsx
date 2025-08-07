// src/app/admin/page.tsx
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/ui/sidebar';
import AdminUserRegistrationForm from '@/components/admin/AdminUserRegistrationForm';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      {/* Sidebar di layer paling atas, tidak terpengaruh font Roboto */}
      <Sidebar />
      
      <AdminDashboard />
    </ProtectedRoute>
  );
};

// Halaman Admin dengan proteksi
const AdminDashboard = () => {
  return (
    <div 
      className="min-h-screen"
      style={{
        fontFamily: 'var(--font-roboto)',
        backgroundImage: 'url("/wallpaper-ryo.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="bg-white/85 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Kelola user dan sistem pembelajaran</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {/* Form untuk membuat user baru */}
            <div>
              <AdminUserRegistrationForm />
            </div>

            {/* Link ke Google Spreadsheet */}
            <div>
              <div className="bg-white/85 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Daftar User</h2>
                <p className="text-gray-600 mb-4">
                  Data user disimpan dan dikelola melalui Google Spreadsheet untuk kemudahan akses dan kolaborasi.
                </p>
                <a
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM12 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM12 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" clipRule="evenodd" />
                  </svg>
                  Buka Google Spreadsheet
                </a>
                <p className="text-sm text-gray-500 mt-3">
                  💡 <strong>Tips:</strong> Ganti URL di atas dengan link Google Spreadsheet Anda yang berisi data user.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};