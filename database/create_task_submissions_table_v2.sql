-- Create task_submissions table for web-is-25 (Updated Version)
-- File: database/create_task_submissions_table.sql
-- Last updated: August 9, 2025

-- Drop table if exists (untuk clean start)
DROP TABLE IF EXISTS public.task_submissions CASCADE;

-- Create new task_submissions table
CREATE TABLE public.task_submissions (
  id BIGSERIAL PRIMARY KEY,
  student_email VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  task_id VARCHAR(255) NOT NULL,
  task_day INTEGER NOT NULL,
  submission_type VARCHAR(50) CHECK (submission_type IN ('file', 'link', 'both')),
  submission_file_url TEXT,
  submission_file_name TEXT,
  submission_file_type TEXT,
  submission_link TEXT,
  submission_status VARCHAR(50) DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted')),
  is_submitted BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: One submission per student per task
  UNIQUE(student_email, task_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_submissions_student_email ON public.task_submissions(student_email);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON public.task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_student_task ON public.task_submissions(student_email, task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_day ON public.task_submissions(task_day);
CREATE INDEX IF NOT EXISTS idx_task_submissions_status ON public.task_submissions(submission_status);
CREATE INDEX IF NOT EXISTS idx_task_submissions_submitted ON public.task_submissions(is_submitted) WHERE is_submitted = true;
CREATE INDEX IF NOT EXISTS idx_task_submissions_type ON public.task_submissions(submission_type);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_task_submissions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_task_submissions_updated_at ON public.task_submissions;
CREATE TRIGGER update_task_submissions_updated_at
    BEFORE UPDATE ON public.task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_task_submissions_updated_at_column();

-- Disable RLS for development (enable in production)
ALTER TABLE public.task_submissions DISABLE ROW LEVEL SECURITY;

-- RLS Policies (commented out for development, uncomment for production)
/*
-- Enable Row Level Security (RLS)
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

-- Students can view own submissions
DROP POLICY IF EXISTS "Students can view own submissions" ON public.task_submissions;
CREATE POLICY "Students can view own submissions" ON public.task_submissions
    FOR SELECT USING (
        student_email = auth.jwt() ->> 'email' OR
        student_email = (auth.jwt() ->> 'user_metadata')::json ->> 'email'
    );

-- Students can insert own submissions
DROP POLICY IF EXISTS "Students can insert own submissions" ON public.task_submissions;
CREATE POLICY "Students can insert own submissions" ON public.task_submissions
    FOR INSERT WITH CHECK (
        student_email = auth.jwt() ->> 'email' OR
        student_email = (auth.jwt() ->> 'user_metadata')::json ->> 'email'
    );

-- Students can update own submissions
DROP POLICY IF EXISTS "Students can update own submissions" ON public.task_submissions;
CREATE POLICY "Students can update own submissions" ON public.task_submissions
    FOR UPDATE USING (
        student_email = auth.jwt() ->> 'email' OR
        student_email = (auth.jwt() ->> 'user_metadata')::json ->> 'email'
    );

-- Admin can view all submissions
DROP POLICY IF EXISTS "Admin can view all submissions" ON public.task_submissions;
CREATE POLICY "Admin can view all submissions" ON public.task_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- Admin can manage all submissions
DROP POLICY IF EXISTS "Admin can manage all submissions" ON public.task_submissions;
CREATE POLICY "Admin can manage all submissions" ON public.task_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );
*/

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_submissions TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert sample data (optional for testing)
INSERT INTO public.task_submissions (
  student_email, 
  student_name, 
  task_id, 
  task_day, 
  submission_type, 
  submission_link, 
  submission_status, 
  is_submitted,
  submitted_at
) VALUES 
  ('student1@example.com', 'Student Test 1', 'task-1-sample', 1, 'link', 'https://github.com/student1/project', 'submitted', true, NOW()),
  ('student2@example.com', 'Student Test 2', 'task-1-sample', 1, 'file', null, 'draft', false, null),
  ('student3@example.com', 'Student Test 3', 'task-0-sample', 0, 'both', 'https://github.com/student3/project', 'submitted', true, NOW())
ON CONFLICT (student_email, task_id) DO NOTHING;

-- Test all submission types
DO $$
BEGIN
    -- Test insertion with all allowed submission_type values
    INSERT INTO public.task_submissions (
        student_email, student_name, task_id, task_day, submission_type, submission_status, is_submitted
    ) VALUES 
        ('test-file@example.com', 'Test File User', 'test-file-123', 1, 'file', 'draft', false),
        ('test-link@example.com', 'Test Link User', 'test-link-123', 1, 'link', 'submitted', true),
        ('test-both@example.com', 'Test Both User', 'test-both-123', 1, 'both', 'submitted', true)
    ON CONFLICT (student_email, task_id) DO NOTHING;
    
    RAISE NOTICE '✅ All submission types tested successfully';
    
    -- Clean up test data
    DELETE FROM public.task_submissions WHERE task_id LIKE 'test-%';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Task submissions table created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Table Structure:';
    RAISE NOTICE '   ├── id (bigserial, primary key)';
    RAISE NOTICE '   ├── student_email (varchar, not null)';
    RAISE NOTICE '   ├── student_name (varchar, not null)';
    RAISE NOTICE '   ├── task_id (varchar, not null)';
    RAISE NOTICE '   ├── task_day (integer, not null)';
    RAISE NOTICE '   ├── submission_type (varchar: file/link/both) ✅';
    RAISE NOTICE '   ├── submission_file_url (text)';
    RAISE NOTICE '   ├── submission_file_name (text)';
    RAISE NOTICE '   ├── submission_file_type (text)';
    RAISE NOTICE '   ├── submission_link (text)';
    RAISE NOTICE '   ├── submission_status (varchar: draft/submitted)';
    RAISE NOTICE '   ├── is_submitted (boolean)';
    RAISE NOTICE '   ├── submitted_at (timestamptz)';
    RAISE NOTICE '   ├── created_at (timestamptz, auto)';
    RAISE NOTICE '   └── updated_at (timestamptz, auto)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Features:';
    RAISE NOTICE '   ✅ RLS disabled for development';
    RAISE NOTICE '   ✅ Check constraints allow "both" submission type';
    RAISE NOTICE '   ✅ Unique constraint (student_email, task_id)';
    RAISE NOTICE '   ✅ Auto-updating timestamps';
    RAISE NOTICE '   ✅ Performance indexes created';
    RAISE NOTICE '   ✅ Sample data inserted';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for task submissions!';
    RAISE NOTICE '   • Submit file: submission_type = "file"';
    RAISE NOTICE '   • Submit link: submission_type = "link"';
    RAISE NOTICE '   • Submit both: submission_type = "both"';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Note: RLS is DISABLED for development';
    RAISE NOTICE '   Enable RLS policies before production deployment';
END $$;
