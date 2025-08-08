-- Insert sample data for testing days functionality
-- This will create sample days with different statuses for testing

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

-- Update the updated_at timestamp for all inserted records
UPDATE days SET updated_at = NOW();
