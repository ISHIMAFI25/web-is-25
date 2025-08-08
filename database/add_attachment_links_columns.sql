-- Add attachment_links columns to existing tables
-- Run this in Supabase Dashboard > SQL Editor

-- Add attachment_links column to days table
ALTER TABLE days 
ADD COLUMN IF NOT EXISTS attachment_links JSONB DEFAULT '[]'::jsonb;

-- Add instruction_links column to assignments table
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS instruction_links JSONB DEFAULT '[]'::jsonb;

-- Add comments for the new columns
COMMENT ON COLUMN days.attachment_links IS 'Array of attachment links in JSON format: [{"name": "Link Name", "url": "https://example.com"}]';
COMMENT ON COLUMN assignments.instruction_links IS 'Array of instruction links in JSON format: [{"name": "Link Name", "url": "https://example.com"}]';

-- Create indexes for the new JSONB columns for better performance
CREATE INDEX IF NOT EXISTS idx_days_attachment_links ON days USING GIN (attachment_links);
CREATE INDEX IF NOT EXISTS idx_assignments_instruction_links ON assignments USING GIN (instruction_links);
