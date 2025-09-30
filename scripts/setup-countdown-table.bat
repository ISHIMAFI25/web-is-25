@echo off
echo ========================================
echo Setup Countdown Settings Table
echo ========================================

REM Menggunakan environment variable DATABASE_URL
if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL environment variable is not set!
    echo Please set your DATABASE_URL first.
    echo Example: set DATABASE_URL=postgresql://username:password@localhost:5432/database_name
    pause
    exit /b 1
)

echo Using DATABASE_URL: %DATABASE_URL%
echo.

REM Jalankan script SQL untuk membuat tabel countdown_settings
echo Creating countdown_settings table...
psql "%DATABASE_URL%" -f "database\create_countdown_settings_table.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS: Countdown settings table created successfully!
    echo ========================================
    echo.
    echo You can now use the Lantik (Countdown) feature in admin panel.
    echo Access it at: /admin/lantik
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Failed to create countdown settings table!
    echo ========================================
    echo.
    echo Please check:
    echo 1. DATABASE_URL is correct
    echo 2. Database is running
    echo 3. You have permission to create tables
    echo.
)

pause