-- Update attendance_sessions table to add missing columns
-- Run this if your attendance_sessions table already exists

-- Add missing columns
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Missing columns added to attendance_sessions table successfully!';
    RAISE NOTICE '📋 Added columns:';
    RAISE NOTICE '   - start_time (timestamptz)';
    RAISE NOTICE '   - end_time (timestamptz)';
END $$;
