"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, AlertTriangle, RefreshCw, Image } from 'lucide-react';
import { formatJakartaDateTime } from '@/lib/timezoneUtils';

interface AttendanceApproval {
  id: number;
  day_id: number;
  session_id: number;
  day_title: string;
  user_email: string;
  full_name: string;
  username: string;
  status_kehadiran: string;
  alasan: string;
  jam_menyusul_meninggalkan: string | null;
  foto_url: string | null;
  status_approval: string;
  approval_message: string;
  feedback_admin: string | null;
  created_at: string;
  updated_at: string;
}

export default function AttendanceApprovalManager() {
  const [pendingApprovals, setPendingApprovals] = useState<AttendanceApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [feedbackTexts, setFeedbackTexts] = useState<Record<number, string>>({});

  // Fetch pending approvals
  useEffect(() => {
    fetchPendingApprovals();
    // Auto-refresh dimatikan untuk performa yang lebih baik
    // Admin bisa manual refresh dengan tombol Refresh
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/attendance-approval');
      const result = await response.json();

      if (response.ok && result.success) {
        setPendingApprovals(result.data);
      } else {
        console.error('Error fetching pending approvals:', result.error);
        alert('Gagal mengambil data pending approvals');
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      alert('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (attendanceId: number, statusApproval: 'Disetujui' | 'Ditolak') => {
    if (processingIds.has(attendanceId)) return;

    // Confirm action
    const attendanceItem = pendingApprovals.find(item => item.id === attendanceId);
    const userName = attendanceItem?.full_name || 'User';
    const statusKehadiran = attendanceItem?.status_kehadiran || '';
    
    const confirmMessage = statusApproval === 'Disetujui' 
      ? `Apakah Anda yakin ingin menyetujui presensi ${userName} dengan status "${statusKehadiran}"?`
      : `Apakah Anda yakin ingin menolak presensi ${userName} dengan status "${statusKehadiran}"?`;
    
    if (!confirm(confirmMessage)) return;

    setProcessingIds(prev => new Set(prev).add(attendanceId));

    try {
      const response = await fetch('/api/admin/attendance-approval', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendanceId,
          statusApproval,
          feedbackAdmin: feedbackTexts[attendanceId] || null
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success message with better UX
        const actionText = statusApproval === 'Disetujui' ? 'disetujui' : 'ditolak';
        const attendanceItem = pendingApprovals.find(item => item.id === attendanceId);
        const userName = attendanceItem?.full_name || 'User';
        
        alert(`✅ Presensi ${userName} berhasil ${actionText}!`);
        
        // Remove from pending list
        setPendingApprovals(prev => prev.filter(item => item.id !== attendanceId));
        
        // Clear feedback text
        setFeedbackTexts(prev => {
          const newTexts = { ...prev };
          delete newTexts[attendanceId];
          return newTexts;
        });
      } else {
        throw new Error(result.error || 'Gagal mengupdate status approval');
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(attendanceId);
        return newSet;
      });
    }
  };

  const handleFeedbackChange = (attendanceId: number, feedback: string) => {
    setFeedbackTexts(prev => ({
      ...prev,
      [attendanceId]: feedback
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg text-amber-800">Memuat data pending approvals...</div>
        </div>
      </div>
    );
  }

  if (pendingApprovals.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-amber-900">Persetujuan Presensi</h2>
          <button
            onClick={fetchPendingApprovals}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        
        <div className="text-center py-8 bg-green-50 rounded border border-green-200">
          <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
          <div className="text-lg font-semibold text-green-800 mb-2">Semua Presensi Sudah Disetujui</div>
          <div className="text-gray-600">Tidak ada presensi yang menunggu persetujuan saat ini.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-900">Persetujuan Presensi</h2>
        <button
          onClick={fetchPendingApprovals}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      
      <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <div className="flex items-center">
          <AlertTriangle className="text-yellow-600 mr-2" size={20} />
          <span className="text-yellow-800 font-medium">
            {pendingApprovals.length} presensi menunggu persetujuan
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {pendingApprovals.map((attendance) => (
          <div key={attendance.id} className="border border-gray-300 rounded-lg p-4 bg-white">
            {/* Header Info */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <User className="text-gray-600" size={18} />
                <span className="font-semibold text-gray-900">{attendance.full_name}</span>
                <span className="text-sm text-gray-500">(@{attendance.username})</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar size={14} />
                {attendance.day_title}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Info Column */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    attendance.status_kehadiran === 'Tidak Hadir'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {attendance.status_kehadiran}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">
                    {attendance.status_kehadiran === 'Hadir' ? 'Kondisi:' : 'Alasan:'}
                  </span>
                  <p className="text-sm text-gray-700 mt-1">{attendance.alasan}</p>
                </div>

                {attendance.jam_menyusul_meninggalkan && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Jam: {attendance.jam_menyusul_meninggalkan}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Submitted: {formatJakartaDateTime(attendance.created_at)}</span>
                  {attendance.foto_url && (
                    <a 
                      href={attendance.foto_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Image size={12} />
                      Foto
                    </a>
                  )}
                </div>
              </div>

              {/* Actions Column */}
              <div className="space-y-2">
                <textarea
                  value={feedbackTexts[attendance.id] || ''}
                  onChange={(e) => handleFeedbackChange(attendance.id, e.target.value)}
                  placeholder="Feedback (opsional)"
                  rows={2}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproval(attendance.id, 'Disetujui')}
                    disabled={processingIds.has(attendance.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    {processingIds.has(attendance.id) ? 'Loading...' : 'Setujui'}
                  </button>

                  <button
                    onClick={() => handleApproval(attendance.id, 'Ditolak')}
                    disabled={processingIds.has(attendance.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    {processingIds.has(attendance.id) ? 'Loading...' : 'Tolak'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
