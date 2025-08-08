import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface AttendanceSession {
  id: number;
  day_number: number;
  day_title: string;
  is_active: boolean;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  created_by_admin: string;
}

export default function AttendanceSessionManager() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [newSession, setNewSession] = useState({
    dayNumber: '',
    dayTitle: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/attendance-sessions');
      const data = await response.json();
      
      if (response.ok) {
        setSessions(data.sessions || []);
      } else {
        showMessage('error', data.error || 'Gagal mengambil data sesi presensi');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showMessage('error', 'Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = async (sessionId: number, action: 'activate' | 'deactivate') => {
    if (!user?.email) {
      showMessage('error', 'Tidak dapat mengidentifikasi admin');
      return;
    }

    setActionLoading(sessionId);
    
    try {
      const response = await fetch('/api/attendance-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          sessionId,
          adminEmail: user.email
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', data.message);
        await fetchSessions(); // Refresh data
      } else {
        showMessage('error', data.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error handling session action:', error);
      showMessage('error', 'Terjadi kesalahan saat memproses permintaan');
    } finally {
      setActionLoading(null);
    }
  };

  const createNewSession = async () => {
    if (!newSession.dayNumber || !newSession.dayTitle || !user?.email) {
      showMessage('error', 'Harap isi semua field');
      return;
    }

    if (isNaN(Number(newSession.dayNumber)) || Number(newSession.dayNumber) <= 0) {
      showMessage('error', 'Day number harus berupa angka positif');
      return;
    }

    setCreateLoading(true);
    
    try {
      const response = await fetch('/api/attendance-sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayNumber: Number(newSession.dayNumber),
          dayTitle: newSession.dayTitle,
          adminEmail: user.email
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', data.message);
        setNewSession({ dayNumber: '', dayTitle: '' });
        await fetchSessions(); // Refresh data
      } else {
        showMessage('error', data.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      showMessage('error', 'Terjadi kesalahan saat membuat sesi');
    } finally {
      setCreateLoading(false);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Memuat data sesi presensi...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kelola Sesi Presensi</h2>
        <p className="text-gray-600">
          Buka dan tutup sesi presensi untuk peserta
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form untuk membuat sesi baru */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Buat Sesi Presensi Baru</h3>
        <p className="text-gray-600 mb-4">Buat sesi presensi untuk hari yang belum ada</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="dayNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Day Number
            </label>
            <input
              id="dayNumber"
              type="number"
              min="1"
              value={newSession.dayNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setNewSession(prev => ({ ...prev, dayNumber: e.target.value }))
              }
              placeholder="Contoh: 4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="dayTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Judul Hari
            </label>
            <input
              id="dayTitle"
              value={newSession.dayTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setNewSession(prev => ({ ...prev, dayTitle: e.target.value }))
              }
              placeholder="Contoh: Day 4 - Advanced Training"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button 
          onClick={createNewSession} 
          disabled={createLoading}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createLoading ? 'Membuat...' : 'Buat Sesi Baru'}
        </button>
      </div>

      {/* Daftar sesi presensi */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Daftar Sesi Presensi</h3>
        
        {sessions.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <p className="text-gray-600">Belum ada sesi presensi yang dibuat</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className={`bg-white p-6 rounded-lg border-2 shadow-sm ${
                  session.is_active ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">
                        Day {session.day_number}: {session.day_title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        session.is_active 
                          ? 'bg-green-200 text-green-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {session.is_active ? 'AKTIF' : 'Tidak Aktif'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Dibuat oleh: {session.created_by_admin}</p>
                      <p>Dibuat: {formatDateTime(session.created_at)}</p>
                      {session.start_time && (
                        <p>Dimulai: {formatDateTime(session.start_time)}</p>
                      )}
                      {session.end_time && (
                        <p>Ditutup: {formatDateTime(session.end_time)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {session.is_active ? (
                      <button
                        onClick={() => handleSessionAction(session.id, 'deactivate')}
                        disabled={actionLoading === session.id}
                        className="w-full lg:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === session.id ? 'Menutup...' : 'Tutup Sesi'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSessionAction(session.id, 'activate')}
                        disabled={actionLoading === session.id}
                        className="w-full lg:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === session.id ? 'Membuka...' : 'Buka Sesi'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
