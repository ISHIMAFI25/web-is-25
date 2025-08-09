-- Manual Database Setup untuk Days Table
-- Copy dan paste ke SQL Editor di Supabase Dashboard

-- 1. Buat table days
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

-- 2. Buat indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_days_day_number ON days(day_number);
CREATE INDEX IF NOT EXISTS idx_days_date_time ON days(date_time);
CREATE INDEX IF NOT EXISTS idx_days_is_visible ON days(is_visible);
CREATE INDEX IF NOT EXISTS idx_days_created_at ON days(created_at);

-- 3. Enable RLS
ALTER TABLE days ENABLE ROW LEVEL SECURITY;

-- 4. Buat RLS policies
-- Policy untuk admin (full access)
CREATE POLICY "Admin full access to days" ON days
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Policy untuk user biasa (hanya bisa read yang visible)
CREATE POLICY "Users can read visible days" ON days
FOR SELECT 
USING (
  is_visible = true 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

-- 5. Insert sample data untuk testing
INSERT INTO days (day_number, title, description, date_time, location, specifications, attachment_files, is_visible) VALUES 
-- Day 0 (Past day, visible)
(0, 'Orientation Day', 'Hari pengenalan program IS 2025 dan persiapan para peserta untuk mengikuti rangkaian kegiatan pembelajaran.', '2025-08-01 08:00:00+07', 'Auditorium Teknik Informatika UNPAR', 'Bawa alat tulis, buku catatan, dan semangat belajar!', '[]'::jsonb, true),

-- Day 1 (Past day, visible)  
(1, 'Fundamental Programming', 'Pembelajaran dasar-dasar pemrograman menggunakan Python. Materi mencakup syntax dasar, variable, data types, dan control structures.', '2025-08-05 08:00:00+07', 'Lab Komputer Lantai 9', 'Laptop/PC dengan Python 3.8+ terinstall, text editor (VS Code recommended), charger laptop', '[{"name": "Python Basics.pdf", "url": "https://example.com/python-basics.pdf"}, {"name": "Exercise Files.zip", "url": "https://example.com/exercises.zip"}]'::jsonb, true),

-- Day 2 (Upcoming day, visible)
(2, 'Web Development Basics', 'Pengenalan HTML, CSS, dan JavaScript untuk pengembangan web frontend. Peserta akan membuat website sederhana.', '2025-08-15 08:00:00+07', 'Lab Komputer Lantai 8', 'Laptop dengan browser modern (Chrome/Firefox), text editor (VS Code), charger laptop', '[{"name": "HTML CSS Guide.pdf", "url": "https://example.com/html-css-guide.pdf"}]'::jsonb, true),

-- Day 3 (Future day, visible)
(3, 'Database & Backend', 'Pembelajaran database relational (PostgreSQL) dan pengembangan backend API menggunakan Node.js dan Express.', '2025-08-20 08:00:00+07', 'Lab Database Lantai 7', 'Laptop dengan Node.js dan PostgreSQL terinstall, text editor, charger laptop', '[]'::jsonb, true),

-- Day 4 (Future day, hidden - admin only)
(4, 'Final Project', 'Pengerjaan proyek akhir dengan menggabungkan semua materi yang telah dipelajari. Peserta akan membuat aplikasi web lengkap.', '2025-08-25 08:00:00+07', 'Ruang Seminar Lantai 10', 'Laptop, semua tools yang telah digunakan sebelumnya, dokumentasi project', '[{"name": "Project Guidelines.pdf", "url": "https://example.com/project-guidelines.pdf"}, {"name": "Template.zip", "url": "https://example.com/template.zip"}]'::jsonb, false);

-- 6. Test query untuk memastikan data tersimpan
SELECT * FROM days ORDER BY day_number;
