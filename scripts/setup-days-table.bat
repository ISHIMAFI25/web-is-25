@echo off
echo 🗄️ Setting up Days Table...
echo.

echo ⚠️  IMPORTANT: Run this SQL script in your Supabase Dashboard!
echo.
echo 📋 To setup the days table:
echo    1. Go to your Supabase Dashboard
echo    2. Navigate to SQL Editor
echo    3. Copy and paste the content from: database\create_days_table.sql
echo    4. Execute the SQL script
echo.

pause

echo.
echo 🧪 Testing days table connection...
node -e "
const { createClient } = require('@supabase/supabase-js');

async function testDaysTable() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔍 Checking days table...');
    const { data: days, error: daysError } = await supabase
      .from('days')
      .select('*')
      .limit(1);
    
    if (daysError) {
      console.log('❌ days table error:', daysError.message);
      console.log('   Code:', daysError.code);
      console.log('   Details:', daysError.details);
      console.log('   Hint:', daysError.hint);
      
      if (daysError.code === 'PGRST205') {
        console.log('\\n💡 Table not found!');
        console.log('   Please run: database/create_days_table.sql in Supabase SQL Editor');
      }
      return;
    }
    
    console.log('✅ days table exists and accessible');
    console.log('📊 Sample data found:', days?.length || 0, 'records');
    
    // Test API endpoint
    console.log('\\n🔍 Testing /api/days endpoint...');
    const response = await fetch('http://localhost:3000/api/days');
    const apiData = await response.json();
    
    if (response.ok) {
      console.log('✅ API endpoint working');
      console.log('📊 API returned:', apiData.days?.length || 0, 'visible days');
    } else {
      console.log('❌ API endpoint error:', apiData.error);
    }
    
    console.log('\\n🎉 Days table setup test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\\n💡 Please check:');
    console.log('   1. .env file has correct SUPABASE credentials');
    console.log('   2. days table has been created');
    console.log('   3. Development server is running on localhost:3000');
  }
}

testDaysTable();
"

echo.
echo 🚀 If test passed, your days table is ready!
echo 📱 You can now:
echo    - View days information on your website
echo    - Manage days visibility from admin panel
echo    - Add/edit day details and attachments
echo.
pause
