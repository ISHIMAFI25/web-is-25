import { pgTable, bigserial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

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

export type Absensi = typeof absensi.$inferSelect;
export type NewAbsensi = typeof absensi.$inferInsert;
