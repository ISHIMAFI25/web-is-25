-- Create days table for web-is-25
-- File: database/create_days_table.sql

-- Create days table
CREATE TABLE IF NOT EXISTS public.days (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  day_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  date_time TIMESTAMPTZ,
  location TEXT,
  specifications TEXT,
  attachment_files JSONB DEFAULT '[]'::jsonb, -- Array of file objects
  attachment_links JSONB DEFAULT '[]'::jsonb, -- Array of link objects
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_days_day_number ON public.days(day_number);
CREATE INDEX IF NOT EXISTS idx_days_is_visible ON public.days(is_visible) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_days_date_time ON public.days(date_time);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_days_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_days_updated_at ON public.days;
CREATE TRIGGER update_days_updated_at
    BEFORE UPDATE ON public.days
    FOR EACH ROW
    EXECUTE FUNCTION update_days_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read visible days
DROP POLICY IF EXISTS "Public can view visible days" ON public.days;
CREATE POLICY "Public can view visible days" ON public.days
    FOR SELECT USING (is_visible = true);

-- Admin can manage all days (modify based on your auth system)
DROP POLICY IF EXISTS "Admin can manage days" ON public.days;
CREATE POLICY "Admin can manage days" ON public.days
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- Grant permissions
GRANT SELECT ON public.days TO anon, authenticated;
GRANT ALL ON public.days TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert sample data (optional)
INSERT INTO public.days (day_number, title, description, date_time, location, specifications, is_visible)
VALUES 
    (0, 'Day 0 - Orientation', 'Orientasi awal untuk peserta IS 2025', '2025-08-10 09:00:00+07', 'Auditorium Kampus', 'Bawa laptop, alat tulis, dan semangat belajar', true),
    (1, 'Day 1 - Introduction to Web Development', 'Pengenalan dasar pengembangan web modern', '2025-08-11 09:00:00+07', 'Lab Komputer 1', 'HTML, CSS, JavaScript fundamentals', true),
    (2, 'Day 2 - Frontend Frameworks', 'Belajar React dan framework modern lainnya', '2025-08-12 09:00:00+07', 'Lab Komputer 1', 'React, Next.js, TypeScript', true),
    (3, 'Day 3 - Backend Development', 'Pengembangan server-side dan database', '2025-08-13 09:00:00+07', 'Lab Komputer 2', 'Node.js, API development, Database design', false)
ON CONFLICT (day_number) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Days table created successfully!';
    RAISE NOTICE '📋 Table structure:';
    RAISE NOTICE '   - id (varchar, primary key)';
    RAISE NOTICE '   - day_number (integer, unique)';
    RAISE NOTICE '   - title (text)';
    RAISE NOTICE '   - description (text)';
    RAISE NOTICE '   - date_time (timestamptz)';
    RAISE NOTICE '   - location (text)';
    RAISE NOTICE '   - specifications (text)';
    RAISE NOTICE '   - attachment_files (jsonb array)';
    RAISE NOTICE '   - attachment_links (jsonb array)';
    RAISE NOTICE '   - is_visible (boolean)';
    RAISE NOTICE '   - created_at/updated_at (timestamptz)';
    RAISE NOTICE '🔒 RLS policies configured';
    RAISE NOTICE '📊 Sample data inserted';
END $$;
