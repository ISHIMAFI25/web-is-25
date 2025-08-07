// src/app/upload/page.tsx
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import FileUploadForm from '@/components/files/FileUploadForm';
import Sidebar from "@/components/ui/sidebar";
import { Compass, ScrollText } from "lucide-react";

function UploadContent() {
  return (
    <div className="flex min-h-screen items-start justify-center p-4">
      {/* Efek kompas di pojok */}
      <div className="fixed top-10 right-10 w-32 h-32 opacity-30 z-10">
        <Compass size={128} className="text-amber-800" />
      </div>
      
      {/* Efek gulungan di pojok kiri */}
      <div className="fixed bottom-10 left-10 w-24 h-24 opacity-35 z-10">
        <ScrollText size={96} className="text-amber-900" />
      </div>

      {/* Sidebar Component */}
      <Sidebar />
      
      {/* File Upload Form */}
      <FileUploadForm />
    </div>
  );
}

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadContent />
    </ProtectedRoute>
  );
}
