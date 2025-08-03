// src/app/upload/page.tsx
// Ini adalah Client Component untuk mendukung sidebar

"use client";

import FileUploadForm from '@/components/files/FileUploadForm'; // Mengimpor komponen FileUploadForm
import Sidebar from '@/components/ui/sidebar'; // Mengimpor sidebar

export default function UploadPage() {
  return (
    <div className="min-h-screen relative">
      {/* Sidebar Component */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Menggunakan komponen FileUploadForm yang telah dibuat */}
        <FileUploadForm />
      </div>
    </div>
  );
}
