import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface AttendanceRecord {
  id: number;
  status_kehadiran: string;
  jam: string;
  alasan: string;
  foto_url: string;
  waktu: string;
  user_email: string;
  user_name: string;
  full_name: string;
  username: string;
  session_id: number;
  attendance_sessions?: {
    day_number: number;
    day_title: string;
  };
}

interface AttendanceSession {
  id: number;
  day_number: number;
  day_title: string;
  is_active: boolean;
}

export default function AttendanceDataViewer() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchAttendanceData();
    }
  }, [selectedSession]);

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
        // Auto select first session
        if (data.sessions?.length > 0) {
          setSelectedSession(data.sessions[0].id);
        }
      } else {
        showMessage('error', data.error || 'Gagal mengambil data sesi');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showMessage('error', 'Terjadi kesalahan saat mengambil data sesi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    if (!selectedSession) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/attendance-data?sessionId=${selectedSession}`);
      const data = await response.json();
      
      if (response.ok) {
        setAttendanceData(data.attendance || []);
      } else {
        showMessage('error', data.error || 'Gagal mengambil data presensi');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      showMessage('error', 'Terjadi kesalahan saat mengambil data presensi');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Hadir':
        return 'bg-green-100 text-green-800';
      case 'Tidak Hadir':
        return 'bg-red-100 text-red-800';
      case 'Menyusul':
        return 'bg-yellow-100 text-yellow-800';
      case 'Meninggalkan':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    if (attendanceData.length === 0) {
      showMessage('error', 'Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['No', 'Nama Lengkap', 'Username', 'Email', 'Status Kehadiran', 'Jam', 'Alasan', 'Waktu Submit'];
    const csvData = attendanceData.map((record, index) => [
      index + 1,
      record.full_name || record.user_name || '-',
      record.username || '-',
      record.user_email,
      record.status_kehadiran,
      record.jam || '-',
      record.alasan || '-',
      formatDateTime(record.waktu)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const selectedSessionData = sessions.find(s => s.id === selectedSession);
    const filename = `presensi_${selectedSessionData?.day_title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('success', 'Data berhasil diekspor ke CSV');
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Presensi User</h2>
        <p className="text-gray-600">
          Lihat dan kelola data presensi berdasarkan sesi
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

      {/* Session Selector */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label htmlFor="sessionSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Sesi Presensi:
            </label>
            <select
              id="sessionSelect"
              value={selectedSession || ''}
              onChange={(e) => setSelectedSession(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Sesi --</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  Day {session.day_number}: {session.day_title}
                  {session.is_active ? ' (Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          {attendanceData.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Export ke CSV
            </button>
          )}
        </div>
      </div>

      {/* Attendance Data Table */}
      {selectedSession && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              Data Presensi - {sessions.find(s => s.id === selectedSession)?.day_title}
            </h3>
            <p className="text-gray-600 text-sm">
              Total: {attendanceData.length} peserta
            </p>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-lg">Memuat data presensi...</div>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Belum ada data presensi untuk sesi ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Lengkap
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jam
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alasan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu Submit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.map((record, index) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.full_name || record.user_name || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.username || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.user_email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(record.status_kehadiran)}`}>
                          {record.status_kehadiran}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.jam || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {record.alasan || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(record.waktu)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
