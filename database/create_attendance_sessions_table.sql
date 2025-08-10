-- Script untuk membuat ulang tabel attendance_sessions
-- Berdasarkan struktur data yang digunakan di AttendanceSessionManager.tsx

-- Hapus tabel jika sudah ada (opsional)
DROP TABLE IF EXISTS public.attendance_sessions;

-- Buat tabel attendance_sessions
CREATE TABLE public.attendance_sessions (
    id SERIAL PRIMARY KEY,
    day_number INTEGER NOT NULL,
    day_title TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    auto_close_time TIMESTAMP WITH TIME ZONE, -- Waktu untuk tutup otomatis
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by TEXT NOT NULL,
    created_by_admin TEXT, -- Untuk kompatibilitas dengan kode lama
    
    -- Constraints
    CONSTRAINT unique_active_session UNIQUE (is_active) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT valid_day_number CHECK (day_number >= 0),
    CONSTRAINT valid_time_range CHECK (
        -- Case 1: Kedua NULL (sesi baru)
        (start_time IS NULL AND end_time IS NULL) OR 
        -- Case 2: start_time ada, end_time NULL (sesi aktif)
        (start_time IS NOT NULL AND end_time IS NULL) OR
        -- Case 3: start_time ada, end_time ada, dan end_time > start_time (sesi selesai normal)
        (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time) OR
        -- Case 4: start_time NULL, end_time ada (sesi dibatalkan/ditutup tanpa pernah dimulai)
        (start_time IS NULL AND end_time IS NOT NULL)
    ),
    CONSTRAINT valid_auto_close_time CHECK (
        auto_close_time IS NULL OR 
        (start_time IS NULL OR auto_close_time > start_time)
    )
);

-- Hapus constraint unique_active_session karena kita hanya ingin satu session aktif
ALTER TABLE public.attendance_sessions DROP CONSTRAINT IF EXISTS unique_active_session;

-- Buat partial unique index untuk memastikan hanya satu session yang aktif
CREATE UNIQUE INDEX idx_single_active_session 
ON public.attendance_sessions (is_active) 
WHERE is_active = true;

-- Buat index untuk performa
CREATE INDEX idx_attendance_sessions_day_number ON public.attendance_sessions (day_number);
CREATE INDEX idx_attendance_sessions_created_at ON public.attendance_sessions (created_at);
CREATE INDEX idx_attendance_sessions_is_active ON public.attendance_sessions (is_active);
CREATE INDEX idx_attendance_sessions_auto_close ON public.attendance_sessions (auto_close_time) WHERE auto_close_time IS NOT NULL;
CREATE INDEX idx_attendance_sessions_active_auto_close ON public.attendance_sessions (is_active, auto_close_time) WHERE is_active = true AND auto_close_time IS NOT NULL;

-- Buat function untuk update timestamp otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function untuk auto-close sesi yang expired (dipanggil otomatis)
CREATE OR REPLACE FUNCTION auto_close_check()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-close semua sesi yang sudah melewati auto_close_time
    UPDATE public.attendance_sessions 
    SET 
        is_active = false,
        end_time = NOW(),
        updated_at = NOW()
    WHERE 
        is_active = true 
        AND auto_close_time IS NOT NULL 
        AND auto_close_time <= NOW();
    
    RETURN NULL; -- Untuk trigger AFTER
END;
$$ LANGUAGE plpgsql;

-- Buat trigger untuk update timestamp otomatis
CREATE TRIGGER update_attendance_sessions_updated_at 
    BEFORE UPDATE ON public.attendance_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Buat trigger untuk auto-close yang dipanggil setiap kali ada SELECT
CREATE OR REPLACE FUNCTION trigger_auto_close()
RETURNS void AS $$
BEGIN
    -- Auto-close semua sesi yang sudah melewati auto_close_time
    UPDATE public.attendance_sessions 
    SET 
        is_active = false,
        end_time = NOW(),
        updated_at = NOW()
    WHERE 
        is_active = true 
        AND auto_close_time IS NOT NULL 
        AND auto_close_time <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Function yang menggabungkan auto-close trigger dan return data
CREATE OR REPLACE FUNCTION get_attendance_sessions_with_auto_close()
RETURNS TABLE (
    id INTEGER,
    day_number INTEGER,
    day_title TEXT,
    is_active BOOLEAN,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    auto_close_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT,
    created_by_admin TEXT
) AS $$
BEGIN
    -- Trigger auto-close terlebih dahulu
    PERFORM trigger_auto_close();
    
    -- Return semua data
    RETURN QUERY
    SELECT 
        s.id,
        s.day_number,
        s.day_title,
        s.is_active,
        s.start_time,
        s.end_time,
        s.auto_close_time,
        s.created_at,
        s.updated_at,
        s.created_by,
        s.created_by_admin
    FROM public.attendance_sessions s
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Buat view sederhana yang menggunakan function
CREATE OR REPLACE VIEW attendance_sessions_with_auto_close AS
SELECT * FROM get_attendance_sessions_with_auto_close();

