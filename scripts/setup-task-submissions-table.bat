@echo off
echo 🗄️ Setting up Task Submissions Table...
echo.

echo ⚠️  IMPORTANT: Run this SQL script in your Supabase Dashboard!
echo.
echo 📋 To setup the task_submissions table:
echo    1. Go to your Supabase Dashboard
echo    2. Navigate to SQL Editor
echo    3. Copy and paste the content from: database\create_task_submissions_table.sql
echo    4. Execute the SQL script
echo.
echo ⚠️  NOTE: This will DROP existing task_submissions table if it exists!
echo    Make sure to backup any important data first.
echo.

pause

echo.
echo 🧪 Testing task_submissions table connection...
node -e "
const { createClient } = require('@supabase/supabase-js');

async function testTaskSubmissionsTable() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔍 Checking task_submissions table...');
    const { data: submissions, error: submissionsError } = await supabase
      .from('task_submissions')
      .select('*')
      .limit(1);
    
    if (submissionsError) {
      console.log('❌ task_submissions table error:', submissionsError.message);
      console.log('   Code:', submissionsError.code);
      console.log('   Details:', submissionsError.details);
      console.log('   Hint:', submissionsError.hint);
      
      if (submissionsError.code === 'PGRST204') {
        console.log('\\n💡 Column not found error!');
        console.log('   Please run: database/create_task_submissions_table.sql in Supabase SQL Editor');
      }
      if (submissionsError.code === 'PGRST116') {
        console.log('\\n💡 Table not found error!');
        console.log('   Please run: database/create_task_submissions_table.sql in Supabase SQL Editor');
      }
      return;
    }
    
    console.log('✅ task_submissions table exists and accessible');
    console.log('📊 Sample data found:', submissions?.length || 0, 'records');
    
    // Test specific column that was causing error
    console.log('\\n🔍 Testing submission_status column...');
    const { data: statusTest, error: statusError } = await supabase
      .from('task_submissions')
      .select('submission_status')
      .limit(1);
    
    if (statusError) {
      console.log('❌ submission_status column error:', statusError.message);
    } else {
      console.log('✅ submission_status column working properly');
    }
    
    // Test API endpoints
    console.log('\\n🔍 Testing task submission APIs...');
    
    // Test submit-task endpoint
    const submitResponse = await fetch('http://localhost:3000/api/submit-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentEmail: 'test@example.com',
        studentName: 'Test Student',
        taskId: 'test-task-123',
        taskDay: 1,
        submissionType: 'link',
        submissionLink: 'https://github.com/test/repo'
      })
    });
    
    if (submitResponse.ok) {
      console.log('✅ Submit task API working');
    } else {
      const errorData = await submitResponse.json();
      console.log('❌ Submit task API error:', errorData.error);
    }
    
    console.log('\\n🎉 Task submissions table test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\\n💡 Please check:');
    console.log('   1. .env file has correct SUPABASE credentials');
    console.log('   2. task_submissions table has been created');
    console.log('   3. Development server is running on localhost:3000');
  }
}

testTaskSubmissionsTable();
"

echo.
echo 🚀 If test passed, your task submissions table is ready!
echo 📱 You can now:
echo    - Submit tasks (file or link)
echo    - Save drafts
echo    - Check submission status
echo    - View submissions in admin panel
echo.
pause
