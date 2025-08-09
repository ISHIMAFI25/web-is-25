// src/components/admin/DayManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DayInfo, DayForm } from '@/types/day';
import { Plus, Edit, Trash2, Save, X, FileText, Calendar, MapPin, Eye, EyeOff, Clock } from 'lucide-react';
import FileUploadWidget from '@/components/upload/FileUploadWidget';
import LinkAttachmentWidget from '@/components/upload/LinkAttachmentWidget';
import { getFileIcon, getFileName } from '@/lib/uploadHelpers';

interface DayManagerProps {
  isAdmin: boolean;
}

const DayManager: React.FC<DayManagerProps> = ({ isAdmin }) => {
  const [days, setDays] = useState<DayInfo[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<DayForm>({
    dayNumber: 0,
    title: '',
    description: '',
    dateTime: '',
    location: '',
    specifications: '',
    attachmentFiles: [],
    attachmentLinks: [],
    isVisible: false
  });

  // Show notification helper
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  // Load days
  useEffect(() => {
    loadDays();
  }, []);

  const loadDays = async () => {
    try {
      const response = await fetch('/api/admin/days');
      if (response.ok) {
        const data = await response.json();
        console.log('DayManager API response:', data);
        // Handle both formats: array or {days: [...]}
        const daysData = Array.isArray(data) ? data : (data.days || []);
        setDays(daysData);
      }
    } catch (error) {
      console.error('Error loading days:', error);
    }
  };

  const resetForm = () => {
    setEditForm({
      dayNumber: 0,
      title: '',
      description: '',
      dateTime: '',
      location: '',
      specifications: '',
      attachmentFiles: [],
      attachmentLinks: [],
      isVisible: false
    });
  };

  const isFormValid = () => {
    return editForm.title.trim() !== '' && 
           editForm.description.trim() !== '' &&
           editForm.dateTime !== '' &&
           editForm.location.trim() !== '' &&
           editForm.dayNumber >= 0;
  };

  const handleCreateDay = async () => {
    if (!isFormValid()) {
      showNotification('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    try {
      // Convert local datetime to ISO string for storage
      const dateTimeISO = new Date(editForm.dateTime).toISOString();
      const dayData = {
        ...editForm,
        dateTime: dateTimeISO
      };

      const response = await fetch('/api/admin/days', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dayData)
      });

      if (response.ok) {
        showNotification('Informasi day berhasil dibuat!');
        setIsCreating(false);
        resetForm();
        loadDays();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create day');
      }
    } catch (error) {
      console.error('Create error:', error);
      showNotification('Gagal membuat informasi day', 'error');
    }
  };

  const handleUpdateDay = async (dayId: string) => {
    if (!isFormValid()) {
      showNotification('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    try {
      // Convert local datetime to ISO string for storage
      const dateTimeISO = new Date(editForm.dateTime).toISOString();
      const dayData = {
        ...editForm,
        dateTime: dateTimeISO
      };

      const response = await fetch(`/api/admin/days/${dayId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dayData)
      });

      if (response.ok) {
        showNotification('Informasi day berhasil diperbarui!');
        setIsEditing(null);
        resetForm();
        loadDays();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update day');
      }
    } catch (error) {
      console.error('Update error:', error);
      showNotification('Gagal memperbarui informasi day', 'error');
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    console.log('🗑️ Delete day clicked for ID:', dayId);
    
    if (!confirm('Apakah Anda yakin ingin menghapus informasi day ini?')) {
      console.log('❌ Delete cancelled by user');
      return;
    }

    console.log('✅ Delete confirmed, proceeding...');

    try {
      console.log('📤 Sending DELETE request to:', `/api/admin/days/${dayId}`);
      
      const response = await fetch(`/api/admin/days/${dayId}`, {
        method: 'DELETE'
      });

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Delete successful, response:', responseData);
        
        showNotification('Informasi day berhasil dihapus!');
        loadDays();
      } else {
        const errorData = await response.json();
        console.error('❌ Delete failed with error data:', errorData);
        throw new Error(errorData.error || 'Failed to delete day');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      showNotification('Gagal menghapus informasi day', 'error');
    }
  };

  const startEditDay = (day: DayInfo) => {
    // Format datetime properly for datetime-local input
    const dateTime = new Date(day.dateTime);
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const localDateTimeString = `${year}-${month}-${dayOfMonth}T${hours}:${minutes}`;
    
    setEditForm({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description,
      dateTime: localDateTimeString,
      location: day.location,
      specifications: day.specifications || '',
      attachmentFiles: day.attachmentFiles || [],
      attachmentLinks: day.attachmentLinks || [],
      isVisible: day.isVisible
    });
    setIsEditing(day.id);
  };

  const handleFileUpload = (files: (string | { name: string; url: string; size?: number })[]) => {
    setEditForm(prev => ({
      ...prev,
      attachmentFiles: files
    }));
  };

  const handleLinkAttachment = (links: { name: string; url: string }[]) => {
    setEditForm(prev => ({
      ...prev,
      attachmentLinks: links
    }));
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Informasi Day</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Day Baru
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {isCreating ? 'Tambah Day Baru' : 'Edit Informasi Day'}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.dayNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, dayNumber: parseInt(e.target.value) || 0 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Day <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan judul day"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={editForm.dateTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dateTime: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {editForm.dateTime && (
                  <p className="text-xs text-blue-600 mt-1">
                    Preview: {new Date(editForm.dateTime).toLocaleString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempat Berkumpul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan lokasi berkumpul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan deskripsi day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spesifikasi
                </label>
                <textarea
                  value={editForm.specifications}
                  onChange={(e) => setEditForm(prev => ({ ...prev, specifications: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan spesifikasi atau requirement (opsional)"
                />
              </div>

              {/* Visibility Setting */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.isVisible}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isVisible: e.target.checked }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Eye size={16} />
                  <span>Tampilkan kepada peserta</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Jika dicentang, informasi day ini akan terlihat oleh peserta
                </p>
              </div>

              {/* Attachment Files */}
              <div>
                <FileUploadWidget
                  files={editForm.attachmentFiles}
                  onFilesChange={handleFileUpload}
                  endpoint="dayFilesUploader"
                  label="File Lampiran"
                  description="Upload file lampiran untuk informasi day ini"
                  multiple={true}
                  maxSizeMB={8}
                />
              </div>

              {/* Attachment Links */}
              <div>
                <LinkAttachmentWidget
                  links={editForm.attachmentLinks}
                  onLinksChange={handleLinkAttachment}
                  label="Link Lampiran"
                  description="Tambahkan link lampiran untuk informasi day ini"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={isCreating ? handleCreateDay : () => handleUpdateDay(isEditing!)}
                  disabled={!isFormValid()}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                    isFormValid() 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save size={20} />
                  {isCreating ? 'Buat Day' : 'Simpan Perubahan'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
              </div>

              {/* Form Validation Hints */}
              {!isFormValid() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-yellow-800 font-medium mb-1">Lengkapi field berikut:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {!editForm.title.trim() && <li>• Judul day</li>}
                    {!editForm.description.trim() && <li>• Deskripsi</li>}
                    {!editForm.dateTime && <li>• Waktu mulai</li>}
                    {!editForm.location.trim() && <li>• Tempat berkumpul</li>}
                    {editForm.dayNumber < 0 && <li>• Day number harus 0 atau lebih</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Days List */}
      <div className="space-y-6">
        {days.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">Belum ada informasi day yang tersedia.</p>
            <p className="text-sm text-gray-500 mb-4">
              Klik "Tambah Day Baru" untuk membuat informasi day pertama.
            </p>
          </div>
        ) : (
          days.map((day) => (
            <div key={day.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Day {day.dayNumber}: {day.title}
                    </h3>
                    {day.isVisible ? (
                      <div title="Visible to participants">
                        <Eye size={16} className="text-green-600" />
                      </div>
                    ) : (
                      <div title="Hidden from participants">
                        <EyeOff size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>{new Date(day.dateTime).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span>{day.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{day.description}</p>
                  
                  {day.specifications && (
                    <div className="bg-blue-50 p-2 rounded text-sm text-blue-800 mb-2">
                      <strong>Spesifikasi:</strong> {day.specifications}
                    </div>
                  )}
                  
                  {day.attachmentFiles && day.attachmentFiles.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FileText size={12} />
                      <span>{day.attachmentFiles.length} file lampiran</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEditDay(day)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div title="Edit day">
                      <Edit size={16} />
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteDay(day.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <div title="Delete day">
                      <Trash2 size={16} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DayManager;