-- Grant akses ke view dan function
GRANT SELECT ON attendance_sessions_with_auto_close TO authenticated;
GRANT SELECT ON attendance_sessions_with_auto_close TO service_role;
GRANT EXECUTE ON FUNCTION get_attendance_sessions_with_auto_close() TO authenticated;
GRANT EXECUTE ON FUNCTION get_attendance_sessions_with_auto_close() TO service_role;

-- Policy untuk admin: bisa melakukan semua operasi
CREATE POLICY "Admin can manage attendance sessions" ON public.attendance_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy untuk user: hanya bisa membaca session yang aktif
CREATE POLICY "Users can read active sessions" ON public.attendance_sessions
    FOR SELECT USING (is_active = true);

-- Insert data contoh (opsional)
INSERT INTO public.attendance_sessions (day_number, day_title, is_active, auto_close_time, created_by, created_by_admin) VALUES
(0, 'Day 0 - Orientation', false, NULL, 'admin@example.com', 'admin@example.com'),
(1, 'Day 1 - Introduction', false, '2025-08-11T17:00:00+07:00', 'admin@example.com', 'admin@example.com');

-- Berikan akses ke tabel
GRANT ALL ON public.attendance_sessions TO authenticated;
GRANT ALL ON public.attendance_sessions TO service_role;
GRANT USAGE, SELECT ON SEQUENCE attendance_sessions_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE attendance_sessions_id_seq TO service_role;

-- Informasi tabel yang dibuat
SELECT 
    'Tabel attendance_sessions berhasil dibuat!' as status,
    count(*) as total_sample_records
FROM public.attendance_sessions;

-- Tampilkan informasi kolom tabel
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'attendance_sessions'
ORDER BY ordinal_position;

-- ===============================================
-- AUTO-CLOSE FUNCTIONS (V2 - Fixed Version)
-- ===============================================

-- Function untuk auto-close sesi yang sudah melewati waktu (tanpa ambiguous column)
CREATE OR REPLACE FUNCTION auto_close_expired_sessions_v2()
RETURNS JSON AS $$
DECLARE
    result JSON;
    updated_count INTEGER;
BEGIN
    -- Update semua sesi yang aktif dan sudah melewati auto_close_time
    UPDATE public.attendance_sessions 
    SET 
        is_active = false,
        end_time = NOW(),
        updated_at = NOW()
    WHERE 
        is_active = true 
        AND auto_close_time IS NOT NULL 
        AND auto_close_time <= NOW();
    
    -- Get count of updated rows
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Return simple JSON result
    SELECT json_build_object(
        'closed_count', updated_count,
        'message', updated_count || ' sesi berhasil ditutup otomatis',
        'timestamp', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function untuk mengecek sesi yang akan segera ditutup (dalam 5 menit)
CREATE OR REPLACE FUNCTION get_upcoming_auto_close_sessions_v2()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'session_id', id,
            'day_number', day_number,
            'day_title', day_title,
            'auto_close_time', auto_close_time,
            'minutes_remaining', ROUND(EXTRACT(EPOCH FROM (auto_close_time - NOW()))/60, 1)
        )
    ) INTO result
    FROM public.attendance_sessions
    WHERE 
        is_active = true 
        AND auto_close_time IS NOT NULL 
        AND auto_close_time > NOW()
        AND auto_close_time <= NOW() + INTERVAL '5 minutes'
    ORDER BY auto_close_time ASC;
    
    -- Return empty array if no results
    IF result IS NULL THEN
        result := '[]'::JSON;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions untuk auto-close functions
GRANT EXECUTE ON FUNCTION auto_close_expired_sessions_v2() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_close_expired_sessions_v2() TO service_role;
GRANT EXECUTE ON FUNCTION get_upcoming_auto_close_sessions_v2() TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_auto_close_sessions_v2() TO service_role;
GRANT EXECUTE ON FUNCTION trigger_auto_close() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_auto_close() TO service_role;

-- Test auto-close functions (safe to run)
SELECT 
    'Auto-close functions berhasil dibuat!' as status,
    'Functions: auto_close_expired_sessions_v2() dan get_upcoming_auto_close_sessions_v2()' as info;

-- Test function calls (opsional - uncomment untuk testing)
-- SELECT auto_close_expired_sessions_v2() as test_auto_close;
-- SELECT get_upcoming_auto_close_sessions_v2() as test_upcoming;
