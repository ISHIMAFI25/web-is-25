// src/components/files/FileUploadForm.tsx
"use client"; // Ini menandakan bahwa ini adalah Client Component

import React, { useState } from 'react';

interface FileUploadFormProps {
  // Tidak ada props eksternal yang diperlukan saat ini
}

const FileUploadForm: React.FC<FileUploadFormProps> = () => {
  // State untuk menyimpan file yang dipilih oleh pengguna
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // State untuk mengelola status loading saat submit file
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State untuk menyimpan pesan sukses atau error
  const [message, setMessage] = useState<string>('');
  // State untuk menentukan apakah pesan adalah error atau sukses
  const [isError, setIsError] = useState<boolean>(false);

  // Fungsi untuk menangani perubahan pada input file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(''); // Reset pesan sebelumnya
    setIsError(false); // Reset status error
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]); // Ambil file pertama yang dipilih
    } else {
      setSelectedFile(null); // Jika tidak ada file, set null
    }
  };

  // Fungsi untuk menangani submit form (mengunggah file)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Mencegah refresh halaman default

    setMessage(''); // Reset pesan sebelumnya
    setIsError(false); // Reset status error

    if (!selectedFile) {
      setMessage('Silakan pilih file terlebih dahulu.');
      setIsError(true);
      return;
    }

    setIsLoading(true); // Aktifkan status loading

    try {
      // --- SIMULASI UPLOAD FILE KE BACKEND ---
      // Dalam aplikasi nyata, Anda akan menggunakan FormData dan fetch API
      // untuk mengirim file ke API backend Anda.
      // Contoh:
      // const formData = new FormData();
      // formData.append('assignmentFile', selectedFile);
      // const response = await fetch('/api/upload-assignment', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'Gagal mengunggah file.');
      // }

      // Simulasi sukses upload
      await new Promise(resolve => setTimeout(resolve, 2000)); // Penundaan 2 detik
      setMessage(`File "${selectedFile.name}" berhasil diunggah!`);
      setIsError(false);
      setSelectedFile(null); // Reset input file setelah sukses
      (event.target as HTMLFormElement).reset(); // Mengatur ulang form untuk membersihkan input file
      console.log('File berhasil diunggah:', selectedFile.name);

    } catch (error: any) {
      // Jika upload gagal
      setMessage(error.message || 'Terjadi kesalahan saat mengunggah file.');
      setIsError(true);
      console.error('Gagal mengunggah file:', error);
    } finally {
      setIsLoading(false); // Nonaktifkan status loading
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-900">Unggah Tugas</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
            Pilih File Tugas
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">File terpilih: {selectedFile.name}</p>
          )}
        </div>

        {/* Menampilkan pesan sukses/error */}
        {message && (
          <div className={`p-3 rounded-md text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || !selectedFile} // Nonaktifkan tombol saat loading atau belum ada file
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Mengunggah...' : 'Kirim Tugas'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FileUploadForm;
