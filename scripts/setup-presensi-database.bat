@echo off
echo 🗄️ Setting up Presensi System Database...
echo.

echo ⚠️  IMPORTANT: Make sure you have run the SQL script in Supabase first!
echo.
echo 📋 To setup the database:
echo    1. Go to your Supabase Dashboard
echo    2. Navigate to SQL Editor
echo    3. Copy and paste the content from: database\create_presensi_system.sql
echo    4. Execute the SQL script
echo.
echo 🔗 Database Setup Files:
echo    - database\create_presensi_system.sql (Main presensi system tables)
echo    - database\create_users_table.sql (Users table if not exists)
echo.

pause

echo.
echo 🧪 Testing database connection...
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
  try {
    console.log('🔍 Checking attendance_sessions table...');
    const { data: sessions, error: sessionsError } = await client
      .from('attendance_sessions')
      .select('*')
      .limit(1);
    
    if (sessionsError) {
      console.log('❌ attendance_sessions table not found or accessible');
      console.log('   Error:', sessionsError.message);
      return;
    }
    
    console.log('✅ attendance_sessions table exists');
    
    console.log('🔍 Checking presensi_data table...');
    const { data: presensi, error: presensiError } = await client
      .from('presensi_data')
      .select('*')
      .limit(1);
    
    if (presensiError) {
      console.log('❌ presensi_data table not found or accessible');
      console.log('   Error:', presensiError.message);
      return;
    }
    
    console.log('✅ presensi_data table exists');
    console.log('');
    console.log('🎉 Database setup successful!');
    console.log('📊 Your presensi system is ready to use.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('');
    console.log('💡 Please make sure:');
    console.log('   1. You have executed the SQL script in Supabase');
    console.log('   2. Your .env file has correct SUPABASE credentials');
    console.log('   3. The tables have been created with proper permissions');
  }
}

testConnection();
"

echo.
echo 🚀 If database test passed, your presensi system is ready!
echo 📱 You can now:
echo    - Create attendance sessions in Admin panel
echo    - Activate sessions for student submissions
echo    - View and manage attendance data
echo.
pause
