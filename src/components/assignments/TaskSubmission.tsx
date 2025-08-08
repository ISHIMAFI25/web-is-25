// src/components/assignments/TaskSubmission.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useUploadThing } from '@/utils/uploadthing';

interface TaskSubmissionProps {
  taskId: string;
  taskDay: number;
  taskTitle: string;
  deadline: string;
  onSubmissionSuccess: () => void;
}

interface SubmissionData {
  id: string;
  submission_file_url: string;
  submission_file_name: string;
  submitted_at: string;
  is_submitted: boolean;
}

interface UploadedFile {
  url: string;
  name: string;
  type: string;
}

const TaskSubmission: React.FC<TaskSubmissionProps> = ({ 
  taskId, 
  taskDay, 
  // taskTitle is used for logging/debugging purposes but not displayed in UI
  // taskTitle, 
  deadline,
  onSubmissionSuccess 
}) => {
  const { user } = useAuth();
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
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
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg text-sm z-50 max-w-sm shadow-lg`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, type === 'error' ? 6000 : 4000);
  };

  const { startUpload } = useUploadThing("taskUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        const file = res[0];
        setUploadedFile({
          url: file.ufsUrl || file.url, // Use ufsUrl with fallback to url
          name: file.name,
          type: file.type || 'application/octet-stream'
        });
        // Auto save as draft when file is uploaded
        saveDraft(file.ufsUrl || file.url, file.name, file.type || 'application/octet-stream');
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

  // Save file as draft
  const saveDraft = async (fileUrl: string, fileName: string, fileType: string) => {
    if (!user?.email) return;

    // Get user name with multiple fallbacks
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
          studentName: studentName, // Use the studentName variable
          taskId: taskId,
          taskDay: taskDay,
          submissionFileUrl: fileUrl,
          submissionFileName: fileName,
          submissionFileType: fileType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionData({...data.submission, is_submitted: false});
        console.log('Draft saved successfully:', data.submission);
        
        // Show a notification that file is saved to database
        showNotification('✅ File berhasil diupload', 'success');
      } else {
        console.error('Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Check if user has already submitted this task
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
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setSubmissionData(data.submission);
          // If there's an existing submission, also set it as uploaded file
          setUploadedFile({
            url: data.submission.submission_file_url,
            name: data.submission.submission_file_name,
            type: data.submission.submission_file_type || 'existing'
          });
          // Only reset click states if submission is not submitted (draft state)
          if (!data.submission.is_submitted) {
            setHasClickedSubmit(false);
            setHasClickedUnsubmit(false);
          }
        }
      }
    } catch (error) {
      console.error('Error checking submission status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, taskId]);

  // Submit task to database
  const submitTask = async () => {
    console.log('🔄 submitTask called');
    
    // Simple validation check
    if (!user?.email || !uploadedFile || hasClickedSubmit || isSubmitting || isUploading) {
      console.log('❌ submitTask blocked - missing requirements');
      return;
    }

    console.log('✅ submitTask proceeding...');
    
    // Get user name with multiple fallbacks
    const studentName = user.user_metadata?.full_name || 
                       user.user_metadata?.display_name || 
                       user.user_metadata?.name ||
                       user.email?.split('@')[0] || 
                       'User';
    
    console.log('📤 Request data:', {
      studentEmail: user.email,
      studentName: studentName,
      taskId: taskId,
      taskDay: taskDay,
      submissionFileUrl: uploadedFile.url,
      submissionFileName: uploadedFile.name,
      submissionFileType: uploadedFile.type,
    });
    
    console.log('🔍 Individual field check:');
    console.log('  - studentEmail:', user.email, typeof user.email);
    console.log('  - studentName:', studentName, typeof studentName);
    console.log('  - taskId:', taskId, typeof taskId);
    console.log('  - taskDay:', taskDay, typeof taskDay);
    console.log('  - submissionFileUrl:', uploadedFile.url, typeof uploadedFile.url);
    console.log('  - submissionFileName:', uploadedFile.name, typeof uploadedFile.name);
    console.log('  - submissionFileType:', uploadedFile.type, typeof uploadedFile.type);
    
    // Check each required field
    const requiredFields = [
      { name: 'studentEmail', value: user.email },
      { name: 'studentName', value: studentName },
      { name: 'taskId', value: taskId },
      { name: 'taskDay', value: taskDay },
      { name: 'submissionFileUrl', value: uploadedFile.url },
      { name: 'submissionFileName', value: uploadedFile.name },
      { name: 'submissionFileType', value: uploadedFile.type }
    ];
    
    const missingFields = requiredFields.filter(field => {
      if (field.name === 'taskDay') {
        return field.value === undefined || field.value === null;
      }
      return !field.value;
    });
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields.map(f => f.name));
      missingFields.forEach(field => {
        console.error(`  - ${field.name}: ${field.value} (type: ${typeof field.value})`);
      });
      
      showNotification(`❌ Missing required fields: ${missingFields.map(f => f.name).join(', ')}`, 'error');
      setIsSubmitting(false);
      return;
    }
    
    setHasClickedSubmit(true);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: user.email,
          studentName: studentName, // Use the studentName variable we defined above
          taskId: taskId,
          taskDay: Number(taskDay), // Ensure taskDay is a number
          submissionFileUrl: uploadedFile.url, // This is already the correct URL from ufsUrl
          submissionFileName: uploadedFile.name,
          submissionFileType: uploadedFile.type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionData({...data.submission, is_submitted: true});
        onSubmissionSuccess();
        
        showNotification(' Tugas berhasil dikumpulkan!', 'success');
        
        // Keep hasClickedSubmit true to prevent multiple clicks even after success
      } else {
        const errorData = await response.json();
        console.error('❌ Submit failed:', errorData);
        
        showNotification(`❌ Error: ${errorData.error}`, 'error');
        
        // Only reset click state on error so user can try again
        setHasClickedSubmit(false);
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      
      showNotification('❌ Error submitting task. Please try again.', 'error');
      
      // Reset click state on error so user can try again
      setHasClickedSubmit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unsubmit task
  const unsubmitTask = async () => {
    if (!submissionData?.id || hasClickedUnsubmit) return;

    setHasClickedUnsubmit(true);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/unsubmit-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submissionData.id,
        }),
      });

      if (response.ok) {
        setSubmissionData({...submissionData, is_submitted: false});
        // Reset submit click state when unsubmitting
        setHasClickedSubmit(false);
        
        showNotification('✅ Pengumpulan tugas dibatalkan. Anda masih bisa mengumpulkan ulang.', 'info');
        
      } else {
        const errorData = await response.json();
        
        showNotification(`❌ Error: ${errorData.error}`, 'error');
        
        // Reset click state on error so user can try again
        setHasClickedUnsubmit(false);
      }
    } catch (error) {
      console.error('Error unsubmitting task:', error);
      
      showNotification('❌ Error canceling submission. Please try again.', 'error');
      
      // Reset click state on error so user can try again
      setHasClickedUnsubmit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection and upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setIsUploading(true);
      startUpload([files[0]]);
    }
  };

  useEffect(() => {
    checkSubmissionStatus();
  }, [user?.email, taskId, checkSubmissionStatus]);

  // Check if there's a draft (uploaded but not submitted)
  const hasDraft = submissionData && !submissionData.is_submitted && uploadedFile;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-800"></div>
        <span className="ml-2 text-amber-800">Checking submission status...</span>
      </div>
    );
  }

  if (submissionData?.is_submitted) {
    return (
      <div className="mt-4 p-4 rounded-lg border-2 border-green-500 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="font-semibold text-green-800">Tugas Telah Dikumpulkan</span>
          </div>
          {!isDeadlinePassed() && (
            <button
              onClick={unsubmitTask}
              disabled={isSubmitting || hasClickedUnsubmit}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : hasClickedUnsubmit ? 'Sedang Diproses...' : 'Batalkan Pengumpulan'}
            </button>
          )}
        </div>
        <div className="mt-2 text-sm text-green-700">
          <p><strong>File:</strong> {submissionData.submission_file_name}</p>
          <p><strong>Dikumpulkan pada:</strong> {new Date(submissionData.submitted_at).toLocaleString('id-ID')}</p>
          <a 
            href={submissionData.submission_file_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
            Lihat File yang Dikumpulkan
          </a>
        </div>
      </div>
    );
  }

  if (isDeadlinePassed()) {
    return (
      <div className="mt-4 p-4 rounded-lg border-2 border-red-500 bg-red-50">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="font-semibold text-red-800">Deadline Telah Berakhir</span>
        </div>
        <p className="mt-2 text-sm text-red-700">
          Anda tidak dapat lagi mengumpulkan tugas ini karena deadline telah berakhir.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-lg border-2 border-amber-500 bg-amber-50">
      <h4 className="font-semibold text-amber-800 mb-3">Kumpulkan Tugas</h4>
      <p className="text-sm text-amber-700 mb-4">
        Upload file tugas Anda dalam format gambar (JPG, PNG) atau PDF. Maksimal ukuran file 2MB.
      </p>

      {/* Draft Status Banner */}
      {hasDraft && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div className="text-sm text-green-800">
              <span className="font-medium">File Tersimpan: </span> {uploadedFile?.name}
              <span className="block text-green-600">Status: Unsubmitted - File dapat diganti atau disubmit sebagai tugas final.</span>
            </div>
          </div>
        </div>
      )}
      
      {/* File Upload Section */}
      {!uploadedFile && (
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-amber-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-800 file:text-white hover:file:bg-amber-700 disabled:opacity-50"
          />
          
          {isUploading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-800"></div>
              <span className="text-sm text-amber-700">Mengupload file...</span>
            </div>
          )}

          {/* Show message when no file uploaded */}
          {!isUploading && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span className="text-sm text-yellow-800">Pilih file terlebih dahulu sebelum dapat mengumpulkan tugas.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Preview Section */}
      {uploadedFile && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border-2 border-amber-300">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-amber-800">Preview File</h5>
              {submissionData && !submissionData.is_submitted && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  draft
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {uploadedFile.type.startsWith('image/') ? (
                  <Image
                    src={uploadedFile.url}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-red-100 rounded border flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {uploadedFile.type.startsWith('image/') ? 'Gambar' : 'PDF'}
                </p>
              </div>
              <div className="flex space-x-2">
                <a
                  href={uploadedFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Lihat
                </a>
                {/* Only show "Ganti" button if not submitted yet and not in uploading/submitting state */}
                {(!submissionData?.is_submitted && !isUploading && !isSubmitting && !hasClickedSubmit) && (
                  <button
                    onClick={() => {
                      // Reset uploaded file to allow new upload
                      setUploadedFile(null);
                      // Reset submission data if it's still a draft (not submitted)
                      if (submissionData && !submissionData.is_submitted) {
                        setSubmissionData(null);
                      }
                      // Reset click states to allow new submission
                      setHasClickedSubmit(false);
                      setHasClickedUnsubmit(false);
                    }}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    Ganti
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex space-x-3">
            {!submissionData || !submissionData.is_submitted ? (
              <div className="flex-1">
                <button
                  onClick={() => {
                    console.log('🎯 Kumpulkan Tugas button clicked!');
                    submitTask();
                  }}
                  disabled={isSubmitting || hasClickedSubmit || isUploading || !uploadedFile || (submissionData?.is_submitted)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Mengupload...</span>
                    </div>
                  ) : isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Mengumpulkan...</span>
                    </div>
                  ) : hasClickedSubmit ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sedang Diproses...</span>
                    </div>
                  ) : (
                    'Kumpulkan Tugas'
                  )}
                </button>
                
                {/* Show helper text when button is disabled */}
                {(isUploading || !uploadedFile) && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {isUploading ? 'Tunggu upload selesai...' : 'Upload file terlebih dahulu'}
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={unsubmitTask}
                disabled={isSubmitting || hasClickedUnsubmit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {isSubmitting ? 'Processing...' : hasClickedUnsubmit ? 'Sedang Diproses...' : 'Batalkan Pengumpulan'}
              </button>
            )}
          </div>

          {/* Draft Status Info */}
          {submissionData && !submissionData.is_submitted && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-sm text-green-800">
                  <p className="font-medium">Unsubmitted</p>
                  <p className="text-green-600">• File aman tersimpan dan tidak akan hilang saat refresh</p>
                  <p className="text-green-600">• Anda masih bisa mengganti file sebelum submit final</p>
                  <p className="text-green-600">• Klik &quot;Kumpulkan Tugas&quot; untuk mengubah status menjadi &quot;Submitted&quot;</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskSubmission;
