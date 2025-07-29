// src/app/upload/page.tsx
// Ini adalah Server Component secara default

import FileUploadForm from '@/components/files/FileUploadForm'; // Mengimpor komponen FileUploadForm

export default function UploadPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {/* Menggunakan komponen FileUploadForm yang telah dibuat */}
      <FileUploadForm />
    </div>
  );
}
