import { pgTable, bigserial, varchar, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

// Interface untuk attachment files
interface AttachmentFile {
  url: string;
  name: string;
  size?: number;
}

// Interface untuk attachment links  
interface AttachmentLink {
  url: string;
  title: string;
  description?: string;
}

// Tabel untuk menyimpan task submissions
export const taskSubmissions = pgTable('task_submissions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  student_email: varchar('student_email', { length: 255 }).notNull(),
  student_name: varchar('student_name', { length: 255 }).notNull(),
  task_id: varchar('task_id', { length: 255 }).notNull(),
  task_day: integer('task_day').notNull(),
  submission_type: varchar('submission_type', { length: 50 }), // 'file', 'link', or 'both'
  submission_file_url: text('submission_file_url'),
  submission_file_name: text('submission_file_name'),
  submission_file_type: text('submission_file_type'),
  submission_link: text('submission_link'),
  submission_status: varchar('submission_status', { length: 50 }).default('draft'), // 'draft' or 'submitted'
  is_submitted: boolean('is_submitted').default(false),
  submitted_at: timestamp('submitted_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Tabel untuk menyimpan informasi hari/days
export const days = pgTable('days', {
  id: varchar('id', { length: 255 }).primaryKey(),
  day_number: integer('day_number').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  date_time: timestamp('date_time', { withTimezone: true }),
  location: text('location'),
  specifications: text('specifications'),
  attachment_files: jsonb('attachment_files').$type<AttachmentFile[]>().default([]),
  attachment_links: jsonb('attachment_links').$type<AttachmentLink[]>().default([]),
  is_visible: boolean('is_visible').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Tabel untuk menyimpan tugas/assignments
export const assignmentList = pgTable('assignment_list', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  day: integer('day').notNull(),
  deadline: timestamp('deadline', { withTimezone: true }),
  description: text('description'),
  attachment_url: text('attachment_url'),
  instruction_files: text('instruction_files'), // JSON array
  instruction_links: text('instruction_links'), // JSON array
  accepts_links: boolean('accepts_links').default(true),
  accepts_files: boolean('accepts_files').default(true),
  max_file_size: integer('max_file_size').default(10), // MB
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Tabel untuk menyimpan data absensi
export const absensi = pgTable('absensi', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  status_kehadiran: varchar('status_kehadiran', { length: 50 }).notNull(),
  jam: varchar('jam', { length: 10 }), // Format HH:MM untuk waktu menyusul/meninggalkan
  alasan: text('alasan'), // Alasan untuk tidak hadir/menyusul/meninggalkan
  foto_url: text('foto_url'), // URL foto bukti dari UploadThing
  waktu: timestamp('waktu', { withTimezone: true }).notNull().defaultNow(), // Waktu submit absensi
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Tabel untuk menyimpan informasi user yang dibuat oleh admin
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  nama_lengkap: varchar('nama_lengkap', { length: 255 }).notNull(),
  supabase_user_id: varchar('supabase_user_id', { length: 255 }).unique(), // ID dari Supabase auth
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type TaskSubmissions = typeof taskSubmissions.$inferSelect;
export type NewTaskSubmissions = typeof taskSubmissions.$inferInsert;

export type Days = typeof days.$inferSelect;
export type NewDays = typeof days.$inferInsert;

export type AssignmentList = typeof assignmentList.$inferSelect;
export type NewAssignmentList = typeof assignmentList.$inferInsert;

export type Absensi = typeof absensi.$inferSelect;
export type NewAbsensi = typeof absensi.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
