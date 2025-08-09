-- Create days table in Supabase
-- This table stores all day information for the admin system

CREATE TABLE IF NOT EXISTS days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INTEGER NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  location VARCHAR(500) NOT NULL,
  specifications TEXT,
  attachment_files JSONB DEFAULT '[]'::jsonb,
  is_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_days_day_number ON days(day_number);
CREATE INDEX IF NOT EXISTS idx_days_date_time ON days(date_time);
CREATE INDEX IF NOT EXISTS idx_days_is_visible ON days(is_visible);
CREATE INDEX IF NOT EXISTS idx_days_created_at ON days(created_at);

-- Enable RLS on the table
ALTER TABLE days ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (development only)
-- Replace this with proper authentication policies in production
CREATE POLICY "Allow all operations on days" ON days
FOR ALL USING (true);

-- Alternative: If you have authentication, use policies like these:
-- CREATE POLICY "Allow read access to visible days" ON days
-- FOR SELECT USING (is_visible = true);

-- CREATE POLICY "Allow admin to manage days" ON days
-- FOR ALL USING (auth.role() = 'admin');

COMMENT ON TABLE days IS 'Stores day information for the learning management system';
COMMENT ON COLUMN days.id IS 'Unique identifier for the day';
COMMENT ON COLUMN days.day_number IS 'Day number (0, 1, 2, etc.) - must be unique';
COMMENT ON COLUMN days.title IS 'Title of the day';
COMMENT ON COLUMN days.description IS 'Detailed description of the day';
COMMENT ON COLUMN days.date_time IS 'Date and time when the day starts';
COMMENT ON COLUMN days.location IS 'Meeting location for the day';
COMMENT ON COLUMN days.specifications IS 'Specifications or requirements for the day';
COMMENT ON COLUMN days.attachment_files IS 'Array of attachment file URLs in JSON format - accepts all file types';
COMMENT ON COLUMN days.is_visible IS 'Whether the day information is visible to participants';
COMMENT ON COLUMN days.created_at IS 'When the day info was created';
COMMENT ON COLUMN days.updated_at IS 'When the day info was last updated';
