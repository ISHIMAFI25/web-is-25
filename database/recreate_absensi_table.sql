-- Drop tabel lama jika ada dan buat ulang dengan struktur yang benar
DROP TABLE IF EXISTS public.absensi;

-- Buat tabel baru sesuai schema Drizzle
CREATE TABLE public.absensi (
    id BIGSERIAL PRIMARY KEY,
    status_kehadiran VARCHAR(50) NOT NULL,
    jam VARCHAR(10), 
    alasan TEXT, 
    foto_url TEXT, 
    waktu TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.absensi ENABLE ROW LEVEL SECURITY;

-- Policy untuk insert
CREATE POLICY "Allow public insert" ON public.absensi
    FOR INSERT 
    TO public 
    WITH CHECK (true);

-- Policy untuk select
CREATE POLICY "Allow public select" ON public.absensi
    FOR SELECT 
    TO public 
    USING (true);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_absensi_waktu ON public.absensi(waktu);
CREATE INDEX IF NOT EXISTS idx_absensi_status ON public.absensi(status_kehadiran);
