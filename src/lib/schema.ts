import { pgTable, serial, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }),
  // tambahkan kolom lain sesuai kebutuhan
});

export const countdownSettings = pgTable('countdown_settings', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  targetTime: timestamp('target_time').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  showOnlyCountdown: boolean('show_only_countdown').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});