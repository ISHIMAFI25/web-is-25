// src/components/admin/TaskManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Assignment, DayGroup, TaskForm } from '@/types/assignment';
import { Plus, Edit, Trash2, Save, X, Upload, Link, FileText } from 'lucide-react';
import FileUploadWidget from '@/components/upload/FileUploadWidget';
import LinkAttachmentWidget from '@/components/upload/LinkAttachmentWidget';

interface TaskManagerProps {
  isAdmin: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = ({ isAdmin }) => {
  const [tasks, setTasks] = useState<DayGroup[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<TaskForm>({
    title: '',
    day: 0,
    deadline: '',
    description: '',
    acceptsLinks: false,
    acceptsFiles: true,
    maxFileSize: 2,
    instructionFiles: [],
    instructionLinks: []
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

  // Load tasks
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/admin/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const resetForm = () => {
    setEditForm({
      title: '',
      day: 0,
      deadline: '',
      description: '',
      acceptsLinks: false,
      acceptsFiles: true,
      maxFileSize: 2,
      instructionFiles: [],
      instructionLinks: []
    });
  };

  const isFormValid = () => {
    return editForm.title.trim() !== '' && 
           editForm.deadline !== '' && 
           editForm.description.trim() !== '' &&
           editForm.day >= 0 &&
           (editForm.acceptsFiles || editForm.acceptsLinks);
  };

  const handleCreateTask = async () => {
    if (!isFormValid()) {
      showNotification('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    try {
      // Convert local datetime to ISO string for storage
      const deadlineISO = new Date(editForm.deadline).toISOString();
      const taskData = {
        ...editForm,
        deadline: deadlineISO
      };

      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        showNotification('Tugas berhasil dibuat!');
        setIsCreating(false);
        resetForm();
        loadTasks();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Create error:', error);
      showNotification('Gagal membuat tugas', 'error');
    }
  };

  const handleUpdateTask = async (taskId: string) => {
    if (!isFormValid()) {
      showNotification('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    try {
      // Convert local datetime to ISO string for storage
      const deadlineISO = new Date(editForm.deadline).toISOString();
      const taskData = {
        ...editForm,
        deadline: deadlineISO
      };

      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        showNotification('Tugas berhasil diperbarui!');
        setIsEditing(null);
        resetForm();
        loadTasks();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Update error:', error);
      showNotification('Gagal memperbarui tugas', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;

    try {
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('Tugas berhasil dihapus!');
        loadTasks();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Gagal menghapus tugas', 'error');
    }
  };

  const startEditTask = (task: Assignment) => {
    // Format deadline properly for datetime-local input
    const deadlineDate = new Date(task.deadline);
    // Convert to local time for datetime-local input
    const year = deadlineDate.getFullYear();
    const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
    const day = String(deadlineDate.getDate()).padStart(2, '0');
    const hours = String(deadlineDate.getHours()).padStart(2, '0');
    const minutes = String(deadlineDate.getMinutes()).padStart(2, '0');
    const localDeadlineString = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setEditForm({
      title: task.title,
      day: tasks.find(group => group.assignments.some(a => a.id === task.id))?.day || 0,
      deadline: localDeadlineString,
      description: task.description,
      acceptsLinks: task.acceptsLinks || false,
      acceptsFiles: task.acceptsFiles !== false,
      maxFileSize: task.maxFileSize || 2,
      instructionFiles: task.instructionFiles || [],
      instructionLinks: task.instructionLinks || []
    });
    setIsEditing(task.id);
  };

  const handleFileUpload = (files: (string | { name: string; url: string; size?: number })[]) => {
    setEditForm(prev => ({
      ...prev,
      instructionFiles: files
    }));
  };

  const handleLinkAttachment = (links: { name: string; url: string }[]) => {
    setEditForm(prev => ({
      ...prev,
      instructionLinks: links
    }));
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Tugas</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Tugas Baru
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {isCreating ? 'Tambah Tugas Baru' : 'Edit Tugas'}
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
                    Judul Tugas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan judul tugas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hari (Day) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.day}
                    onChange={(e) => setEditForm(prev => ({ ...prev, day: parseInt(e.target.value) || 0 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Waktu akan disimpan sesuai zona waktu lokal Anda
                </p>
                {editForm.deadline && (
                  <p className="text-xs text-blue-600 mt-1">
                    Preview: {new Date(editForm.deadline).toLocaleString('id-ID', {
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
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan deskripsi tugas"
                />
              </div>

              {/* Submission Options */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3">
                  Opsi Pengumpulan <span className="text-red-500">*</span>
                  <span className="text-sm font-normal text-gray-600 ml-2">(pilih minimal satu)</span>
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.acceptsLinks}
                      onChange={(e) => setEditForm(prev => ({ ...prev, acceptsLinks: e.target.checked }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Link size={16} />
                    <span>Terima pengumpulan melalui link</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.acceptsFiles}
                      onChange={(e) => setEditForm(prev => ({ ...prev, acceptsFiles: e.target.checked }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Upload size={16} />
                    <span>Terima upload file</span>
                  </label>

                  {editForm.acceptsFiles && (
                    <div className="ml-6">
                      <label className="block text-sm text-gray-600 mb-1">
                        Maksimal ukuran file (MB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={editForm.maxFileSize}
                        onChange={(e) => setEditForm(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                        className="w-24 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Instruction Files */}
              <div>
                <FileUploadWidget
                  files={editForm.instructionFiles}
                  onFilesChange={handleFileUpload}
                  endpoint="instructionFilesUploader"
                  label="File Petunjuk"
                  description="Upload file petunjuk untuk tugas ini (tanpa batasan ukuran)"
                  multiple={true}
                />
              </div>

              {/* Instruction Links */}
              <div>
                <LinkAttachmentWidget
                  links={editForm.instructionLinks}
                  onLinksChange={handleLinkAttachment}
                  label="Link Petunjuk"
                  description="Tambahkan link petunjuk untuk tugas ini"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={isCreating ? handleCreateTask : () => handleUpdateTask(isEditing!)}
                  disabled={!isFormValid()}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                    isFormValid() 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save size={20} />
                  {isCreating ? 'Buat Tugas' : 'Simpan Perubahan'}
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
                    {!editForm.title.trim() && <li>• Judul tugas</li>}
                    {!editForm.deadline && <li>• Deadline</li>}
                    {!editForm.description.trim() && <li>• Deskripsi</li>}
                    {editForm.day < 0 && <li>• Hari harus 0 atau lebih</li>}
                    {!editForm.acceptsFiles && !editForm.acceptsLinks && <li>• Pilih minimal satu opsi pengumpulan</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-6">
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">Belum ada tugas yang tersedia.</p>
            <p className="text-sm text-gray-500 mb-4">
              Klik &quot;Tambah Tugas Baru&quot; untuk membuat tugas pertama.
            </p>
          </div>
        ) : (
          tasks.map((dayGroup) => (
            <div key={dayGroup.day} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Day {dayGroup.day}
              </h3>
              <div className="space-y-3">
                {dayGroup.assignments.map((task) => (
                  <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Deadline: {new Date(task.deadline).toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {task.acceptsLinks && (
                            <span className="flex items-center gap-1">
                              <Link size={12} /> Link
                            </span>
                          )}
                          {task.acceptsFiles && (
                            <span className="flex items-center gap-1">
                              <Upload size={12} /> File ({task.maxFileSize}MB)
                            </span>
                          )}
                          {task.instructionFiles && task.instructionFiles.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText size={12} /> {task.instructionFiles.length} file petunjuk
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEditTask(task)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;
