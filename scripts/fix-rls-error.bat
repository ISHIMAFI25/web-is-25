@echo off
echo 🔧 Quick Fix: RLS Policy Error untuk Task Submissions
echo.

echo ❌ Error yang terjadi:
echo    "new row violates row-level security policy for table task_submissions"
echo.

echo 💡 Solusi Cepat - Pilih salah satu:
echo.
echo    1. DISABLE RLS sementara (paling mudah untuk development)
echo    2. Buat policies yang lebih permisif
echo    3. Debug authentication issue
echo.

echo ⚠️  REKOMENDASI: Gunakan opsi 1 untuk development
echo.

pause

echo.
echo 🚀 Menjalankan quick fix...
echo.

node -e "
const { createClient } = require('@supabase/supabase-js');

async function quickFixRLS() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔧 Disabling RLS for task_submissions table...');
    
    // Disable RLS for development
    const { data, error } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.task_submissions DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.log('❌ SQL execution failed:', error.message);
      console.log('\\n💡 Manual fix required:');
      console.log('   1. Go to Supabase Dashboard > SQL Editor');
      console.log('   2. Run: ALTER TABLE public.task_submissions DISABLE ROW LEVEL SECURITY;');
      return;
    }
    
    console.log('✅ RLS disabled successfully');
    
    // Test task submission now
    console.log('\\n🧪 Testing task submission...');
    
    const testResponse = await fetch('http://localhost:3000/api/submit-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentEmail: 'test@example.com',
        studentName: 'Test Student',
        taskId: 'test-task-rls-fix',
        taskDay: 1,
        submissionType: 'link',
        submissionLink: 'https://github.com/test/repo'
      })
    });
    
    if (testResponse.ok) {
      const result = await testResponse.json();
      console.log('✅ Task submission working!', result);
    } else {
      const errorData = await testResponse.json();
      console.log('❌ Still having issues:', errorData.error);
    }
    
    console.log('\\n🎉 Quick fix complete!');
    console.log('\\n⚠️  Important notes:');
    console.log('   - RLS is now DISABLED for task_submissions');
    console.log('   - This is OK for development');
    console.log('   - Enable RLS before production deployment');
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error.message);
    console.log('\\n🔧 Manual steps:');
    console.log('   1. Go to Supabase Dashboard');
    console.log('   2. SQL Editor');
    console.log('   3. Run: ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;');
  }
}

quickFixRLS();
"

echo.
echo 🎯 Manual Fix (jika script gagal):
echo.
echo    1. Buka Supabase Dashboard
echo    2. Masuk ke SQL Editor  
echo    3. Jalankan command ini:
echo       ALTER TABLE task_submissions DISABLE ROW LEVEL SECURITY;
echo.
echo    4. Test submit tugas lagi
echo.

pause
