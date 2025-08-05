// src/types/assignment.ts

// Interface untuk satu tugas
export interface Assignment {
  id: string;
  title: string;
  deadline: string; // Format ISO 8601 string, misal: "2025-08-01T23:59:00"
  description: string; // Deskripsi singkat tugas
  attachmentUrl?: string; // URL opsional untuk lampiran PDF
}

// Interface untuk mengelompokkan tugas berdasarkan hari (DAY)
export interface DayGroup {
  day: number;
  assignments: Assignment[];
}
