-- =======================================================
-- TABEL BARU SISTEM PRESENSI DENGAN APPROVAL ADMIN
-- Jalankan di Supabase Dashboard > SQL Editor
-- =======================================================

-- 1. TABEL UTAMA PRESENSI
CREATE TABLE public.presensi_data (
    id BIGSERIAL PRIMARY KEY,
    
    -- Data User
    user_email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    
    -- Data Presensi
    status_kehadiran VARCHAR(50) NOT NULL CHECK (status_kehadiran IN ('Hadir', 'Tidak Hadir', 'Menyusul', 'Meninggalkan')),
    jam VARCHAR(10), -- Format HH:MM
    alasan TEXT,
    foto_url TEXT,
    waktu_presensi TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Status Approval (untuk yang bukan 'Hadir')
    status_approval VARCHAR(20) DEFAULT 'Pending' CHECK (status_approval IN ('Pending', 'Disetujui', 'Ditolak')),
    feedback_admin TEXT, -- Feedback dari admin
    approved_by VARCHAR(255), -- Email admin yang approve/reject
    approved_at TIMESTAMPTZ,
    
    -- Session tracking
    session_id BIGINT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL SESI PRESENSI (jika belum ada)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id BIGSERIAL PRIMARY KEY,
    day_number INTEGER NOT NULL,
    day_title VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_admin VARCHAR(255)
);

-- 3. FOREIGN KEY
ALTER TABLE public.presensi_data 
ADD CONSTRAINT fk_presensi_session 
FOREIGN KEY (session_id) REFERENCES public.attendance_sessions(id);

-- 4. UNIQUE CONSTRAINT (1 user per session)
ALTER TABLE public.presensi_data 
ADD CONSTRAINT unique_user_per_session_presensi 
UNIQUE (user_email, session_id);

-- 5. INDEXES
CREATE INDEX idx_presensi_data_user_email ON public.presensi_data(user_email);
CREATE INDEX idx_presensi_data_session_id ON public.presensi_data(session_id);
CREATE INDEX idx_presensi_data_status_kehadiran ON public.presensi_data(status_kehadiran);
CREATE INDEX idx_presensi_data_status_approval ON public.presensi_data(status_approval);
CREATE INDEX idx_presensi_data_waktu ON public.presensi_data(waktu_presensi);

-- 6. RLS
ALTER TABLE public.presensi_data ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES
-- Users bisa insert presensi
CREATE POLICY "Allow users submit presensi" ON public.presensi_data
    FOR INSERT 
    TO public 
    WITH CHECK (true);

-- Users bisa baca presensi mereka sendiri
CREATE POLICY "Allow users read own presensi" ON public.presensi_data
    FOR SELECT 
    TO public 
    USING (true); -- Sementara allow all, nanti bisa dibatasi

-- Admin bisa update approval status
CREATE POLICY "Allow admin update approval" ON public.presensi_data
    FOR UPDATE 
    TO public 
    USING (true);

-- 8. TRIGGER untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_presensi_data_updated_at 
    BEFORE UPDATE ON public.presensi_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. FUNCTION untuk auto-set status approval
CREATE OR REPLACE FUNCTION set_approval_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika status kehadiran adalah 'Hadir', langsung disetujui
    IF NEW.status_kehadiran = 'Hadir' THEN
        NEW.status_approval = 'Disetujui';
        NEW.approved_at = NOW();
        NEW.approved_by = 'system';
    ELSE
        -- Untuk status lain, set ke Pending
        NEW.status_approval = 'Pending';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_approval_status_trigger
    BEFORE INSERT ON public.presensi_data
    FOR EACH ROW
    EXECUTE FUNCTION set_approval_status();

-- 10. TRIGGER untuk update otomatis approved_at saat status berubah
CREATE OR REPLACE FUNCTION update_approval_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika status_approval berubah dari/ke Pending
    IF OLD.status_approval != NEW.status_approval AND NEW.status_approval != 'Pending' THEN
        NEW.approved_at = NOW();
        NEW.approved_by = COALESCE(NEW.approved_by, 'admin_manual');
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_approval_timestamp_trigger
    BEFORE UPDATE ON public.presensi_data
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_timestamp();

-- 11. INSERT data contoh sesi jika belum ada
INSERT INTO public.attendance_sessions (day_number, day_title, is_active, created_by_admin) 
VALUES 
(1, 'Day 1 - Orientation', false, 'admin'),
(2, 'Day 2 - Introduction', false, 'admin'),
(3, 'Day 3 - Workshop', false, 'admin')
ON CONFLICT DO NOTHING;

-- 12. KOMENTAR DOKUMENTASI
COMMENT ON TABLE public.presensi_data IS 'Tabel utama untuk data presensi dengan sistem approval admin';
COMMENT ON COLUMN public.presensi_data.status_approval IS 'Status persetujuan admin: Pending/Disetujui/Ditolak';
COMMENT ON COLUMN public.presensi_data.feedback_admin IS 'Feedback dari admin untuk approval/rejection';

-- Selesai! Tabel baru siap digunakan dengan sistem approval.
