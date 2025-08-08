# 🗄️ Database Setup - Assignments Table

## ⚠️ PENTING: Setup Database Diperlukan

Ya, **Anda perlu membuat tabel `assignments` di Supabase** agar TaskManager dapat berfungsi dengan baik.

## 🚀 Quick Setup

### Windows
```bash
# Jalankan script setup
scripts\setup-assignments-table.bat
```

### Linux/Mac
```bash
# Buat executable dan jalankan
chmod +x scripts/setup-assignments-table.sh
./scripts/setup-assignments-table.sh
```

## 📋 Manual Setup (Recommended)

### 1. Buka Supabase Dashboard
- Kunjungi: https://app.supabase.com
- Login dan pilih project Anda
- Ke menu **SQL Editor**

### 2. Jalankan SQL Script
Copy dan paste script dari file `database/create_assignments_table.sql`:

```sql
-- Lihat file: database/create_assignments_table.sql
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  day INTEGER NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  -- ... dan kolom lainnya
);
```

### 3. Klik **Run** di Supabase SQL Editor

### 4. Verifikasi Setup
1. Buka halaman admin di aplikasi
2. Coba buat tugas baru dengan tombol "Tambah Tugas Baru"
3. Tugas akan muncul di halaman `/tugas`
4. Test create, edit, delete tugas

## 🛠️ Troubleshooting

### ❌ Error: "relation assignments does not exist"
**Solusi**: Tabel belum dibuat. Jalankan script SQL di Supabase.

### ❌ TaskManager kosong/tidak ada tugas
**Solusi**: 
1. Pastikan tabel sudah dibuat
2. Buat tugas baru dengan tombol "Tambah Tugas Baru"
3. Refresh halaman

### ❌ Error saat create/edit tugas
**Solusi**: 
1. Cek koneksi Supabase di `src/lib/supabase.ts`
2. Pastikan environment variables sudah di-set
3. Cek Row Level Security policies

## 🔧 Struktur Tabel

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(255) | Primary key |
| `title` | VARCHAR(500) | Judul tugas |
| `day` | INTEGER | Hari (0, 1, 2, ...) |
| `deadline` | TIMESTAMPTZ | Deadline dengan timezone |
| `description` | TEXT | Deskripsi tugas |
| `instruction_files` | JSONB | File petunjuk - semua jenis file (JSON array) |
| `accepts_links` | BOOLEAN | Terima submission link |
| `accepts_files` | BOOLEAN | Terima upload file |
| `max_file_size` | INTEGER | Max ukuran file (MB) |
| `attachment_url` | TEXT | URL file attachment |
| `created_at` | TIMESTAMPTZ | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | Waktu update |

## 🔐 Security Notes

### Development Mode ⚠️
- Script setup menggunakan policy permissive untuk development
- Semua operasi diizinkan tanpa authentication check

### Production Mode 🔒
Sebelum deploy production:
1. Hapus policy "Allow all operations" 
2. Implementasikan proper authentication
3. Tambahkan role-based access control
4. Review semua permissions

## 📚 File Terkait

- `database/create_assignments_table.sql` - Script SQL utama
- `src/app/api/admin/tasks/route.ts` - API untuk CRUD tasks
- `src/app/api/admin/init-dummy-data/route.ts` - API init data dummy
- `src/components/admin/TaskManager.tsx` - Component admin interface
- `ASSIGNMENTS_TABLE_SETUP.md` - Dokumentasi detail

## ✅ Checklist Setup

- [ ] Tabel `assignments` dibuat di Supabase
- [ ] Script SQL berhasil dijalankan
- [ ] TaskManager bisa load (tidak error)
- [ ] Bisa create tugas baru
- [ ] Bisa edit tugas existing
- [ ] Bisa delete tugas
- [ ] Preview deadline menampilkan waktu yang benar

## 🆘 Butuh Bantuan?

1. **Cek file log**: Browser Developer Tools > Console
2. **Cek Supabase logs**: Dashboard > Logs
3. **Verifikasi environment**: File `.env.local`
4. **Test koneksi**: API endpoint `/api/admin/tasks`

---

💡 **Tips**: Setelah setup database, gunakan tombol "Tambah Tugas Baru" untuk membuat tugas pertama!
