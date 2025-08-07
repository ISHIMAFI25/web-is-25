-- Script untuk membuat tabel absensi di Supabase
-- Jalankan script ini di Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.absensi (
    id BIGSERIAL PRIMARY KEY,
    status_kehadiran VARCHAR(50) NOT NULL CHECK (status_kehadiran IN ('Hadir', 'Tidak Hadir', 'Menyusul', 'Meninggalkan')),
    jam VARCHAR(10), -- Format HH:MM untuk waktu menyusul/meninggalkan
    alasan TEXT, -- Alasan untuk tidak hadir/menyusul/meninggalkan
    foto_url TEXT, -- URL foto bukti dari UploadThing
    waktu TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Waktu submit absensi
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membuat RLS (Row Level Security) policy
ALTER TABLE public.absensi ENABLE ROW LEVEL SECURITY;

-- Policy untuk memungkinkan semua orang insert (sesuaikan dengan kebutuhan auth Anda)
CREATE POLICY "Allow public insert" ON public.absensi
    FOR INSERT 
    TO public 
    WITH CHECK (true);

-- Policy untuk memungkinkan semua orang select (sesuaikan dengan kebutuhan auth Anda)
CREATE POLICY "Allow public select" ON public.absensi
    FOR SELECT 
    TO public 
    USING (true);

-- Membuat index untuk performa yang lebih baik
CREATE INDEX IF NOT EXISTS idx_absensi_waktu ON public.absensi(waktu);
CREATE INDEX IF NOT EXISTS idx_absensi_status ON public.absensi(status_kehadiran);

-- Update trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_absensi_updated_at 
    BEFORE UPDATE ON public.absensi 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
