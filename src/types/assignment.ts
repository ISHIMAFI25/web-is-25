// src/types/assignment.ts

// Interface untuk satu tugas
export interface Assignment {
  id: string;
  title: string;
  deadline: string; // Format ISO 8601 string, misal: "2025-08-01T23:59:00"
  description: string; // Deskripsi singkat tugas
  attachmentUrl?: string; // URL opsional untuk lampiran PDF
  instructionFiles?: (string | { name: string; url: string; size?: number })[]; // Array URL file petunjuk
  instructionLinks?: { name: string; url: string }[]; // Array link petunjuk
  acceptsLinks?: boolean; // Apakah tugas menerima link
  acceptsFiles?: boolean; // Apakah tugas menerima file upload
  maxFileSize?: number; // Maksimal ukuran file dalam MB
  createdAt?: string;
  updatedAt?: string;
}

// Interface untuk mengelompokkan tugas berdasarkan hari (DAY)
export interface DayGroup {
  day: number;
  assignments: Assignment[];
}

// Interface untuk form admin
export interface TaskForm {
  title: string;
  day: number;
  deadline: string;
  description: string;
  acceptsLinks: boolean;
  acceptsFiles: boolean;
  maxFileSize: number;
  instructionFiles: (string | { name: string; url: string; size?: number })[];
  instructionLinks: { name: string; url: string }[];
}
