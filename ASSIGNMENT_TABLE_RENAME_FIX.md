# 🔧 Perubahan Nama Tabel: assignments → assignment_list

## ✅ Masalah yang Diselesaikan
List tugas tidak muncul di halaman `/tugas` karena nama tabel di database telah diubah dari `assignments` menjadi `assignment_list` di Supabase.

## 📋 File yang Diperbarui

### 1. API Endpoints
- **`src/app/api/tasks/route.ts`** - GET endpoint untuk mengambil semua tugas
- **`src/app/api/admin/tasks/route.ts`** - GET/POST endpoint untuk admin
- **`src/app/api/admin/tasks/[taskId]/route.ts`** - PUT/DELETE endpoint untuk admin
- **`src/app/api/admin/init-dummy-data/route.ts`** - Endpoint untuk inisialisasi data dummy

### 2. Database Schema
- **`src/lib/db/schema.ts`** - Menambahkan definisi tabel `assignment_list`

## 🔄 Perubahan Detail

### Dari:
```typescript
.from('assignments')
```

### Menjadi:
```typescript
.from('assignment_list')
```

## 🗄️ Schema Database Baru

```typescript
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
```

## 🚀 Hasil yang Diharapkan

Setelah perubahan ini:
- ✅ Halaman `/tugas` akan menampilkan daftar tugas dari database
- ✅ Admin dapat mengelola tugas di dashboard admin
- ✅ API endpoints menggunakan nama tabel yang benar
- ✅ Schema TypeScript sudah sinkron dengan database

## 🔍 Cara Verifikasi

1. **Akses halaman tugas**: `http://localhost:3000/tugas`
2. **Periksa console browser** untuk memastikan tidak ada error
3. **Test API directly**:
   ```javascript
   fetch('/api/tasks').then(r => r.json()).then(console.log)
   ```

## ⚠️ Catatan Penting

Pastikan tabel `assignment_list` sudah ada di Supabase dengan struktur kolom yang sesuai:
- `id` (varchar, primary key)
- `title` (varchar, not null)
- `day` (integer, not null)
- `deadline` (timestamp with timezone)
- `description` (text)
- `attachment_url` (text)
- `instruction_files` (text - JSON array)
- `instruction_links` (text - JSON array)
- `accepts_links` (boolean, default true)
- `accepts_files` (boolean, default true)
- `max_file_size` (integer, default 10)
- `created_at` (timestamp with timezone, default now)
- `updated_at` (timestamp with timezone, default now)

---

**Status**: ✅ **SELESAI** - Semua referensi ke tabel sudah diperbarui dari `assignments` ke `assignment_list`
