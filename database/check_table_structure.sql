-- Query untuk memeriksa struktur tabel absensi
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'absensi' 
ORDER BY ordinal_position;
