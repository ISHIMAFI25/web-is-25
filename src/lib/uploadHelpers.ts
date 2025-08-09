// src/lib/uploadHelpers.ts
import { useUploadThing } from "@/lib/uploadthing";

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type?: string;
}

export interface UploadResponse {
  success: boolean;
  files?: UploadedFile[];
  error?: string;
}

// Helper function to upload files to UploadThing
export const uploadFilesToUploadThing = async (
  files: File[],
  endpoint: "dayFilesUploader" | "instructionFilesUploader"
): Promise<UploadResponse> => {
  try {
    // We'll use this in components with the useUploadThing hook
    return { success: false, error: "Use uploadFiles from useUploadThing hook" };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
};

// Helper function to get file extension
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

// Helper function to get file icon
export const getFileIcon = (filename: string | undefined | null): string => {
  if (!filename) return '📎';
  
  const ext = getFileExtension(filename);
  
  if (['pdf'].includes(ext)) return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['ppt', 'pptx'].includes(ext)) return '📊';
  if (['xls', 'xlsx'].includes(ext)) return '📈';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) return '🖼️';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) return '🎥';
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) return '🎵';
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml'].includes(ext)) return '💻';
  if (['py', 'java', 'cpp', 'c', 'php', 'rb', 'go'].includes(ext)) return '⚙️';
  if (['txt', 'md', 'readme'].includes(ext)) return '📃';
  
  return '📎';
};

// Helper function to get file name from URL or file object
export const getFileName = (file: string | { name: string; url: string; size?: number } | undefined | null): string => {
  if (!file) return 'unknown-file';
  
  // If it's an object with name property, use the name
  if (typeof file === 'object' && file.name) {
    return file.name;
  }
  
  // If it's a string (URL)
  const filePath = typeof file === 'string' ? file : '';
  
  // If it's a blob URL, return generic name
  if (filePath.startsWith('blob:')) {
    return `file-${Date.now()}`;
  }
  
  // If it's an UploadThing URL, extract the filename
  if (filePath.includes('uploadthing.com') || filePath.includes('utfs.io')) {
    const parts = filePath.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Try to extract original filename if it exists
    if (lastPart.includes('-') && lastPart.length > 20) {
      // UploadThing format: timestamp-originalname
      const dashIndex = lastPart.indexOf('-');
      if (dashIndex > 0 && dashIndex < lastPart.length - 1) {
        return lastPart.substring(dashIndex + 1);
      }
    }
    
    return lastPart;
  }
  
  // For regular paths, get the filename
  const parts = filePath.split('/');
  return parts[parts.length - 1] || 'unknown-file';
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to validate file type and size
export const validateFile = (file: File, maxSizeMB: number = 8): { valid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File "${file.name}" melebihi ukuran maksimum ${maxSizeMB}MB`
    };
  }
  
  return { valid: true };
};
