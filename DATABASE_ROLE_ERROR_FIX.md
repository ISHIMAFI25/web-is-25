# 🔧 Database Error Fix: users.role Column Missing

## ❌ Problem
When running `create_presensi_system.sql`, you get the error:
```
ERROR: 42703: column users.role does not exist
```

## ✅ Solution
The `users` table was created without a `role` column. The updated script now includes automatic role column creation.

## 🚀 Quick Fix

### Option 1: Run Updated Script (Recommended)
The `create_presensi_system.sql` has been updated to automatically:
1. ✅ Add `role` column if it doesn't exist
2. ✅ Set default role as 'student' for existing users
3. ✅ Create proper RLS policies with role checks

**Just run the updated script again in Supabase SQL Editor.**

### Option 2: Add Role Column Separately
If you prefer to add the role column separately:

1. **First run**: `database/add_user_roles.sql`
2. **Then run**: `database/create_presensi_system.sql`

## 👤 Creating Admin Users

After running the script, you need to create at least one admin user:

### Method 1: Update Existing User
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Method 2: Insert New Admin User
```sql
INSERT INTO users (username, email, nama_lengkap, role)
VALUES ('admin', 'admin@example.com', 'Administrator', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

## 🔍 Verify Setup

### Check if role column exists:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';
```

### Check user roles:
```sql
SELECT username, email, nama_lengkap, role 
FROM users;
```

### Test admin access:
```sql
SELECT * FROM attendance_sessions; -- Should work for admin users
```

## 📋 Updated Database Schema

### users table now includes:
```sql
role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student'))
```

### Role-based permissions:
- **admin**: Can manage attendance sessions, view all data, approve submissions
- **student**: Can submit attendance, view own data, see active sessions

## 🎯 Next Steps

1. ✅ Run the updated `create_presensi_system.sql`
2. ✅ Create at least one admin user
3. ✅ Test admin login and session creation
4. ✅ Test student attendance submission

## 🔧 Troubleshooting

### If you still get role-related errors:
1. **Check users table structure**:
   ```sql
   \d users
   ```

2. **Manually add role column**:
   ```sql
   ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';
   ```

3. **Update role constraints**:
   ```sql
   ALTER TABLE users ADD CONSTRAINT check_user_role 
   CHECK (role IN ('admin', 'student'));
   ```

### If RLS policies fail:
1. **Disable RLS temporarily**:
   ```sql
   ALTER TABLE attendance_sessions DISABLE ROW LEVEL SECURITY;
   ALTER TABLE presensi_data DISABLE ROW LEVEL SECURITY;
   ```

2. **Test basic functionality**
3. **Re-enable RLS after confirming tables work**:
   ```sql
   ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE presensi_data ENABLE ROW LEVEL SECURITY;
   ```

---

## ✅ Status: FIXED
The SQL script has been updated to handle missing role column automatically. 
Simply run the updated `create_presensi_system.sql` script!
