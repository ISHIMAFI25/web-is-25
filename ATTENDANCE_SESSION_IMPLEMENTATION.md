# Implementasi Sistem Sesi Presensi

## Perubahan yang Dibuat

### 1. Database Schema
**File:** `database/create_attendance_sessions_table.sql`
- Membuat tabel `attendance_sessions` untuk mengelola sesi presensi
- Menambahkan kolom `user_email`, `session_id`, dan `user_name` ke tabel `absensi`
- Menambahkan constraint unique untuk mencegah double submission per user per session
- Mengatur RLS (Row Level Security) policies

### 2. API Endpoints Baru

#### a. `/api/attendance-sessions` 
**File:** `src/app/api/attendance-sessions/route.ts`
- **GET**: Mengambil semua sesi presensi
- **POST**: Mengaktifkan/menonaktifkan sesi presensi (khusus admin)
- **PUT**: Membuat sesi presensi baru (khusus admin)

#### b. `/api/absensi/check-submission`
**File:** `src/app/api/absensi/check-submission/route.ts`
- **POST**: Mengecek apakah user sudah submit presensi untuk sesi tertentu

### 3. Component Admin Baru
**File:** `src/components/admin/AttendanceSessionManager.tsx`
- Interface untuk admin mengelola sesi presensi
- Fitur membuat sesi baru
- Fitur mengaktifkan/menonaktifkan sesi
- Tampilan status sesi (aktif/tidak aktif)
- Responsive design dengan Tailwind CSS

### 4. Update Halaman Admin
**File:** `src/app/admin/page.tsx`
- Menambahkan komponen `AttendanceSessionManager`
- Meletakkan di posisi teratas sebelum form registrasi user

### 5. Update Halaman Presensi
**File:** `src/app/absensi/page.tsx`
- Mengintegrasikan dengan sistem sesi presensi
- Mengecek sesi aktif sebelum menampilkan form
- Mencegah double submission per user per session
- Menampilkan pesan yang sesuai untuk berbagai kondisi:
  - Loading state
  - Tidak ada sesi aktif
  - Sudah pernah submit
  - Form aktif

### 6. Update API Absensi
**File:** `src/app/api/absensi/route.ts`
- Menambahkan validasi session aktif
- Mencegah double submission
- Menyimpan data user dan session ID
- Menggunakan service role key untuk akses penuh

## Cara Menggunakan

### Untuk Admin:
1. Login ke halaman admin
2. Buka section "Kelola Sesi Presensi"
3. Buat sesi baru dengan memasukkan Day Number dan Judul
4. Aktifkan sesi untuk membuka presensi
5. Tutup sesi setelah selesai

### Untuk User:
1. Buka halaman presensi
2. Jika ada sesi aktif, form akan muncul
3. Isi form presensi (hanya bisa sekali per sesi)
4. Submit presensi

## Fitur Keamanan

1. **Single Submission**: Setiap user hanya bisa submit sekali per sesi
2. **Session Control**: Hanya sesi yang aktif yang bisa menerima submission
3. **Database Constraint**: Unique constraint di database level
4. **API Validation**: Validasi di level API sebelum menyimpan
5. **Frontend Prevention**: UI mencegah multiple submission

## Database Migration

Jalankan script SQL berikut di Supabase Dashboard:
```sql
-- Script tersedia di: database/create_attendance_sessions_table.sql
```

## Environment Variables
Pastikan `SUPABASE_SERVICE_ROLE_KEY` tersedia di `.env.local` untuk akses penuh ke database.

## Struktur Data Session

```typescript
interface AttendanceSession {
  id: number;
  day_number: number;        // Day ke berapa (1, 2, 3, dst)
  day_title: string;         // Judul hari (contoh: "Day 1 - Orientation")
  is_active: boolean;        // Apakah sesi sedang aktif
  start_time: string | null; // Waktu mulai sesi
  end_time: string | null;   // Waktu selesai sesi
  created_at: string;
  created_by_admin: string;  // Email admin yang membuat/mengubah
}
```

## Struktur Data Absensi (Updated)

```typescript
interface AbsensiData {
  // Fields existing
  status_kehadiran: string;
  jam: string;
  alasan: string;
  foto_url: string;
  waktu: string;
  
  // Fields baru
  user_email: string;        // Email user yang submit
  user_name: string;         // Nama user
  session_id: number;        // ID sesi presensi
}
```

## Testing

1. **Test Admin Flow:**
   - Login sebagai admin
   - Buat sesi baru
   - Aktifkan sesi
   - Tutup sesi

2. **Test User Flow:**
   - Login sebagai user biasa
   - Akses halaman presensi saat tidak ada sesi aktif
   - Akses halaman presensi saat ada sesi aktif
   - Submit presensi
   - Coba submit lagi (harus dicegah)

3. **Test Edge Cases:**
   - Multiple active sessions (hanya satu yang boleh aktif)
   - Submit dengan session tidak aktif
   - Submit tanpa login

## Troubleshooting

1. **Error "Sesi presensi tidak aktif":**
   - Pastikan admin sudah mengaktifkan sesi
   - Cek di halaman admin apakah ada sesi yang aktif

2. **Error "Sudah mengisi presensi":**
   - User sudah pernah submit untuk sesi tersebut
   - Normal behavior, tidak ada masalah

3. **Error database constraint:**
   - Pastikan script migration sudah dijalankan
   - Cek apakah tabel `attendance_sessions` sudah ada
   - Cek apakah kolom baru di tabel `absensi` sudah ada
