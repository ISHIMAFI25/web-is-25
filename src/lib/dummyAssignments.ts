// src/lib/dummyAssignments.ts

import { DayGroup } from '@/types/assignment';

// Fungsi helper untuk mendapatkan tanggal di masa lalu atau masa depan
const getDate = (daysOffset: number, hours: number, minutes: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

// Data tugas dummy untuk inisialisasi database
// Ini digunakan oleh API init-dummy-data, bukan untuk display langsung di UI
const dummyAssignments: DayGroup[] = [
  {
    day: 0,
    assignments: [
      {
        id: 'task-0-1754500000000',
        title: 'Persiapan dan Orientasi Sistem Informasi',
        deadline: getDate(7, 23, 59), // 7 hari dari sekarang pukul 23:59
        description: 'Tugas persiapan untuk memahami dasar-dasar sistem informasi dan persiapan lingkungan kerja. Pastikan Anda telah menyiapkan akun GitHub, menginstall VS Code, dan memahami konsep dasar web development. Baca materi pengantar yang telah disediakan dan siapkan diri untuk pembelajaran selanjutnya.',
        attachmentUrl: '/day0-orientation-guide.pdf',
        instructionFiles: ['/day0-orientation-guide.pdf', '/setup-guide.pdf'],
        acceptsLinks: true,
        acceptsFiles: true,
        maxFileSize: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
    ],
  },
];

export default dummyAssignments;
