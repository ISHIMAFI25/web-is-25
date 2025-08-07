import { pgTable, bigserial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

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

export type Absensi = typeof absensi.$inferSelect;
export type NewAbsensi = typeof absensi.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
