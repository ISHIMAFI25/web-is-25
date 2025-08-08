'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, AlertCircle } from 'lucide-react';

interface PresensiApproval {
  id: number;
  full_name: string;
  username: string;
  user_email: string;
  status_kehadiran: string;
  jam: string;
  alasan: string;
  foto_url: string;
  waktu_presensi: string;
  status_approval: string;
  day_title: string;
  day_number: number;
}

export default function AdminApprovalPanel() {
  const [approvalQueue, setApprovalQueue] = useState<PresensiApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ [key: number]: string }>({});

  const fetchApprovalQueue = async () => {
    try {
      const response = await fetch('/api/admin-approval');
      const result = await response.json();
      
      if (result.success) {
        setApprovalQueue(result.data);
      } else {
        console.error('Error fetching approval queue:', result.error);
      }
    } catch (error) {
      console.error('Error fetching approval queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (presensiId: number, status: 'Disetujui' | 'Ditolak') => {
    setProcessingId(presensiId);
    
    try {
      const response = await fetch('/api/admin-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presensi_id: presensiId,
          status: status,
          admin_email: 'admin@example.com', // TODO: Get from auth context
          feedback: feedback[presensiId] || ''
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Remove from queue
        setApprovalQueue(prev => prev.filter(item => item.id !== presensiId));
        // Clear feedback
        setFeedback(prev => {
          const newFeedback = { ...prev };
          delete newFeedback[presensiId];
          return newFeedback;
        });
        alert(`Presensi berhasil ${status.toLowerCase()}`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Terjadi kesalahan saat memproses approval');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Tidak Hadir': 'bg-red-100 text-red-800 border border-red-200',
      'Menyusul': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'Meninggalkan': 'bg-orange-100 text-orange-800 border border-orange-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchApprovalQueue();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading approval queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="h-6 w-6" />
          Approval Presensi
        </h2>
        <button 
          onClick={fetchApprovalQueue}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          Refresh
        </button>
      </div>

      {approvalQueue.length === 0 ? (
        <div className="bg-white rounded-lg shadow border p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tidak Ada Approval Pending</h3>
          <p className="text-gray-600">Semua presensi sudah diproses atau belum ada submission.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {approvalQueue.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow border border-l-4 border-l-yellow-400">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {item.full_name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Username: {item.username}</span>
                      <span>Email: {item.user_email}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status_kehadiran)}`}>
                    {item.status_kehadiran}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{item.day_title}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Waktu Submit:</strong> {formatDateTime(item.waktu_presensi)}
                      </div>
                      {item.jam && (
                        <div className="text-sm text-gray-600">
                          <strong>Jam:</strong> {item.jam}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {item.alasan && (
                        <div className="text-sm">
                          <strong>Alasan:</strong>
                          <p className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
                            {item.alasan}
                          </p>
                        </div>
                      )}
                      {item.foto_url && (
                        <div className="text-sm">
                          <strong>Foto Bukti:</strong>
                          <div className="mt-1">
                            <img 
                              src={item.foto_url} 
                              alt="Bukti presensi" 
                              className="w-full max-w-xs h-32 object-cover rounded border"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Feedback untuk user (opsional):
                      </label>
                      <textarea
                        placeholder="Berikan feedback kepada user..."
                        value={feedback[item.id] || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(prev => ({
                          ...prev,
                          [item.id]: e.target.value
                        }))}
                        className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproval(item.id, 'Disetujui')}
                        disabled={processingId === item.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processingId === item.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Setujui
                      </button>
                      
                      <button
                        onClick={() => handleApproval(item.id, 'Ditolak')}
                        disabled={processingId === item.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processingId === item.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
