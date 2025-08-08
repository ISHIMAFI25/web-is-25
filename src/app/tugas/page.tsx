// src/app/tugas/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AssignmentList from '@/components/assignments/AssignmentList';
import Sidebar from "@/components/ui/sidebar";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Compass, ScrollText } from "lucide-react";
import { DayGroup } from '@/types/assignment';

export default function TugasPage() {
  const [assignments, setAssignments] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load assignments from database
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tasks');
        
        if (response.ok) {
          const data = await response.json();
          setAssignments(data);
        } else {
          setError('Gagal memuat data tugas');
        }
      } catch (error) {
        console.error('Error loading assignments:', error);
        setError('Terjadi kesalahan saat memuat tugas');
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat tugas...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-start justify-center p-4">
        {/* Efek kompas di pojok */}
        <div className="fixed top-10 right-10 w-32 h-32 opacity-30 z-10">
          <Compass size={128} className="text-amber-800" />
        </div>
        
        {/* Efek gulungan di pojok kiri */}
        <div className="fixed bottom-10 left-10 w-24 h-24 opacity-35 z-10">
          <ScrollText size={96} className="text-amber-900" />
        </div>

        {/* Sidebar Component */}
        <Sidebar />
        
        {/* Menggunakan data dari database */}
        <AssignmentList assignmentsData={assignments} />
      </div>
    </ProtectedRoute>
  );
}
