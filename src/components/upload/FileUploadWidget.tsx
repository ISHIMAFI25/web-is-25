// src/components/upload/FileUploadWidget.tsx
'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { useUploadThing } from "@/lib/uploadthing";
import { getFileIcon, getFileName, formatFileSize, validateFile } from '@/lib/uploadHelpers';

interface FileUploadWidgetProps {
  files: (string | { name: string; url: string; size?: number })[];
  onFilesChange: (files: (string | { name: string; url: string; size?: number })[]) => void;
  endpoint: "dayFilesUploader" | "instructionFilesUploader";
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  description?: string;
}

interface UploadedFileInfo {
  url: string;
  name: string;
  size: number;
}

const FileUploadWidget: React.FC<FileUploadWidgetProps> = ({
  files,
  onFilesChange,
  endpoint,
  multiple = true,
  maxSizeMB = 8,
  label = "Upload Files",
  description = "Pilih file untuk diupload"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      console.log("Files uploaded successfully:", res);
      if (res) {
        const newFiles = res.map(file => ({
          name: file.name,
          url: file.url,
          size: file.size
        }));
        onFilesChange([...files, ...newFiles]);
        setIsUploading(false);
        setUploadProgress(0);
        setError(null);
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setError(error.message || 'Upload gagal');
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError(null);
    
    // Validate files
    const fileArray = Array.from(selectedFiles);
    for (const file of fileArray) {
      const validation = validateFile(file, maxSizeMB);
      if (!validation.valid) {
        setError(validation.error || 'File tidak valid');
        return;
      }
    }

    // Start upload
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      await startUpload(fileArray);
    } catch (error) {
      console.error('Upload initiation error:', error);
      setError('Gagal memulai upload');
      setIsUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const openFile = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="flex items-center space-x-4">
          <label className={`
            inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors
            ${isUploading || isUploadThingUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            <Upload className="w-4 h-4 mr-2" />
            {isUploading || isUploadThingUploading ? 'Uploading...' : 'Pilih File'}
            <input
              type="file"
              multiple={multiple}
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading || isUploadThingUploading}
            />
          </label>
          
          {(isUploading || isUploadThingUploading) && (
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
          )}
        </div>
        
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        
        <p className="mt-1 text-xs text-gray-400">
          Maksimal {maxSizeMB}MB per file. Mendukung semua jenis file.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">File Terlampir:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => {
              // Handle both string format and object format
              const fileUrl = typeof file === 'string' ? file : file.url;
              const fileName = typeof file === 'string' 
                ? getFileName(file) 
                : file.name;
              const fileIcon = getFileIcon(fileName);
              
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-lg">{fileIcon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{fileName}</p>
                      {fileUrl.includes('uploadthing.com') || fileUrl.includes('utfs.io') ? (
                        <p className="text-xs text-green-600">✓ Tersimpan di cloud</p>
                      ) : (
                        <p className="text-xs text-gray-500">Local file</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => openFile(fileUrl)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Buka file"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      title="Hapus file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadWidget;
