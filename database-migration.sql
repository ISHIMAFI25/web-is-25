-- Migration script to add missing columns to task_submissions table

-- Add missing columns
ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS is_submitted BOOLEAN DEFAULT FALSE;

ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS submission_file_name TEXT;

ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS submission_file_type TEXT;

ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE task_submissions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_task_submissions_student_task 
ON task_submissions(student_email, task_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_task_submissions_updated_at ON task_submissions;
CREATE TRIGGER update_task_submissions_updated_at
    BEFORE UPDATE ON task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
