-- SQL untuk membuat tabel submissions tugas
-- Tabel ini akan menyimpan submission tugas dari mahasiswa

CREATE TABLE task_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_email VARCHAR(255) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    task_day INTEGER NOT NULL,
    submission_file_url TEXT NOT NULL,
    submission_file_name VARCHAR(255) NOT NULL,
    submission_file_type VARCHAR(50) NOT NULL,
    is_submitted BOOLEAN DEFAULT true,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa query
CREATE INDEX idx_task_submissions_student_email ON task_submissions(student_email);
CREATE INDEX idx_task_submissions_task_id ON task_submissions(task_id);
CREATE INDEX idx_task_submissions_task_day ON task_submissions(task_day);

-- Constraint untuk mencegah double submission dari student yang sama untuk task yang sama
CREATE UNIQUE INDEX idx_unique_student_task ON task_submissions(student_email, task_id);

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_task_submissions_updated_at 
    BEFORE UPDATE ON task_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Query untuk melihat semua submissions
-- SELECT * FROM task_submissions ORDER BY submitted_at DESC;

-- Query untuk melihat submissions berdasarkan task_id
-- SELECT * FROM task_submissions WHERE task_id = 'task-0' ORDER BY submitted_at DESC;

-- Query untuk check apakah student sudah submit untuk task tertentu
-- SELECT EXISTS(SELECT 1 FROM task_submissions WHERE student_email = 'email@example.com' AND task_id = 'task-0');
