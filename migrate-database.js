// Database migration script
// Run this to add missing columns to task_submissions table

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lmvcfrtzescnsrqvyspq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdmNmcnR6ZXNjbnNycXZ5c3BxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ3MDY5NywiZXhwIjoyMDcwMDQ2Njk3fQ.fBlEJQqPvedO_zSxyiOEInRvodC8PW1seWik8W-PkKE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔧 Starting database migration...');
    
    // Add missing columns using raw SQL
    const migrationSQL = `
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
    `;

    const { data, error } = await supabase.rpc('execute_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('Added columns:');
    console.log('  - is_submitted (boolean)');
    console.log('  - submission_file_name (text)');
    console.log('  - submission_file_type (text)');
    console.log('  - submitted_at (timestamptz)');
    console.log('  - created_at (timestamptz)');
    console.log('  - updated_at (timestamptz)');
    console.log('  - Added index on (student_email, task_id)');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

runMigration();
