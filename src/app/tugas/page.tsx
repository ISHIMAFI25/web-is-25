// src/app/upload/page.tsx
// Ini adalah Server Component secara default

import AssignmentList from '@/components/assignments/AssignmentList'; // Impor komponen AssignmentList
import dummyAssignments from '@/lib/dummyAssignments'; // Impor data dummy
import Sidebar from "@/components/ui/sidebar";

export default function UploadPage() {
  return (
    <div className="flex min-h-screen items-start justify-center p-4"> {/* Ubah items-center menjadi items-start dan hapus bg-gray-100 */}
      {/* Sidebar Component */}
      <Sidebar />
      
      {/* Menggunakan komponen AssignmentList dan mengoper data dummy */}
      <AssignmentList assignmentsData={dummyAssignments} />
    </div>
  );
}
