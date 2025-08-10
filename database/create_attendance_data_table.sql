-- Script untuk membuat tabel attendance_data
-- Tabel untuk menyimpan data presensi user

-- Hapus tabel jika sudah ada (opsional)
DROP TABLE IF EXISTS public.attendance_data;

-- Buat tabel attendance_data
CREATE TABLE public.attendance_data (
    id SERIAL PRIMARY KEY,
    day_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    user_email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT NOT NULL,
    status_kehadiran TEXT NOT NULL CHECK (status_kehadiran IN ('Hadir', 'Tidak Hadir', 'Menyusul', 'Meninggalkan')),
    alasan TEXT, -- Untuk kondisi kesehatan (Hadir) atau alasan lainnya
    jam_menyusul_meninggalkan TIME, -- Untuk status Menyusul/Meninggalkan
    foto_url TEXT, -- URL foto bukti
    status_approval TEXT NOT NULL DEFAULT 'Pending' CHECK (status_approval IN ('Disetujui', 'Pending', 'Ditolak')),
    approval_message TEXT,
    feedback_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_session UNIQUE (user_email, session_id),
    CONSTRAINT valid_day_id CHECK (day_id >= 0),
    CONSTRAINT valid_jam_required CHECK (
        (status_kehadiran IN ('Menyusul', 'Meninggalkan') AND jam_menyusul_meninggalkan IS NOT NULL) OR
        (status_kehadiran NOT IN ('Menyusul', 'Meninggalkan'))
    ),
    CONSTRAINT valid_foto_required CHECK (
        (status_kehadiran != 'Hadir' AND foto_url IS NOT NULL) OR
        (status_kehadiran = 'Hadir')
    ),
    
    -- Foreign key ke attendance_sessions
    CONSTRAINT fk_session_id FOREIGN KEY (session_id) REFERENCES public.attendance_sessions(id) ON DELETE CASCADE
);

-- Buat index untuk performa
CREATE INDEX idx_attendance_data_day_id ON public.attendance_data (day_id);
CREATE INDEX idx_attendance_data_session_id ON public.attendance_data (session_id);
CREATE INDEX idx_attendance_data_user_email ON public.attendance_data (user_email);
CREATE INDEX idx_attendance_data_status_approval ON public.attendance_data (status_approval);
CREATE INDEX idx_attendance_data_created_at ON public.attendance_data (created_at);
CREATE INDEX idx_attendance_data_status_kehadiran ON public.attendance_data (status_kehadiran);

-- Buat index gabungan untuk query yang sering digunakan
CREATE INDEX idx_attendance_data_user_session ON public.attendance_data (user_email, session_id);
CREATE INDEX idx_attendance_data_session_status ON public.attendance_data (session_id, status_approval);
CREATE INDEX idx_attendance_data_day_status ON public.attendance_data (day_id, status_kehadiran);

-- Function untuk update timestamp otomatis
CREATE OR REPLACE FUNCTION update_attendance_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk update timestamp otomatis
CREATE TRIGGER update_attendance_data_updated_at 
    BEFORE UPDATE ON public.attendance_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_attendance_data_updated_at();

-- Function untuk auto-approve status "Hadir"
CREATE OR REPLACE FUNCTION auto_approve_hadir()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-approve jika status kehadiran "Hadir"
    IF NEW.status_kehadiran = 'Hadir' THEN
        NEW.status_approval = 'Disetujui';
        NEW.approval_message = 'Presensi kehadiran otomatis disetujui';
    ELSE
        NEW.status_approval = 'Pending';
        NEW.approval_message = 'Menunggu persetujuan admin';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-approve
CREATE TRIGGER auto_approve_hadir_trigger
    BEFORE INSERT ON public.attendance_data
    FOR EACH ROW
    EXECUTE FUNCTION auto_approve_hadir();

-- Enable Row Level Security (RLS)
ALTER TABLE public.attendance_data ENABLE ROW LEVEL SECURITY;

-- Policy untuk admin: bisa melakukan semua operasi
CREATE POLICY "Admin can manage attendance data" ON public.attendance_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy untuk user: hanya bisa membaca dan mengubah data mereka sendiri
CREATE POLICY "Users can manage their own attendance" ON public.attendance_data
    FOR ALL USING (user_email = auth.jwt()->>'email');

-- Berikan akses ke tabel
GRANT ALL ON public.attendance_data TO authenticated;
GRANT ALL ON public.attendance_data TO service_role;
GRANT USAGE, SELECT ON SEQUENCE attendance_data_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE attendance_data_id_seq TO service_role;

-- Insert data contoh (opsional)
-- INSERT INTO public.attendance_data (day_id, session_id, user_email, full_name, username, status_kehadiran, alasan) VALUES
-- (0, 1, 'user@example.com', 'Test User', 'testuser', 'Hadir', 'Sehat dan siap mengikuti kegiatan'),
-- (0, 1, 'user2@example.com', 'Test User 2', 'testuser2', 'Tidak Hadir', 'Sakit demam');

