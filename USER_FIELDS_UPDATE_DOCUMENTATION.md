# Update Tabel Kehadiran - Kolom Nama Lengkap dan Username

## Perubahan yang Dibuat

### 1. Database Schema Update
**File:** `database/add_user_fields_to_absensi.sql`
- Menambahkan kolom `full_name` VARCHAR(255) untuk nama lengkap user
- Menambahkan kolom `username` VARCHAR(100) untuk username/NIM user
- Membuat index untuk performa pencarian
- Migrasi data existing dari `user_name` ke `full_name`
- Menambahkan comment untuk dokumentasi kolom

### 2. API Update
**File:** `src/app/api/absensi/route.ts`
- Menambahkan support untuk kolom `full_name` dan `username`
- Fallback ke field existing jika data baru tidak tersedia
- Menjaga kompatibilitas dengan `user_name` field (legacy)

### 3. Frontend Update - Halaman Presensi
**File:** `src/app/absensi/page.tsx`
- Menambahkan state untuk user info (`fullName`, `username`)
- Mengecek apakah user perlu mengisi data tambahan
- Menampilkan form user info sebelum form presensi jika diperlukan
- Mengirim data `full_name` dan `username` ke API

### 4. Admin Components
**File:** `src/components/admin/AttendanceDataViewer.tsx`
- Komponen untuk melihat data presensi dengan kolom baru
- Filter berdasarkan sesi presensi
- Export data ke CSV format
- Tampilan tabel responsive dengan kolom:
  - Nama Lengkap (`full_name`)
  - Username (`username`)
  - Email (`user_email`)
  - Status Kehadiran
  - Jam, Alasan, Waktu Submit

**File:** `src/app/api/attendance-data/route.ts`
- API untuk mengambil data presensi berdasarkan session
- Support untuk statistik per sesi
- Join dengan tabel `attendance_sessions`

### 5. Admin Page Update
**File:** `src/app/admin/page.tsx`
- Menambahkan komponen `AttendanceDataViewer`
- Urutan: Session Manager → Data Viewer → User Registration

## Struktur Database Baru

### Tabel `absensi` (Updated)
```sql
Column Name       | Data Type    | Description
------------------|--------------|------------------------------------------
id                | BIGSERIAL    | Primary key
status_kehadiran  | VARCHAR(50)  | Status: Hadir/Tidak Hadir/Menyusul/Meninggalkan
jam               | VARCHAR(10)  | Waktu khusus (HH:MM)
alasan            | TEXT         | Alasan tidak hadir/menyusul/meninggalkan
foto_url          | TEXT         | URL foto bukti
waktu             | TIMESTAMPTZ  | Waktu submit presensi
user_email        | VARCHAR(255) | Email user (untuk auth)
user_name         | VARCHAR(255) | Legacy field, akan digantikan full_name
full_name         | VARCHAR(255) | 🆕 Nama lengkap user
username          | VARCHAR(100) | 🆕 Username/NIM user
session_id        | BIGINT       | Reference ke attendance_sessions
created_at        | TIMESTAMPTZ  | Waktu record dibuat
updated_at        | TIMESTAMPTZ  | Waktu record diupdate
```

## Flow User Baru

### 1. User Pertama Kali Akses Presensi
1. Login ke sistem
2. Akses halaman `/absensi`
3. Sistem mengecek apakah user sudah memiliki `full_name` dan `username`
4. Jika belum, tampilkan form "Lengkapi Data Diri":
   - Input Nama Lengkap (required)
   - Input Username/NIM (required)
5. Setelah submit, lanjut ke form presensi normal
6. Data disimpan dengan kolom baru

### 2. User dengan Data Lengkap
1. Login dan akses `/absensi`
2. Langsung tampil form presensi (skip form data diri)
3. Submit dengan data yang sudah ada

## Admin Features

### 1. Melihat Data Presensi
1. Login sebagai admin
2. Akses section "Data Presensi User"
3. Pilih sesi presensi
4. Lihat tabel dengan kolom:
   - Nama Lengkap
   - Username
   - Email
   - Status Kehadiran
   - Detail lainnya

### 2. Export Data
- Button "Export ke CSV" untuk download data
- Format CSV dengan header yang jelas
- Filename otomatis dengan tanggal

## Database Migration

Jalankan script berikut di Supabase Dashboard:

```sql
-- File: database/add_user_fields_to_absensi.sql
-- Menambahkan kolom baru dan index
```

## Compatibility

### Backward Compatibility
- Field `user_name` tetap ada (legacy support)
- API fallback ke field lama jika field baru kosong
- Data existing tetap bisa diakses

### Data Migration
- Script otomatis copy data dari `user_name` ke `full_name`
- Tidak ada data loss pada upgrade

## Testing Checklist

### User Flow
- [ ] User baru: form data diri muncul
- [ ] User existing: langsung ke form presensi  
- [ ] Data tersimpan dengan kolom baru
- [ ] Fallback ke data lama jika ada

### Admin Flow
- [ ] Data presensi tampil dengan kolom baru
- [ ] Filter berdasarkan sesi berfungsi
- [ ] Export CSV berhasil
- [ ] Data akurat dan lengkap

### Database
- [ ] Kolom baru berhasil ditambahkan
- [ ] Index terbuat untuk performa
- [ ] Constraint unique masih berfungsi
- [ ] RLS policies tetap aktif

## Environment Requirements

- `SUPABASE_SERVICE_ROLE_KEY` untuk akses penuh database
- Next.js 15+ untuk app router
- Supabase client libraries

## File Structure Changes

```
src/
├── app/
│   ├── absensi/
│   │   └── page.tsx (updated - user info form)
│   ├── admin/
│   │   └── page.tsx (updated - new component)
│   └── api/
│       ├── absensi/
│       │   └── route.ts (updated - new fields)
│       └── attendance-data/ (new)
│           └── route.ts
└── components/
    └── admin/
        └── AttendanceDataViewer.tsx (new)

database/
└── add_user_fields_to_absensi.sql (new)
```

## Future Enhancements

1. **User Profile Management**: Allow users to edit their full name and username
2. **Bulk Import**: Import user data from CSV/Excel
3. **Advanced Filtering**: Filter by status, date range, etc.
4. **Reports**: Generate attendance reports with statistics
5. **Notifications**: Email/SMS reminders for attendance
