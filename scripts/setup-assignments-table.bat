@echo off
echo ========================================
echo SETUP ASSIGNMENTS TABLE - SUPABASE
echo ========================================
echo.

echo Script ini akan membantu Anda setup tabel assignments di Supabase.
echo.

echo Pilihan setup:
echo 1. Tampilkan SQL script untuk di-copy ke Supabase Dashboard
echo 2. Buka dokumentasi setup
echo 3. Keluar
echo.

set /p choice="Masukkan pilihan (1-3): "

if "%choice%"=="1" goto show_sql
if "%choice%"=="2" goto open_docs
if "%choice%"=="3" goto exit
goto invalid

:show_sql
echo.
echo ========================================
echo SQL SCRIPT UNTUK SUPABASE
echo ========================================
echo.
echo Copy script berikut ke Supabase SQL Editor:
echo.
type "database\create_assignments_table.sql"
echo.
echo ========================================
echo LANGKAH SELANJUTNYA:
echo ========================================
echo 1. Buka Supabase Dashboard: https://app.supabase.com
echo 2. Pilih project Anda
echo 3. Ke menu SQL Editor
echo 4. Paste script di atas
echo 5. Klik Run
echo 6. Test di aplikasi dengan membuat tugas baru
echo.
pause
goto menu

:open_docs
echo.
echo Membuka dokumentasi setup...
start "" "ASSIGNMENTS_TABLE_SETUP.md"
goto menu

:invalid
echo.
echo Pilihan tidak valid. Silakan pilih 1-3.
echo.
goto menu

:menu
echo.
set /p continue="Kembali ke menu? (y/n): "
if /i "%continue%"=="y" goto start
goto exit

:start
cls
goto :eof

:exit
echo.
echo Terima kasih! Jangan lupa setup tabel assignments di Supabase.
echo.
pause
exit /b
