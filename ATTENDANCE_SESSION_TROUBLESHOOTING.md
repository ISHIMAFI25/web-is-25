# 🚨 Troubleshooting: "Gagal membuat sesi presensi baru"

## ❌ Problem
Ketika mencoba membuat sesi presensi baru dari admin dashboard, muncul error:
**"Gagal membuat sesi presensi baru"**

## 🔍 Possible Causes & Solutions

### 1. **Database Table Missing/Incomplete**

#### ✅ Quick Check
```bash
# Run database debugging script
scripts\debug-database.bat
```

#### ✅ Solution A: Create Tables
If tables don't exist, run in Supabase SQL Editor:
```sql
-- Copy and paste content from:
database/create_presensi_system.sql
```

#### ✅ Solution B: Add Missing Columns
If table exists but missing columns:
```sql
-- Copy and paste content from:
database/update_attendance_sessions.sql
```

### 2. **Missing Role Column in Users Table**

#### ✅ Symptoms
- Error in console: "column users.role does not exist" 
- RLS policies failing

#### ✅ Solution
Run in Supabase SQL Editor:
```sql
-- Copy and paste content from:
database/add_user_roles.sql
```

### 3. **User Not Admin**

#### ✅ Check Current User Role
```sql
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```

#### ✅ Make User Admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 4. **Environment Variables Issues**

#### ✅ Check .env File
Make sure these are set correctly:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### ✅ Test Connection
```javascript
// In browser console at localhost:3000/admin
fetch('/api/attendance-sessions')
  .then(r => r.json())
  .then(console.log)
```

### 5. **RLS (Row Level Security) Issues**

#### ✅ Temporary Disable RLS for Testing
```sql
ALTER TABLE attendance_sessions DISABLE ROW LEVEL SECURITY;
-- Test creating session
-- Re-enable after:
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
```

### 6. **Duplicate Day Number**

#### ✅ Symptoms
- Error message mentions day number already exists

#### ✅ Solution
Use a different day number or delete existing session:
```sql
DELETE FROM attendance_sessions WHERE day_number = X;
```

### 7. **Network/CORS Issues**

#### ✅ Check Browser Console
Look for network errors in developer tools

#### ✅ Check API Response
```javascript
// Test API directly
fetch('/api/attendance-sessions', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dayNumber: 1,
    dayTitle: 'Test Day',
    adminEmail: 'admin@example.com'
  })
})
.then(r => r.text())
.then(console.log)
```

## 🔧 Step-by-Step Fix

### Step 1: Run Database Debug
```bash
scripts\debug-database.bat
```

### Step 2: Fix Database Issues
Based on debug results:
- Missing tables → Run `create_presensi_system.sql`
- Missing columns → Run `update_attendance_sessions.sql`  
- Missing role → Run `add_user_roles.sql`

### Step 3: Create Admin User
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Step 4: Test API Directly
```javascript
// In browser console
fetch('/api/attendance-sessions', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dayNumber: 999,
    dayTitle: 'Test Session',
    adminEmail: 'your-email@example.com'
  })
})
.then(r => r.json())
.then(console.log)
```

### Step 5: Check Admin Dashboard
- Login as admin user
- Try creating session again
- Check browser console for any errors

## 🚀 Prevention

### Database Schema Validation
Ensure your `attendance_sessions` table has these columns:
```sql
-- Required columns:
id                BIGSERIAL PRIMARY KEY
day_number        INTEGER NOT NULL UNIQUE  
day_title         TEXT NOT NULL
is_active         BOOLEAN DEFAULT FALSE
start_time        TIMESTAMPTZ
end_time          TIMESTAMPTZ
created_by        TEXT NOT NULL
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
```

### User Role Validation
Ensure your `users` table has:
```sql
-- Required column:
role              TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student'))
```

### Regular Maintenance
1. **Monitor logs** for database errors
2. **Test API endpoints** regularly
3. **Backup database** before schema changes
4. **Keep environment variables** secure and updated

---

## ✅ Expected Result
After following these steps:
- ✅ Admin can create new attendance sessions
- ✅ Sessions appear in the admin dashboard  
- ✅ No "Gagal membuat sesi presensi baru" errors
- ✅ Database operations work smoothly

## 📞 Still Having Issues?

If none of these solutions work:
1. **Check server logs** for detailed error messages
2. **Verify Supabase dashboard** for any service issues
3. **Test with a fresh database** setup
4. **Examine network requests** in browser dev tools
