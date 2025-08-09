@echo off
REM Script untuk deploy database days table
echo 🚀 Deploying Days Table to Supabase...

REM Load environment variables from .env.local
if exist .env.local (
    for /f "tokens=1,2 delims==" %%a in (.env.local) do (
        set %%a=%%b
    )
)

REM Check if required environment variables are set
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
    echo ❌ Error: NEXT_PUBLIC_SUPABASE_URL must be set in .env.local
    exit /b 1
)

if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
    echo ❌ Error: SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
    exit /b 1
)

echo 📊 Creating days table...

REM Read SQL file content
set "sql_file=database\create_days_table.sql"
if not exist "%sql_file%" (
    echo ❌ Error: %sql_file% not found
    exit /b 1
)

REM Execute the SQL using PowerShell for better string handling
powershell -Command "& {$sql = Get-Content '%sql_file%' -Raw; $sql = $sql -replace '\"', '\\"' -replace '\r?\n', ' '; $body = @{query = $sql} | ConvertTo-Json; Invoke-RestMethod -Uri '%NEXT_PUBLIC_SUPABASE_URL%/rest/v1/rpc/sql' -Method POST -Headers @{'apikey'='%SUPABASE_SERVICE_ROLE_KEY%'; 'Authorization'='Bearer %SUPABASE_SERVICE_ROLE_KEY%'; 'Content-Type'='application/json'} -Body $body}"

if %ERRORLEVEL% equ 0 (
    echo ✅ Days table deployed successfully!
    echo 📋 Table includes:
    echo    - id ^(UUID, Primary Key^)
    echo    - day_number ^(INTEGER, Unique^)
    echo    - title ^(TEXT^)
    echo    - description ^(TEXT^)
    echo    - date_time ^(TIMESTAMPTZ^)
    echo    - location ^(TEXT^)
    echo    - specifications ^(TEXT, Optional^)
    echo    - attachment_files ^(JSONB Array^)
    echo    - is_visible ^(BOOLEAN^)
    echo    - created_at ^(TIMESTAMPTZ^)
    echo    - updated_at ^(TIMESTAMPTZ^)
    echo.
    echo 🔒 RLS policies enabled for security
    echo 📊 Ready to use with Day Management System
) else (
    echo ❌ Failed to deploy days table
    exit /b 1
)
