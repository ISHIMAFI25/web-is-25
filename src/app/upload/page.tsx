// src/app/upload/page.tsx
// Ini adalah Server Component secara default

import FileUploadForm from '@/components/files/FileUploadForm';

export default function UploadPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <FileUploadForm />
    </div>
  );
}
