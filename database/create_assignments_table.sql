-- Create assignments table in Supabase
-- This table stores all task/assignment data for the admin system

CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  day INTEGER NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  instruction_files JSONB DEFAULT '[]'::jsonb,
  accepts_links BOOLEAN DEFAULT false,
  accepts_files BOOLEAN DEFAULT true,
  max_file_size INTEGER DEFAULT 2,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_day ON assignments(day);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON assignments(created_at);

-- Add RLS (Row Level Security) policies if needed
-- For now, we'll allow all operations for development
-- In production, you should add proper authentication checks

-- Enable RLS on the table
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (development only)
-- Replace this with proper authentication policies in production
CREATE POLICY "Allow all operations on assignments" ON assignments
FOR ALL USING (true);

-- Alternative: If you have authentication, use policies like these:
-- CREATE POLICY "Allow read access to assignments" ON assignments
-- FOR SELECT USING (true);

-- CREATE POLICY "Allow admin to manage assignments" ON assignments
-- FOR ALL USING (auth.role() = 'admin');

-- Insert sample data (optional - this will be done via the init-dummy-data API)
-- You can run this manually or use the "Init Data Dummy" button in the admin interface

COMMENT ON TABLE assignments IS 'Stores task/assignment data for the learning management system';
COMMENT ON COLUMN assignments.id IS 'Unique identifier for the assignment';
COMMENT ON COLUMN assignments.title IS 'Title of the assignment';
COMMENT ON COLUMN assignments.day IS 'Day number (0, 1, 2, etc.)';
COMMENT ON COLUMN assignments.deadline IS 'Assignment deadline with timezone';
COMMENT ON COLUMN assignments.description IS 'Detailed description of the assignment';
COMMENT ON COLUMN assignments.instruction_files IS 'Array of instruction file URLs in JSON format - accepts all file types (PDF, DOC, PPT, ZIP, images, etc.)';
COMMENT ON COLUMN assignments.accepts_links IS 'Whether the assignment accepts link submissions';
COMMENT ON COLUMN assignments.accepts_files IS 'Whether the assignment accepts file uploads';
COMMENT ON COLUMN assignments.max_file_size IS 'Maximum file size in MB for uploads';
COMMENT ON COLUMN assignments.attachment_url IS 'URL to main attachment/resource file';
