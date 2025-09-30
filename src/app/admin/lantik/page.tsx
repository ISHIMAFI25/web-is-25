// src/app/admin/lantik/page.tsx
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/ui/sidebar';
import CountdownManager from '@/components/admin/CountdownManager';

export default function AdminLantikPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <Sidebar />
      
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
        <div className="flex-1 p-4 md:p-8 ml-0 md:ml-64 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <div className="bg-white/85 shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 md:p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lantik - Countdown Manager</h1>
                <p className="text-gray-600 mt-2 text-sm md:text-base">
                  Kelola countdown pelantikan dan mode tampilan website
                </p>
              </div>
            </div>

            <div className="bg-white/90 rounded-lg shadow-sm ring-1 ring-gray-900/5 p-4 md:p-6">
              <CountdownManager />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}