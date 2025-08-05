// src/components/files/FileUploadForm.tsx
'use client';

import { useState } from 'react';
// Import yang benar: Import `UploadDropzone` dan helper lainnya langsung dari file konfigurasi Uploadthing.
import { useUploadThing } from "@/utils/uploadthing";

const FileUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Files:", res);
      setMessage("File berhasil diunggah! Anda dapat melihatnya di dashboard Uploadthing.");
      setIsError(false);
    },
    onUploadError: (error) => {
      setMessage(`Error saat mengunggah: ${error.message}`);
      setIsError(true);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file) {
      startUpload([file]);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
      <h2 className="text-3xl font-bold text-gray-900">Unggah Tugas</h2>
      <p className="text-gray-700">Pilih file yang akan diunggah.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
        />
        <button
          type="submit"
          disabled={!file}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Unggah File
        </button>
      </form>

      {message && (
        <div className={`p-3 rounded-md text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default FileUploadForm;
