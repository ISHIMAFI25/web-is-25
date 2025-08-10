# Fitur Auto-Close Sesi Presensi

## Overview
Fitur auto-close memungkinkan admin untuk mengatur waktu tutup otomatis pada sesi presensi, mirip dengan fitur deadline pada sistem pengumpulan tugas.

## Database Schema

### Kolom Baru
- `auto_close_time`: TIMESTAMP WITH TIME ZONE (nullable)
  - Menyimpan waktu kapan sesi harus ditutup secara otomatis
  - Jika NULL, sesi tidak memiliki auto-close

### Constraints
- `valid_auto_close_time`: Memastikan auto_close_time lebih besar dari start_time (jika ada)

### Indexes
- `idx_attendance_sessions_auto_close`: Index pada auto_close_time untuk performa
- `idx_attendance_sessions_active_auto_close`: Composite index untuk query auto-close aktif

## API Endpoints

### 1. Create Session dengan Auto-Close
**PUT** `/api/attendance-sessions`

Request body:
```json
{
  "dayNumber": 1,
  "dayTitle": "Day 1 - Introduction",
  "autoCloseTime": "2025-08-11T17:00:00", // ISO datetime string (optional)
  "adminEmail": "admin@example.com"
}
```

### 2. Auto-Close Expired Sessions
**POST** `/api/attendance-sessions/auto-close`

Response:
```json
{
  "message": "2 sesi berhasil ditutup otomatis",
  "closedSessions": [
    {
      "closed_session_id": 1,
      "day_number": 1,
      "day_title": "Day 1 - Introduction",
      "auto_close_time": "2025-08-11T17:00:00+07:00"
    }
  ],
  "totalProcessed": 2
}
```

### 3. Get Upcoming Auto-Close Sessions
**GET** `/api/attendance-sessions/auto-close`

Response:
```json
{
  "upcomingSessions": [
    {
      "session_id": 2,
      "day_number": 2,
      "day_title": "Day 2 - Advanced Topics",
      "auto_close_time": "2025-08-11T18:00:00+07:00",
      "minutes_remaining": 3
    }
  ],
  "count": 1
}
```

## Database Functions

### 1. auto_close_expired_sessions()
Menutup semua sesi yang sudah melewati auto_close_time dan return informasi sesi yang ditutup.

### 2. get_upcoming_auto_close_sessions()
Mendapatkan sesi yang akan ditutup dalam 5 menit ke depan.

## Frontend Components

### AttendanceSessionManager.tsx
- Form input untuk auto_close_time (datetime-local)
- Visual indicator untuk sesi yang lewat waktu
- Auto-check polling setiap 1 menit untuk menutup sesi expired

### Absensi Page
- Menampilkan informasi auto-close time kepada user
- Warning jika sesi akan segera ditutup

## Auto-Close Mechanism

### 1. Polling (Frontend)
- AttendanceSessionManager melakukan polling setiap 1 menit
- Memanggil API auto-close untuk menutup sesi expired
- Menampilkan notifikasi jika ada sesi yang ditutup

### 2. Database Functions
- Function `auto_close_expired_sessions()` dapat dipanggil dari cron job
- Function `get_upcoming_auto_close_sessions()` untuk monitoring

### 3. Manual Trigger
- Admin dapat memanggil endpoint auto-close secara manual
- Berguna untuk testing atau maintenance

## Usage Flow

### Untuk Admin:
1. Buat sesi baru dengan menentukan auto_close_time (opsional)
2. Aktifkan sesi
3. Sistem akan otomatis menutup sesi saat mencapai auto_close_time
4. Admin mendapat notifikasi saat sesi ditutup otomatis

### Untuk User:
1. Melihat informasi sesi aktif termasuk waktu tutup otomatis
2. Mengisi presensi sebelum waktu tutup otomatis
3. Jika sesi sudah ditutup otomatis, tidak bisa mengisi presensi

## Configuration

### Polling Interval
- Default: 60 detik (1 menit)
- Dapat diubah di `AttendanceSessionManager.tsx` line ~65

### Warning Time
- Default: 5 menit sebelum auto-close
- Dapat diubah di database function `get_upcoming_auto_close_sessions()`

## Best Practices

### 1. Timezone Handling
- Semua waktu disimpan sebagai TIMESTAMP WITH TIME ZONE
- Frontend menggunakan timezone Asia/Jakarta untuk display
- Input datetime-local akan dikonversi ke UTC untuk penyimpanan

### 2. Error Handling
- Validasi auto_close_time harus di masa depan
- Graceful handling jika auto-close gagal
- Logging untuk tracking auto-close activities

### 3. Performance
- Database indexes untuk performa query auto-close
- Polling interval tidak terlalu agresif
- Function-based auto-close untuk efficiency

## Troubleshooting

### Auto-Close Tidak Berfungsi
1. Cek apakah auto_close_time sudah diset dengan benar
2. Pastikan polling berjalan di AttendanceSessionManager
3. Cek logs di browser console dan server

### Waktu Tidak Sesuai
1. Pastikan timezone setting konsisten
2. Cek format datetime saat input dan display
3. Verifikasi server timezone configuration

### Performance Issues
1. Monitor frequency polling interval
2. Cek database index performance
3. Consider using WebSocket untuk real-time updates

## Future Enhancements
- Push notifications untuk upcoming auto-close
- Batch auto-close dengan cron job
- Advanced scheduling options
- Integration dengan calendar systems
