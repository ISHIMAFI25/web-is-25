-- Script untuk membuat tabel users di Supabase
-- Jalankan script ini di Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    supabase_user_id VARCHAR(255) UNIQUE, -- ID dari Supabase auth untuk referensi
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membuat RLS (Row Level Security) policy
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy untuk memungkinkan admin insert (sesuaikan dengan kebutuhan auth Anda)
CREATE POLICY "Allow admin insert" ON public.users
    FOR INSERT 
    TO public 
    WITH CHECK (true);

-- Policy untuk memungkinkan semua orang select (sesuaikan dengan kebutuhan auth Anda)
CREATE POLICY "Allow public select" ON public.users
    FOR SELECT 
    TO public 
    USING (true);

-- Policy untuk memungkinkan admin update
CREATE POLICY "Allow admin update" ON public.users
    FOR UPDATE 
    TO public 
    USING (true)
    WITH CHECK (true);

-- Membuat index untuk performa yang lebih baik
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON public.users(supabase_user_id);

-- Update trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_users_updated_at_column();

-- Menambahkan constraint untuk memastikan data valid
ALTER TABLE public.users 
ADD CONSTRAINT check_username_length CHECK (char_length(username) >= 3);

ALTER TABLE public.users 
ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.users 
ADD CONSTRAINT check_nama_lengkap_length CHECK (char_length(nama_lengkap) >= 2);
