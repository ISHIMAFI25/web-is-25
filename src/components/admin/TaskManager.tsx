// src/components/admin/TaskManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Assignment, DayGroup, TaskForm } from '@/types/assignment';
import { Plus, Edit, Trash2, Save, X, Upload, Link, FileText } from 'lucide-react';

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
    instructionFiles: []
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
      instructionFiles: []
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
      instructionFiles: task.instructionFiles || []
    });
    setIsEditing(task.id);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    // Convert FileList to array and create file info objects
    const fileInfos = Array.from(files).map(file => {
      // Create object URL for preview/download
      const objectUrl = URL.createObjectURL(file);
      
      // Create file info object with metadata
      return {
        url: objectUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };
    });
    
    // Add file URLs to the form (for backward compatibility, we'll store just URLs)
    const fileUrls = fileInfos.map(fileInfo => fileInfo.url);
    setEditForm(prev => ({
      ...prev,
      instructionFiles: [...prev.instructionFiles, ...fileUrls]
    }));
    
    // Show notification about uploaded files
    showNotification(`${fileInfos.length} file berhasil ditambahkan!`);
  };

  const removeInstructionFile = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      instructionFiles: prev.instructionFiles.filter((_, i) => i !== index)
    }));
  };

  // Helper function to get file name from URL or path
  const getFileName = (filePath: string): string => {
    // If it's a blob URL, try to get the original filename if available
    if (filePath.startsWith('blob:')) {
      // For new uploads, we might not have the original name, so show generic name
      return `file-${Date.now()}`;
    }
    
    // For regular paths, get the filename
    const parts = filePath.split('/');
    return parts[parts.length - 1] || 'unknown-file';
  };

  // Helper function to get file extension for icon
  const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  // Helper function to get file type icon
  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    
    // Document files
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['ppt', 'pptx'].includes(ext)) return '📊';
    if (['xls', 'xlsx'].includes(ext)) return '📈';
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) return '🖼️';
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
    
    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) return '🎥';
    
    // Audio files
    if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) return '🎵';
    
    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml'].includes(ext)) return '💻';
    if (['py', 'java', 'cpp', 'c', 'php', 'rb', 'go'].includes(ext)) return '⚙️';
    
    // Text files
    if (['txt', 'md', 'readme'].includes(ext)) return '📃';
    
    // Default file icon
    return '📎';
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Petunjuk
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="instruction-files"
                  />
                  <label
                    htmlFor="instruction-files"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <FileText size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Klik untuk upload file petunjuk
                    </span>
                    <span className="text-xs text-gray-400">
                      Semua jenis file diterima (PDF, DOC, PPT, ZIP, IMG, dll)
                    </span>
                  </label>
                </div>

                {editForm.instructionFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600 mb-2">
                      File yang ditambahkan ({editForm.instructionFiles.length}):
                    </p>
                    {editForm.instructionFiles.map((file, index) => {
                      const fileName = getFileName(file);
                      const fileIcon = getFileIcon(fileName);
                      
                      return (
                        <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-lg">{fileIcon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {fileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getFileExtension(fileName).toUpperCase()} File
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeInstructionFile(index)}
                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Hapus file"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
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
              Klik "Tambah Tugas Baru" untuk membuat tugas pertama.
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
