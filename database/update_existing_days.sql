-- Update existing days with proper data
-- Run this in Supabase Dashboard > SQL Editor

-- First, let's add the new columns if they don't exist
ALTER TABLE days 
ADD COLUMN IF NOT EXISTS attachment_links JSONB DEFAULT '[]'::jsonb;

ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS instruction_links JSONB DEFAULT '[]'::jsonb;

-- Update Day 0 with proper information
UPDATE days 
SET 
  title = 'Orientasi & Pengenalan',
  description = 'Hari pertama orientasi IS 2025. Pengenalan materi, sistem, dan persiapan pembelajaran.',
  location = 'Lab Komputer FTIK',
  specifications = 'Bawa laptop, charger, dan alat tulis',
  attachment_links = '[
    {
      "name": "Panduan Orientasi",
      "url": "https://docs.google.com/document/d/1L61nI16gG57un-JlPh-vWukPdd-rKNby9vpnopbj_QQ/edit?usp=drive_link"
    }
  ]'::jsonb
WHERE day_number = 0;

-- Update Day 1 with proper information
UPDATE days 
SET 
  title = 'Dasar Pemrograman Web',
  description = 'Pembelajaran dasar-dasar pemrograman web menggunakan HTML, CSS, dan JavaScript.',
  location = 'Lab Komputer FTIK',
  specifications = 'Bawa laptop dengan browser terbaru dan text editor'
WHERE day_number = 1;

-- Add comments for the new columns
COMMENT ON COLUMN days.attachment_links IS 'Array of attachment links in JSON format: [{"name": "Link Name", "url": "https://example.com"}]';
COMMENT ON COLUMN assignments.instruction_links IS 'Array of instruction links in JSON format: [{"name": "Link Name", "url": "https://example.com"}]';

-- Create indexes for the new JSONB columns for better performance
CREATE INDEX IF NOT EXISTS idx_days_attachment_links ON days USING GIN (attachment_links);
CREATE INDEX IF NOT EXISTS idx_assignments_instruction_links ON assignments USING GIN (instruction_links);
