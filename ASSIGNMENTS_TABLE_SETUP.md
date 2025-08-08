# ASSIGNMENTS TABLE SETUP

## Setup Database Assignments Table di Supabase

Tabel `assignments` diperlukan untuk menyimpan data tugas dalam sistem manajemen tugas admin.

### Cara Setup:

#### Opsi 1: Melalui Supabase Dashboard (Recommended)
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Ke menu **SQL Editor**
4. Salin dan jalankan script dari file `database/create_assignments_table.sql`
5. Klik **Run** untuk mengeksekusi

#### Opsi 2: Melalui CLI
```bash
# Jika menggunakan Supabase CLI
supabase db push

# Atau jalankan file SQL langsung
psql -h your-host -p 5432 -U postgres -d your-database < database/create_assignments_table.sql
```

### Struktur Tabel

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(255) | Primary key, unique identifier |
| `title` | VARCHAR(500) | Judul tugas |
| `day` | INTEGER | Hari (0, 1, 2, dll) |
| `deadline` | TIMESTAMPTZ | Deadline dengan timezone |
| `description` | TEXT | Deskripsi tugas |
| `instruction_files` | JSONB | Array file petunjuk dalam format JSON |
| `accepts_links` | BOOLEAN | Apakah menerima submission link |
| `accepts_files` | BOOLEAN | Apakah menerima upload file |
| `max_file_size` | INTEGER | Maksimal ukuran file (MB) |
| `attachment_url` | TEXT | URL file attachment utama |
| `created_at` | TIMESTAMPTZ | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | Waktu terakhir diupdate |

### Setelah Setup

1. **Test Connection**: Buka halaman admin dan coba load data tugas
2. **Create Tasks**: Buat tugas baru melalui form admin  
3. **Verify**: Cek tugas muncul di halaman `/tugas`

### Contoh Data

```sql
-- Insert sample data (optional - admin can create tasks via the interface)
-- Use "Tambah Tugas Baru" button in the admin interface to create tasks
INSERT INTO assignments (
  id, title, day, deadline, description, 
  accepts_links, accepts_files, max_file_size,
  instruction_files
) VALUES (
  'task-0-sample',
  'Persiapan dan Orientasi Sistem Informasi',
  0,
  '2025-08-15 23:59:00+07',
  'Tugas persiapan untuk memahami dasar-dasar sistem informasi...',
  true,
  true,
  2,
  '[]'::jsonb
);
```

### Troubleshooting

#### Error: "relation assignments does not exist"
- Pastikan tabel sudah dibuat dengan menjalankan script SQL
- Cek koneksi ke database Supabase

#### Error: "RLS policies"
- Pastikan Row Level Security policy sudah di-setup
- Untuk development, policy "Allow all operations" sudah disediakan

#### Error: "Authentication required"
- Sementara auth di-bypass untuk development
- Di production, tambahkan proper authentication check

### Security Notes

⚠️ **Development Mode**: Script ini menggunakan policy yang mengizinkan semua operasi untuk kemudahan development.

🔒 **Production Mode**: Sebelum deploy ke production:
1. Hapus policy "Allow all operations"
2. Tambahkan authentication check yang proper
3. Implementasikan role-based access control

### Next Steps

Setelah database setup:
1. Test TaskManager di halaman admin
2. Gunakan tombol "Init Data Dummy" untuk data awal
3. Test create, edit, delete tugas
4. Verifikasi data tersimpan dengan benar
