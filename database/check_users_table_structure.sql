-- Script untuk memeriksa apakah tabel users sudah ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- Query untuk memeriksa struktur tabel users jika sudah ada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