-- Informasi tabel yang dibuat
SELECT 
    'Tabel attendance_data berhasil dibuat!' as status,
    count(*) as total_records
FROM public.attendance_data;

-- Tampilkan informasi kolom tabel
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'attendance_data'
ORDER BY ordinal_position;

-- ===============================================
-- FUNCTIONS UNTUK ATTENDANCE DATA MANAGEMENT
-- ===============================================

-- Function untuk cek apakah user sudah submit untuk session tertentu
CREATE OR REPLACE FUNCTION check_user_submission(
    p_user_email TEXT,
    p_session_id INTEGER
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    submission_data RECORD;
BEGIN
    -- Cari data submission user untuk session tertentu
    SELECT * INTO submission_data
    FROM public.attendance_data
    WHERE user_email = p_user_email AND session_id = p_session_id
    LIMIT 1;
    
    IF FOUND THEN
        SELECT json_build_object(
            'hasSubmitted', true,
            'submissionData', json_build_object(
                'id', submission_data.id,
                'day_id', submission_data.day_id,
                'session_id', submission_data.session_id,
                'status_kehadiran', submission_data.status_kehadiran,
                'alasan', submission_data.alasan,
                'jam_menyusul_meninggalkan', submission_data.jam_menyusul_meninggalkan,
                'foto_url', submission_data.foto_url,
                'status_approval', submission_data.status_approval,
                'approval_message', submission_data.approval_message,
                'feedback_admin', submission_data.feedback_admin,
                'created_at', submission_data.created_at,
                'updated_at', submission_data.updated_at
            )
        ) INTO result;
    ELSE
        SELECT json_build_object(
            'hasSubmitted', false,
            'submissionData', null
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function untuk mengambil data presensi untuk admin approval
CREATE OR REPLACE FUNCTION get_pending_attendance_approvals()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', ad.id,
            'day_id', ad.day_id,
            'session_id', ad.session_id,
            'day_title', asess.day_title,
            'user_email', ad.user_email,
            'full_name', ad.full_name,
            'username', ad.username,
            'status_kehadiran', ad.status_kehadiran,
            'alasan', ad.alasan,
            'jam_menyusul_meninggalkan', ad.jam_menyusul_meninggalkan,
            'foto_url', ad.foto_url,
            'status_approval', ad.status_approval,
            'approval_message', ad.approval_message,
            'feedback_admin', ad.feedback_admin,
            'created_at', ad.created_at,
            'updated_at', ad.updated_at
        ) ORDER BY ad.created_at ASC
    ) INTO result
    FROM public.attendance_data ad
    JOIN public.attendance_sessions asess ON ad.session_id = asess.id
    WHERE ad.status_approval = 'Pending';
    
    -- Return empty array if no results
    IF result IS NULL THEN
        result := '[]'::JSON;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function untuk admin approve/reject attendance
CREATE OR REPLACE FUNCTION update_attendance_approval(
    p_attendance_id INTEGER,
    p_status_approval TEXT,
    p_feedback_admin TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    updated_count INTEGER;
    approval_msg TEXT;
BEGIN
    -- Validate status_approval
    IF p_status_approval NOT IN ('Disetujui', 'Ditolak') THEN
        SELECT json_build_object(
            'success', false,
            'error', 'Status approval harus Disetujui atau Ditolak'
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Set approval message
    IF p_status_approval = 'Disetujui' THEN
        approval_msg := 'Presensi telah disetujui oleh admin';
    ELSE
        approval_msg := 'Presensi ditolak oleh admin';
    END IF;
    
    -- Update attendance data
    UPDATE public.attendance_data
    SET 
        status_approval = p_status_approval,
        approval_message = approval_msg,
        feedback_admin = p_feedback_admin,
        updated_at = NOW()
    WHERE id = p_attendance_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count > 0 THEN
        SELECT json_build_object(
            'success', true,
            'message', 'Status approval berhasil diupdate',
            'status_approval', p_status_approval,
            'feedback_admin', p_feedback_admin
        ) INTO result;
    ELSE
        SELECT json_build_object(
            'success', false,
            'error', 'Data attendance tidak ditemukan'
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions untuk functions
GRANT EXECUTE ON FUNCTION check_user_submission(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_submission(TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_pending_attendance_approvals() TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_attendance_approvals() TO service_role;
GRANT EXECUTE ON FUNCTION update_attendance_approval(INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_attendance_approval(INTEGER, TEXT, TEXT) TO service_role;

-- Test functions
SELECT 
    'Attendance data functions berhasil dibuat!' as status,
    'Functions: check_user_submission, get_pending_attendance_approvals, update_attendance_approval' as info;
