// src/lib/dummyAssignments.ts

import { Assignment, DayGroup } from '@/types/assignment';

// Fungsi helper untuk mendapatkan tanggal di masa lalu atau masa depan
const getDate = (daysOffset: number, hours: number, minutes: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

// Data tugas dummy
const dummyAssignments: DayGroup[] = [
  {
    day: 1,
    assignments: [
      {
        id: 'task-1',
        title: 'Judul tugas 1',
        deadline: getDate(-1, 23, 59), // Contoh: Kemarin pukul 23:59
        description: 'Tugas ini mencakup pengantar dasar tentang konsep-konsep pemrograman. Pastikan Anda membaca semua materi yang diberikan.',
        attachmentUrl: '/dummy-assignment-1.pdf', // Contoh URL PDF
      },
    ],
  },
  {
    day: 2,
    assignments: [
      {
        id: 'task-2',
        title: 'Judul tugas 2',
        deadline: getDate(5, 23, 59), // Contoh: 5 hari dari sekarang pukul 23:59
        description: 'Latihan ini berfokus pada implementasi algoritma dasar. Perhatikan efisiensi kode Anda.',
        attachmentUrl: '/dummy-assignment-2.pdf',
      },
    ],
  },
  {
    day: 3,
    assignments: [
      {
        id: 'task-3',
        title: 'Judul tugas 3',
        deadline: getDate(-3, 10, 0), // Contoh: 3 hari lalu pukul 10:00
        description: 'Analisis kasus studi ini dan berikan solusi Anda. Perhatikan batasan waktu yang ketat.',
        attachmentUrl: '/dummy-assignment-3.pdf',
      },
      {
        id: 'task-4',
        title: 'Judul tugas 4',
        deadline: getDate(2, 18, 30), // Contoh: 2 hari dari sekarang pukul 18:30
        description: 'Proyek kelompok tentang pengembangan aplikasi web sederhana. Kolaborasi adalah kunci.',
        attachmentUrl: '/dummy-assignment-4.pdf',
      },
    ],
  },
  {
    day: 4,
    assignments: [
      {
        id: 'task-5',
        title: 'Judul tugas 5',
        deadline: getDate(10, 12, 0), // Contoh: 10 hari dari sekarang pukul 12:00
        description: 'Tugas riset tentang teknologi terbaru di bidang AI. Sertakan referensi yang relevan.',
        attachmentUrl: '/dummy-assignment-5.pdf',
      },
    ],
  },
];

export default dummyAssignments;
