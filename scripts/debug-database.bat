@echo off
echo 🔍 Debugging Presensi System Database...
echo.

echo 📋 Testing database connection and table structure...

node -e "
const { createClient } = require('@supabase/supabase-js');

async function debugDatabase() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔗 Testing Supabase connection...');
    
    // Test 1: Check if attendance_sessions table exists
    console.log('\\n📋 Checking attendance_sessions table...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .limit(1);
    
    if (sessionsError) {
      console.log('❌ attendance_sessions table error:', sessionsError.message);
      console.log('   Code:', sessionsError.code);
      console.log('   Details:', sessionsError.details);
      console.log('   Hint:', sessionsError.hint);
      return;
    }
    
    console.log('✅ attendance_sessions table exists');
    
    // Test 2: Try to create a test session
    console.log('\\n🧪 Testing session creation...');
    const { data: newSession, error: createError } = await supabase
      .from('attendance_sessions')
      .insert({
        day_number: 999,
        day_title: 'Test Session - Delete Me',
        is_active: false,
        created_by: 'test@admin.com'
      })
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Error creating session:', createError.message);
      console.log('   Code:', createError.code);
      console.log('   Details:', createError.details);
      console.log('   Hint:', createError.hint);
      
      // Check for specific errors
      if (createError.code === '42703') {
        console.log('\\n💡 Column missing error detected!');
        console.log('   Please run: database/update_attendance_sessions.sql');
      }
      if (createError.code === '42P01') {
        console.log('\\n💡 Table missing error detected!');
        console.log('   Please run: database/create_presensi_system.sql');
      }
      return;
    }
    
    console.log('✅ Session creation successful:', newSession);
    
    // Test 3: Clean up test session
    console.log('\\n🧹 Cleaning up test session...');
    const { error: deleteError } = await supabase
      .from('attendance_sessions')
      .delete()
      .eq('id', newSession.id);
    
    if (deleteError) {
      console.log('⚠️  Warning: Could not delete test session:', deleteError.message);
    } else {
      console.log('✅ Test session cleaned up');
    }
    
    // Test 4: Check users table with role
    console.log('\\n👤 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, role')
      .limit(1);
    
    if (usersError) {
      console.log('❌ users table error:', usersError.message);
      if (usersError.code === '42703' && usersError.message.includes('role')) {
        console.log('\\n💡 Role column missing!');
        console.log('   Please run: database/add_user_roles.sql');
      }
    } else {
      console.log('✅ users table with role column exists');
    }
    
    console.log('\\n🎉 Database debugging complete!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('\\n💡 Please check:');
    console.log('   1. .env file has correct SUPABASE credentials');
    console.log('   2. Database tables have been created');
    console.log('   3. Network connection is working');
  }
}

debugDatabase();
"

echo.
echo 💡 If you see errors above, follow the suggested fixes:
echo    - Run database/create_presensi_system.sql for missing tables
echo    - Run database/update_attendance_sessions.sql for missing columns  
echo    - Run database/add_user_roles.sql for missing role column
echo.
pause
