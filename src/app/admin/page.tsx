// src/app/admin/page.tsx
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/ui/sidebar';
import AdminUserRegistrationForm from '@/components/admin/AdminUserRegistrationForm';
import AttendanceSessionManager from '@/components/admin/AttendanceSessionManager';
import AttendanceDataViewer from '@/components/admin/AttendanceDataViewer';
import TaskManager from '@/components/admin/TaskManager';
import DayManager from '@/components/admin/DayManager';
import { useState } from 'react';
import { Users, FileText, Calendar, Clock, BarChart3 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'users' | 'tasks' | 'days' | 'attendance-sessions' | 'attendance-data'>('tasks');
  
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
              
              {/* Tab Navigation */}
              <div className="mt-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'tasks'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline-block mr-2" />
                    Manajemen Tugas
                  </button>
                  <button
                    onClick={() => setActiveTab('days')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'days'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Calendar className="w-4 h-4 inline-block mr-2" />
                    Manajemen Day
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'users'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Users className="w-4 h-4 inline-block mr-2" />
                    Manajemen User
                  </button>
                  <button
                    onClick={() => setActiveTab('attendance-sessions')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'attendance-sessions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline-block mr-2" />
                    Sesi Presensi
                  </button>
                  <button
                    onClick={() => setActiveTab('attendance-data')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'attendance-data'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline-block mr-2" />
                    Data Presensi
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {activeTab === 'tasks' && (
              <div className="bg-white/90 rounded-lg shadow-sm ring-1 ring-gray-900/5 p-4 md:p-6">
                <TaskManager isAdmin={true} />
              </div>
            )}

            {activeTab === 'days' && (
              <div className="bg-white/90 rounded-lg shadow-sm ring-1 ring-gray-900/5 p-4 md:p-6">
                <DayManager isAdmin={true} />
              </div>
            )}
            
            {activeTab === 'attendance-sessions' && (
              <div className="bg-white/90 rounded-lg shadow-sm ring-1 ring-gray-900/5 p-4 md:p-6">
                <AttendanceSessionManager />
              </div>
            )}
            
            {activeTab === 'attendance-data' && (
              <div className="bg-white/90 rounded-lg shadow-sm ring-1 ring-gray-900/5">
                <AttendanceDataViewer />
              </div>
            )}
            
            {activeTab === 'users' && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};