-- Database Migration: Add assignments table and update task_submissions
-- Execute this in Supabase SQL Editor

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  day INTEGER NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  attachment_url VARCHAR,
  instruction_files TEXT[], -- Array of file URLs
  accepts_links BOOLEAN DEFAULT false,
  accepts_files BOOLEAN DEFAULT true,
  max_file_size INTEGER DEFAULT 2, -- in MB
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to task_submissions table
ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS submission_type VARCHAR DEFAULT 'file',
ADD COLUMN IF NOT EXISTS submission_link VARCHAR,
ADD COLUMN IF NOT EXISTS is_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS submission_file_name TEXT,
ADD COLUMN IF NOT EXISTS submission_file_type TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records (set all existing records as submitted if they have a file URL)
UPDATE task_submissions 
SET is_submitted = CASE 
  WHEN submission_file_url IS NOT NULL AND submission_file_url != '' THEN true 
  ELSE false 
END
WHERE is_submitted IS NULL;

-- Insert sample assignment data
INSERT INTO assignments (
  id, title, day, deadline, description, 
  accepts_links, accepts_files, max_file_size, instruction_files
) VALUES (
  'task-0', 
  'Persiapan dan Orientasi Sistem Informasi', 
  0, 
  '2025-08-15T23:59:00+07:00',
  'Tugas persiapan untuk memahami dasar-dasar sistem informasi dan persiapan lingkungan kerja. Pastikan Anda telah menyiapkan akun GitHub, menginstall VS Code, dan memahami konsep dasar web development.',
  true,
  true,
  2,
  ARRAY['/day0-orientation-guide.pdf']
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  accepts_links = EXCLUDED.accepts_links,
  accepts_files = EXCLUDED.accepts_files,
  max_file_size = EXCLUDED.max_file_size,
  instruction_files = EXCLUDED.instruction_files,
  updated_at = NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_day ON assignments(day);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student_email ON task_submissions(student_email);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to assignments table
DROP TRIGGER IF EXISTS update_assignments_updated_at ON assignments;
CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to task_submissions table
DROP TRIGGER IF EXISTS update_task_submissions_updated_at ON task_submissions;
CREATE TRIGGER update_task_submissions_updated_at
  BEFORE UPDATE ON task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
GRANT ALL ON assignments TO authenticated;
GRANT ALL ON task_submissions TO authenticated;
