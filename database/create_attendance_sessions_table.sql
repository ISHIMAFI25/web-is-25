-- Script untuk membuat tabel sesi presensi di Supabase
-- Jalankan script ini di Supabase Dashboard > SQL Editor

-- Tabel untuk mengatur sesi presensi
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id BIGSERIAL PRIMARY KEY,
    day_number INTEGER NOT NULL, -- Day ke berapa (1, 2, 3, dst)
    day_title VARCHAR(100) NOT NULL, -- Judul hari (contoh: "Day 1 - Orientation")
    is_active BOOLEAN NOT NULL DEFAULT false, -- Apakah sesi sedang aktif
    start_time TIMESTAMPTZ, -- Waktu mulai sesi
    end_time TIMESTAMPTZ, -- Waktu selesai sesi
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_admin VARCHAR(255) -- Admin yang membuat/mengubah sesi
);

-- Tambahkan kolom untuk tracking user yang sudah presensi dan sesi presensi
ALTER TABLE public.absensi 
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS session_id BIGINT REFERENCES public.attendance_sessions(id),
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);

-- Index untuk performa yang lebih baik
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active ON public.attendance_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_day ON public.attendance_sessions(day_number);
CREATE INDEX IF NOT EXISTS idx_absensi_user_session ON public.absensi(user_email, session_id);

-- Constraint untuk mencegah double submission per user per session
ALTER TABLE public.absensi 
DROP CONSTRAINT IF EXISTS unique_user_session_attendance;

ALTER TABLE public.absensi 
ADD CONSTRAINT unique_user_session_attendance 
UNIQUE (user_email, session_id);

-- RLS policies
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Policy untuk attendance_sessions - semua bisa baca, hanya admin yang bisa insert/update
CREATE POLICY "Allow public select attendance_sessions" ON public.attendance_sessions
    FOR SELECT 
    TO public 
    USING (true);

CREATE POLICY "Allow admin insert attendance_sessions" ON public.attendance_sessions
    FOR INSERT 
    TO public 
    WITH CHECK (true);

CREATE POLICY "Allow admin update attendance_sessions" ON public.attendance_sessions
    FOR UPDATE 
    TO public 
    USING (true);

-- Update trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_attendance_sessions_updated_at 
    BEFORE UPDATE ON public.attendance_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert contoh sesi presensi
INSERT INTO public.attendance_sessions (day_number, day_title, is_active, created_by_admin) 
VALUES 
(1, 'Day 1 - Orientation', false, 'admin'),
(2, 'Day 2 - Introduction', false, 'admin'),
(3, 'Day 3 - Workshop', false, 'admin')
ON CONFLICT DO NOTHING;
