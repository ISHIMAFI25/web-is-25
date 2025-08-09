-- Create Presensi System Tables
-- File: database/create_presensi_system.sql

-- 1. Create attendance_sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id BIGSERIAL PRIMARY KEY,
  day_number INTEGER NOT NULL UNIQUE,
  day_title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create presensi_data table (new structured table)
CREATE TABLE IF NOT EXISTS presensi_data (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL,
  status_kehadiran TEXT NOT NULL CHECK (status_kehadiran IN ('Hadir', 'Tidak Hadir', 'Menyusul', 'Meninggalkan')),
  jam TEXT,
  alasan TEXT,
  foto_url TEXT,
  waktu TIMESTAMPTZ DEFAULT NOW(),
  status_approval TEXT DEFAULT 'Menunggu' CHECK (status_approval IN ('Menunggu', 'Disetujui', 'Ditolak')),
  approval_message TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: One submission per user per session
  UNIQUE(session_id, user_email)
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active 
ON attendance_sessions(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_presensi_data_session 
ON presensi_data(session_id);

CREATE INDEX IF NOT EXISTS idx_presensi_data_user 
ON presensi_data(user_email);

CREATE INDEX IF NOT EXISTS idx_presensi_data_status 
ON presensi_data(status_approval);

-- 4. Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_attendance_sessions_updated_at ON attendance_sessions;
CREATE TRIGGER update_attendance_sessions_updated_at
    BEFORE UPDATE ON attendance_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_presensi_data_updated_at ON presensi_data;
CREATE TRIGGER update_presensi_data_updated_at
    BEFORE UPDATE ON presensi_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE presensi_data ENABLE ROW LEVEL SECURITY;

-- 6. Add role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student'));

-- Update existing users to have default role
UPDATE users SET role = 'student' WHERE role IS NULL;

-- 7. Create RLS Policies

-- Attendance Sessions Policies
-- Admin can do everything
DROP POLICY IF EXISTS "Admin can amanage attendance sessions" ON attendance_sessions;
CREATE POLICY "Admin can manage attendance sessions" ON attendance_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- Users can only read active sessions
DROP POLICY IF EXISTS "Users can view active sessions" ON attendance_sessions;
CREATE POLICY "Users can view active sessions" ON attendance_sessions
    FOR SELECT USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email'
        )
    );

-- Presensi Data Policies
-- Admin can see all presensi data
DROP POLICY IF EXISTS "Admin can view all presensi data" ON presensi_data;
CREATE POLICY "Admin can view all presensi data" ON presensi_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- Admin can update approval status
DROP POLICY IF EXISTS "Admin can update presensi approval" ON presensi_data;
CREATE POLICY "Admin can update presensi approval" ON presensi_data
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- Users can insert their own presensi data
DROP POLICY IF EXISTS "Users can insert their presensi" ON presensi_data;
CREATE POLICY "Users can insert their presensi" ON presensi_data
    FOR INSERT WITH CHECK (
        user_email = auth.jwt() ->> 'email' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email'
        )
    );

-- Users can view their own presensi data
DROP POLICY IF EXISTS "Users can view their own presensi" ON presensi_data;
CREATE POLICY "Users can view their own presensi" ON presensi_data
    FOR SELECT USING (
        user_email = auth.jwt() ->> 'email' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email'
        )
    );

-- 8. Insert sample data (optional)
-- Uncomment if you want sample sessions
/*
INSERT INTO attendance_sessions (day_number, day_title, is_active, created_by)
VALUES 
    (1, 'Day 1 - Orientation', true, 'admin@example.com'),
    (2, 'Day 2 - Introduction to Web Development', false, 'admin@example.com'),
    (3, 'Day 3 - HTML & CSS Basics', false, 'admin@example.com')
ON CONFLICT (day_number) DO NOTHING;
*/

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON attendance_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON presensi_data TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Presensi system tables created successfully!';
    RAISE NOTICE '📋 Tables created:';
    RAISE NOTICE '   - attendance_sessions (for managing sessions)';
    RAISE NOTICE '   - presensi_data (for attendance records)';
    RAISE NOTICE '🔒 RLS policies configured for security';
    RAISE NOTICE '⚡ Indexes and triggers added for performance';
END $$;
