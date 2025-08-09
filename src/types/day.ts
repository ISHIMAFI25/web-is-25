// src/types/day.ts
export interface DayInfo {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  dateTime: string; // ISO string
  location: string;
  specifications?: string;
  attachmentFiles: (string | { name: string; url: string; size?: number })[];
  attachmentLinks: { name: string; url: string }[];
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DayForm {
  dayNumber: number;
  title: string;
  description: string;
  dateTime: string; // For datetime-local input
  location: string;
  specifications: string;
  attachmentFiles: (string | { name: string; url: string; size?: number })[];
  attachmentLinks: { name: string; url: string }[];
  isVisible: boolean;
}
