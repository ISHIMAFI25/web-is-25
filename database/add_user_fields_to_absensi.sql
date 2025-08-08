-- Script untuk menambahkan kolom nama lengkap dan username ke tabel absensi
-- Jalankan script ini di Supabase Dashboard > SQL Editor

-- Tambahkan kolom full_name dan username ke tabel absensi
ALTER TABLE public.absensi 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

-- Update data yang sudah ada: copy dari user_name ke full_name jika user_name sudah ada
UPDATE public.absensi 
SET full_name = user_name 
WHERE user_name IS NOT NULL AND full_name IS NULL;

-- Buat index untuk performa pencarian berdasarkan username dan full_name
CREATE INDEX IF NOT EXISTS idx_absensi_username ON public.absensi(username);
CREATE INDEX IF NOT EXISTS idx_absensi_full_name ON public.absensi(full_name);

-- Optional: Buat constraint untuk memastikan username unik per session (jika diperlukan)
-- ALTER TABLE public.absensi 
-- ADD CONSTRAINT unique_username_session_attendance 
-- UNIQUE (username, session_id);

-- Komentar untuk dokumentasi
COMMENT ON COLUMN public.absensi.full_name IS 'Nama lengkap user yang mengisi presensi';
COMMENT ON COLUMN public.absensi.username IS 'Username/NIM/ID unik user yang mengisi presensi';
COMMENT ON COLUMN public.absensi.user_name IS 'Legacy field - akan digantikan dengan full_name';
COMMENT ON COLUMN public.absensi.user_email IS 'Email user untuk autentikasi dan identifikasi unik';

-- Menampilkan struktur tabel yang sudah diupdate
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'absensi' 
ORDER BY ordinal_position;
