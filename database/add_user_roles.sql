-- Add role column to existing users table
-- Run this if your users table already exists without role column

-- Add role column with default value
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student'));

-- Update existing users to have default role if they don't have one
UPDATE users SET role = 'student' WHERE role IS NULL;

-- Create an admin user example (modify email as needed)
-- Uncomment and modify the email below to create your first admin user
/*
UPDATE users 
SET role = 'admin'  
WHERE email = 'your-admin-email@example.com';
*/

-- Or insert a new admin user if needed
-- Uncomment and modify the details below
/*
INSERT INTO users (username, email, nama_lengkap, role)
VALUES ('admin', 'admin@example.com', 'Administrator', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
*/

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Role column added to users table successfully!';
    RAISE NOTICE '👤 All existing users set to "student" role';
    RAISE NOTICE '🔧 Uncomment and modify admin user creation if needed';
END $$;
