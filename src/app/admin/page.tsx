// src/app/admin/page.tsx
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/ui/sidebar';
import AdminUserRegistrationForm from '@/components/admin/AdminUserRegistrationForm';
import AttendanceSessionManager from '@/components/admin/AttendanceSessionManager';
import AttendanceDataViewer from '@/components/admin/AttendanceDataViewer';

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
      
      {/* Mobile: adjust margins/padding for sidebar */}
      <div className="flex-1 p-4 md:p-8 ml-0 md:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 md:mb-8">
            <div className="bg-white/85 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 md:p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">Kelola user dan sistem pembelajaran</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {/* Petunjuk Approval Manual */}
            <div>
              <div className="bg-white/85 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Approval Presensi Manual
                </h2>
                <div className="space-y-3 text-sm md:text-base">
                  <p className="text-gray-700">
                    <strong>Cara menyetujui/menolak presensi:</strong>
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Buka <strong>Supabase Dashboard</strong> → Table Editor</li>
                    <li>Buka tabel <code className="bg-gray-100 px-2 py-1 rounded text-red-600">presensi_data</code></li>
                    <li>Atau gunakan view <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">presensi_untuk_admin</code> (lebih mudah)</li>
                    <li>Edit kolom <strong>status_approval</strong>: ubah dari "Pending" menjadi "Disetujui" atau "Ditolak"</li>
                    <li>Opsional: Isi kolom <strong>feedback_admin</strong> untuk memberikan keterangan</li>
                  </ol>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
                    <p className="text-blue-800 text-sm">
                      💡 <strong>Tips:</strong> Status "Hadir" otomatis disetujui. Hanya "Tidak Hadir", "Menyusul", dan "Meninggalkan" yang perlu approval manual.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kelola Sesi Presensi */}
            <div>
              <AttendanceSessionManager />
            </div>

            {/* Data Presensi User */}
            <div>
              <AttendanceDataViewer />
            </div>

            {/* Form untuk membuat user baru */}
            <div>
              <AdminUserRegistrationForm />
            </div>

            {/* Link ke Google Spreadsheet */}
            <div>
              <div className="bg-white/85 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Daftar User</h2>
                <p className="text-gray-600 mb-4 text-sm md:text-base">
                  Data user disimpan dan dikelola melalui Google Spreadsheet untuk kemudahan akses dan kolaborasi.
                </p>
                <a
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 md:px-4 py-2 bg-green-600 text-white text-sm md:text-base rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM12 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM12 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" clipRule="evenodd" />
                  </svg>
                  Buka Google Spreadsheet
                </a>
                <p className="text-xs md:text-sm text-gray-500 mt-3">
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