// src/components/assignments/TaskSubmissionWithLink.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useUploadThing } from '@/utils/uploadthing';
import { Assignment } from '@/types/assignment';
import { Upload, Link, FileText, CheckCircle, XCircle } from 'lucide-react';

interface TaskSubmissionProps {
  taskId: string;
  taskDay: number;
  taskTitle: string;
  deadline: string;
  assignment: Assignment; // Full assignment data for flexible submission options
  onSubmissionSuccess: () => void;
}

interface SubmissionData {
  id: string;
  submission_file_url?: string;
  submission_file_name?: string;
  submission_link?: string;
  submitted_at: string;
  is_submitted: boolean;
  submission_type: 'file' | 'link' | 'both';
}

interface UploadedFile {
  url: string;
  name: string;
  type: string;
}

const TaskSubmissionWithLink: React.FC<TaskSubmissionProps> = ({ 
  taskId, 
  taskDay, 
  taskTitle,
  deadline,
  assignment,
  onSubmissionSuccess 
}) => {
  const { user } = useAuth();
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [submissionLink, setSubmissionLink] = useState<string>('');
  const [submissionType, setSubmissionType] = useState<'file' | 'link' | 'both'>('both');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasClickedSubmit, setHasClickedSubmit] = useState<boolean>(false);
  const [hasClickedUnsubmit, setHasClickedUnsubmit] = useState<boolean>(false);

  // Helper function to show notifications
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.innerHTML = message;
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg text-sm z-50 max-w-sm shadow-lg transform transition-all duration-300`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, type === 'error' ? 6000 : 4000);
  };

  const { startUpload } = useUploadThing("taskUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        const file = res[0];
        setUploadedFile({
          url: file.ufsUrl || file.url,
          name: file.name,
          type: file.type || 'application/octet-stream'
        });
        saveDraft('both', file.ufsUrl || file.url, file.name, file.type || 'application/octet-stream');
      }
      setIsUploading(false);
    },
    onUploadError: (error: Error) => {
      showNotification(`❌ Upload Error: ${error.message}`, 'error');
      setIsUploading(false);
    },
  });

  // Check if deadline has passed
  const isDeadlinePassed = (): boolean => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return deadlineDate < now;
  };

  // Save submission as draft
  const saveDraft = async (type: 'file' | 'link' | 'both', fileUrl?: string, fileName?: string, fileType?: string, link?: string) => {
    if (!user?.email) return;

    const studentName = user.user_metadata?.full_name || 
                       user.user_metadata?.display_name || 
                       user.user_metadata?.name ||
                       user.email?.split('@')[0] || 
                       'User';

    try {
      const response = await fetch('/api/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: user.email,
          studentName: studentName,
          taskId: taskId,
          taskDay: taskDay,
          submissionType: type,
          submissionFileUrl: fileUrl || uploadedFile?.url,
          submissionFileName: fileName || uploadedFile?.name,
          submissionFileType: fileType || uploadedFile?.type,
          submissionLink: link || submissionLink,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionData({...data.submission, is_submitted: false});
        
        if (type === 'file') {
          showNotification('✅ File berhasil diupload dan disimpan sebagai draft', 'success');
        } else if (type === 'link') {
          showNotification('✅ Link berhasil disimpan sebagai draft', 'success');
        } else {
          showNotification('✅ File dan link berhasil disimpan sebagai draft', 'success');
        }
      } else {
        console.error('Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Handle link submission
  const handleLinkSubmission = () => {
    if (!submissionLink.trim()) {
      showNotification('❌ Silakan masukkan link terlebih dahulu', 'error');
      return;
    }

    // Validate URL format
    try {
      new URL(submissionLink);
    } catch {
      showNotification('❌ Format link tidak valid', 'error');
      return;
    }

    saveDraft('both');
  };

  // Check submission status
  const checkSubmissionStatus = useCallback(async () => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/check-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: user.email,
          taskId: taskId,
          taskDay: taskDay,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.submission) {
          setSubmissionData(data.submission);
          
          if (data.submission.submission_file_url) {
            setUploadedFile({
              url: data.submission.submission_file_url,
              name: data.submission.submission_file_name || 'Unknown file',
              type: 'application/octet-stream'
            });
          }
          
          if (data.submission.submission_link) {
            setSubmissionLink(data.submission.submission_link);
          }
          
          setSubmissionType('both');
        }
      }
    } catch (error) {
      console.error('Error checking submission status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, taskId, taskDay]);

  // Submit task
  const handleSubmit = async () => {
    if (!user?.email) {
      showNotification('❌ User tidak ditemukan', 'error');
      return;
    }

    // Check if at least one submission method is provided
    const hasFile = uploadedFile?.url;
    const hasLink = submissionLink.trim();
    
    if (!hasFile && !hasLink) {
      showNotification('❌ Silakan upload file atau masukkan link (atau keduanya)', 'error');
      return;
    }

    // If both link and file options are enabled, require appropriate submissions
    if (assignment.acceptsLinks && assignment.acceptsFiles) {
      // Allow either file, link, or both
    } else if (assignment.acceptsFiles && !hasFile) {
      showNotification('❌ Silakan upload file terlebih dahulu', 'error');
      return;
    } else if (assignment.acceptsLinks && !hasLink) {
      showNotification('❌ Silakan masukkan link terlebih dahulu', 'error');
      return;
    }

    if (isDeadlinePassed()) {
      showNotification('❌ Deadline sudah terlewat', 'error');
      return;
    }

    setIsSubmitting(true);
    setHasClickedSubmit(true);

    const studentName = user.user_metadata?.full_name || 
                       user.user_metadata?.display_name || 
                       user.user_metadata?.name ||
                       user.email?.split('@')[0] || 
                       'User';

    try {
      const response = await fetch('/api/submit-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: user.email,
          studentName: studentName,
          taskId: taskId,
          taskDay: taskDay,
          submissionType: 'both',
          submissionFileUrl: uploadedFile?.url,
          submissionFileName: uploadedFile?.name,
          submissionFileType: uploadedFile?.type,
          submissionLink: submissionLink,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionData({...data.submission, is_submitted: true});
        showNotification('✅ Tugas berhasil dikumpulkan!', 'success');
        onSubmissionSuccess();
      } else {
        const errorData = await response.json();
        showNotification(`❌ Gagal mengumpulkan tugas: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      showNotification('❌ Terjadi kesalahan saat mengumpulkan tugas', 'error');
    } finally {
      setIsSubmitting(false);
      setHasClickedSubmit(false);
    }
  };

  // Unsubmit task
  const handleUnsubmit = async () => {
    if (!user?.email) {
      showNotification('❌ User tidak ditemukan', 'error');
      return;
    }

    setHasClickedUnsubmit(true);

    try {
      const response = await fetch('/api/unsubmit-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: user.email,
          taskId: taskId,
          taskDay: taskDay,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionData({...data.submission, is_submitted: false});
        showNotification('✅ Pengumpulan tugas dibatalkan', 'success');
        onSubmissionSuccess();
      } else {
        const errorData = await response.json();
        showNotification(`❌ Gagal membatalkan pengumpulan: ${errorData.error}`, 'error');
      }
    } catch (error) {
      console.error('Error unsubmitting task:', error);
      showNotification('❌ Terjadi kesalahan saat membatalkan pengumpulan', 'error');
    } finally {
      setHasClickedUnsubmit(false);
    }
  };

  useEffect(() => {
    checkSubmissionStatus();
  }, [checkSubmissionStatus]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const hasMultipleOptions = assignment.acceptsFiles && assignment.acceptsLinks;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>Status:</span>
          {submissionData?.is_submitted ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle size={16} />
              Sudah dikumpulkan
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-600">
              <XCircle size={16} />
              Draft
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600">
          Deadline: {new Date(deadline).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>

        {isDeadlinePassed() && (
          <p className="text-sm text-red-600 font-medium">
            ⚠️ Deadline sudah terlewat
          </p>
        )}
      </div>

      {/* Submission Type Selection */}
      {hasMultipleOptions && !submissionData?.is_submitted && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Cara Pengumpulan yang Didukung:
          </h4>
          <div className="flex gap-4 text-sm text-blue-700">
            {assignment.acceptsFiles && (
              <span className="flex items-center gap-1">
                <Upload size={14} />
                Upload File
              </span>
            )}
            {assignment.acceptsLinks && (
              <span className="flex items-center gap-1">
                <Link size={14} />
                Kirim Link
              </span>
            )}
          </div>
          <p className="text-xs text-blue-600 mt-1">
            💡 Anda bisa mengirim file dan link sekaligus, atau salah satu saja.
          </p>
        </div>
      )}

      {/* File Upload Section */}
      {assignment.acceptsFiles && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Upload size={16} />
            Upload File
          </h4>
          {!uploadedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files[0]) {
                    const maxSize = (assignment.maxFileSize || 2) * 1024 * 1024; // Convert MB to bytes
                    if (files[0].size > maxSize) {
                      showNotification(`❌ File terlalu besar. Maksimal ${assignment.maxFileSize || 2}MB`, 'error');
                      return;
                    }
                    setIsUploading(true);
                    startUpload([files[0]]);
                  }
                }}
                className="hidden"
                id="file-upload"
                disabled={isUploading || submissionData?.is_submitted}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.zip,.rar"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer ${
                  isUploading || submissionData?.is_submitted
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-gray-50'
                } transition-colors`}
              >
                <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {isUploading ? 'Mengupload...' : 'Klik untuk upload file'}
                </p>
                <p className="text-xs text-gray-400">
                  Maksimal {assignment.maxFileSize || 2}MB • PDF, DOC, DOCX, JPG, PNG, TXT, ZIP, RAR
                </p>
              </label>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{uploadedFile.name}</p>
                  <p className="text-xs text-green-600">File berhasil diupload</p>
                </div>
                {!submissionData?.is_submitted && (
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setSubmissionData(null);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Link Submission Section */}
      {assignment.acceptsLinks && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Link size={16} />
            Link Pengumpulan
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="url"
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
                placeholder="https://example.com/your-submission"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submissionData?.is_submitted}
              />
            </div>
            {!submissionData?.is_submitted && (
              <button
                onClick={handleLinkSubmission}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!submissionLink.trim()}
              >
                Simpan
              </button>
            )}
          </div>
          {submissionLink && submissionData && !submissionData.is_submitted && (
            <p className="text-xs text-green-600 mt-1">✅ Link disimpan sebagai draft</p>
          )}
        </div>
      )}

      {/* Instruction Files */}
      {assignment.instructionFiles && assignment.instructionFiles.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">File Petunjuk:</h4>
          <div className="space-y-1">
            {assignment.instructionFiles.map((file, index) => (
              <a
                key={index}
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline block"
              >
                📄 {file.split('/').pop()}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!submissionData?.is_submitted ? (
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              hasClickedSubmit || 
              isDeadlinePassed() ||
              (!uploadedFile && !submissionLink.trim())
            }
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              isSubmitting || hasClickedSubmit || isDeadlinePassed() ||
              (!uploadedFile && !submissionLink.trim())
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSubmitting || hasClickedSubmit ? 'Mengumpulkan...' : '✓ Kumpulkan Tugas'}
          </button>
        ) : (
          <button
            onClick={handleUnsubmit}
            disabled={hasClickedUnsubmit || isDeadlinePassed()}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              hasClickedUnsubmit || isDeadlinePassed()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {hasClickedUnsubmit ? 'Membatalkan...' : '✗ Batalkan Pengumpulan'}
          </button>
        )}
      </div>

      {submissionData?.is_submitted && submissionData.submitted_at && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Dikumpulkan pada: {new Date(submissionData.submitted_at).toLocaleString('id-ID')}
        </p>
      )}
    </div>
  );
};

export default TaskSubmissionWithLink;
