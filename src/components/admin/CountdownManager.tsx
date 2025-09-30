// src/components/admin/CountdownManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, Pause, Trash2, Eye, EyeOff, Plus } from 'lucide-react';

interface CountdownData {
  id: number;
  title: string;
  description: string;
  targetTime: string;
  isActive: boolean;
  showOnlyCountdown: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CountdownManager() {
  const [countdown, setCountdown] = useState<CountdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetTime: '',
    showOnlyCountdown: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchCountdown();
  }, []);

  // Real-time countdown preview
  useEffect(() => {
    if (!countdown || !countdown.isActive) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(countdown.targetTime).getTime();
      const difference = target - now;

      if (difference > 0) {
        const totalHours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours: totalHours, minutes: minutes, seconds: seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const fetchCountdown = async () => {
    try {
      const response = await fetch('/api/admin/countdown');
      const result = await response.json();
      
      if (result.success) {
        setCountdown(result.data);
      }
    } catch (error) {
      console.error('Error fetching countdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCountdown = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/admin/countdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setCountdown(result.data);
        setFormData({
          title: '',
          description: '',
          targetTime: '',
          showOnlyCountdown: false
        });
        setShowForm(false);
        alert('Countdown berhasil dibuat!');
      } else {
        alert('Gagal membuat countdown: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating countdown:', error);
      alert('Terjadi kesalahan saat membuat countdown');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async () => {
    if (!countdown) return;

    try {
      const response = await fetch('/api/admin/countdown', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: countdown.id,
          isActive: !countdown.isActive,
          title: countdown.title,
          description: countdown.description,
          targetTime: countdown.targetTime,
          showOnlyCountdown: countdown.showOnlyCountdown
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCountdown(result.data);
        alert(`Countdown ${result.data.isActive ? 'diaktifkan' : 'dinonaktifkan'}!`);
      }
    } catch (error) {
      console.error('Error toggling countdown:', error);
      alert('Terjadi kesalahan saat mengubah status countdown');
    }
  };

  const handleToggleShowOnly = async () => {
    if (!countdown) return;

    try {
      const response = await fetch('/api/admin/countdown', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: countdown.id,
          showOnlyCountdown: !countdown.showOnlyCountdown,
          title: countdown.title,
          description: countdown.description,
          targetTime: countdown.targetTime,
          isActive: countdown.isActive
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCountdown(result.data);
        alert(`Mode ${result.data.showOnlyCountdown ? 'Countdown Only' : 'Normal'} diaktifkan!`);
      }
    } catch (error) {
      console.error('Error toggling show only:', error);
      alert('Terjadi kesalahan saat mengubah mode tampilan');
    }
  };

  const handleDeactivate = async () => {
    if (!countdown) return;

    if (!confirm('Apakah Anda yakin ingin menonaktifkan countdown ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/countdown?id=${countdown.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setCountdown(null);
        alert('Countdown berhasil dinonaktifkan!');
      }
    } catch (error) {
      console.error('Error deactivating countdown:', error);
      alert('Terjadi kesalahan saat menonaktifkan countdown');
    }
  };

  const handleEdit = () => {
    if (!countdown) return;
    
    setFormData({
      title: countdown.title,
      description: countdown.description,
      targetTime: countdown.targetTime,
      showOnlyCountdown: countdown.showOnlyCountdown
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleUpdateCountdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countdown) return;

    setIsCreating(true);

    try {
      const response = await fetch('/api/admin/countdown', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: countdown.id,
          ...formData,
          isActive: countdown.isActive
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCountdown(result.data);
        setFormData({
          title: '',
          description: '',
          targetTime: '',
          showOnlyCountdown: false
        });
        setIsEditing(false);
        setShowForm(false);
        alert('Countdown berhasil diupdate!');
      } else {
        alert('Gagal mengupdate countdown: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating countdown:', error);
      alert('Terjadi kesalahan saat mengupdate countdown');
    } finally {
      setIsCreating(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      targetTime: '',
      showOnlyCountdown: false
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (targetTime: string) => {
    const now = new Date();
    const target = new Date(targetTime);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return 'Waktu telah habis';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days} hari, ${hours} jam, ${minutes} menit`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Countdown Lantik</h2>
          <p className="text-gray-600 mt-1">Kelola countdown dan mode tampilan website</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Countdown Baru
        </button>
      </div>

      {/* Form Pembuatan/Edit Countdown */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? 'Edit Countdown' : 'Buat Countdown Baru'}
          </h3>
          <form onSubmit={isEditing ? handleUpdateCountdown : handleCreateCountdown} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Countdown
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Pelantikan IS 25"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi (Opsional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Deskripsi tambahan untuk countdown..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waktu Target
              </label>
              <input
                type="datetime-local"
                value={formData.targetTime}
                onChange={(e) => setFormData(prev => ({ ...prev, targetTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showOnlyCountdown"
                checked={formData.showOnlyCountdown}
                onChange={(e) => setFormData(prev => ({ ...prev, showOnlyCountdown: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showOnlyCountdown" className="ml-2 block text-sm text-gray-700">
                Aktifkan mode "Countdown Only" (Sembunyikan semua konten website)
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {isCreating ? (isEditing ? 'Mengupdate...' : 'Membuat...') : (isEditing ? 'Update Countdown' : 'Buat Countdown')}
              </button>
              <button
                type="button"
                onClick={isEditing ? cancelEdit : () => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Countdown Aktif */}
      {countdown ? (
        <>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{countdown.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    countdown.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {countdown.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  {countdown.showOnlyCountdown && (
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                      Countdown Only
                    </span>
                  )}
                </div>

                {countdown.description && (
                  <p className="text-gray-600 mb-4">{countdown.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Waktu Target:</span>
                    <p className="text-gray-900">{formatDateTime(countdown.targetTime)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sisa Waktu:</span>
                    <p className="text-gray-900">{getTimeRemaining(countdown.targetTime)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm transition-colors"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Edit
                </button>

                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showPreview ? 'Sembunyikan' : 'Preview'} Countdown
                </button>

                <button
                  onClick={handleToggleActive}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    countdown.isActive
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {countdown.isActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Nonaktifkan
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Aktifkan
                    </>
                  )}
                </button>

                <button
                  onClick={handleToggleShowOnly}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                    countdown.showOnlyCountdown
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {countdown.showOnlyCountdown ? (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Show All
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Countdown Only
                    </>
                  )}
                </button>

                <button
                  onClick={handleDeactivate}
                  className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Hapus
                </button>
              </div>
            </div>
          </div>

          {/* Preview Countdown */}
          {showPreview && countdown.isActive && (
            <div className="bg-black rounded-lg p-8 relative overflow-hidden" style={{
              backgroundImage: 'url("/hari-kemenangan.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}>
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="relative z-10 text-center">
                <div className="mb-4">
                  <img src="/logois.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
                  <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
                    INTELLEKTUELLE SCHULE 2025
                  </h1>
                </div>
                
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-white mb-2">
                    {countdown.title}
                  </h2>
                  {countdown.description && (
                    <p className="text-white/90 text-sm md:text-base">
                      {countdown.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-center items-center">
                  <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-white font-mono tracking-wider">
                    {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Countdown Aktif</h3>
          <p className="text-gray-500 mb-4">Buat countdown baru untuk memulai</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Buat Countdown Pertama
          </button>
        </div>
      )}
    </div>
  );
}