@echo off
echo ========================================
echo    SETUP ATTENDANCE SESSIONS TABLE
echo ========================================
echo.
echo Script ini akan membuat ulang tabel attendance_sessions di Supabase
echo dengan struktur yang sesuai untuk AttendanceSessionManager.tsx
echo.
echo INSTRUKSI:
echo 1. Buka Supabase Dashboard (https://supabase.com/dashboard)
echo 2. Pilih project Anda
echo 3. Buka tab "SQL Editor"
echo 4. Copy-paste isi file: database/create_attendance_sessions_table.sql
echo 5. Klik "Run" untuk menjalankan script
echo.
echo FITUR YANG AKAN DIBUAT:
echo - Tabel attendance_sessions dengan semua kolom yang diperlukan
echo - Auto-increment ID (SERIAL)
echo - Constraint untuk memastikan hanya 1 session aktif
echo - RLS policies untuk admin dan user
echo - Indexes untuk performa
echo - Auto-update timestamp
echo - Sample data (Day 0 dan Day 1)
echo.
echo Setelah menjalankan script, coba refresh halaman admin
echo dan buka tab "Sesi Presensi" untuk memastikan tidak ada error.
echo.
pause
