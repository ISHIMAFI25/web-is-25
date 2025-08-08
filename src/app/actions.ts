// src/app/actions.ts
'use server';

// Import Supabase Client yang aman untuk Server Component
import { createClient } from '@supabase/supabase-js';
// Import Drizzle untuk operasi database
import { db } from '@/lib/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Klien Supabase untuk Server Component dengan Service Role Key
// Variabel ini HARUS ada di file .env kamu dan tidak boleh diekspos ke klien
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

interface CreateUserParams {
  username: string;
  password?: string;
  namaLengkap: string;
}

// Fungsi Server Action untuk membuat user baru
export async function createUser({ username, password, namaLengkap }: CreateUserParams) {
  try {
    // Supabase memerlukan email, jadi kita buat email dummy dari username
    // Ganti 'namadomainmu.com' dengan domain yang relevan untuk proyekmu.
    const email = `${username}@mahasiswa.itb.ac.id`; 

    // 1. Buat user di Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Otomatis mengkonfirmasi email
      user_metadata: {
        username,
        namaLengkap, // simpan nama lengkap di metadata
      },
    });

    if (error) {
      console.error('Supabase create user error:', error);
      return { error: error.message };
    }

    // 2. Simpan informasi user ke tabel users di database
    try {
      await db.insert(users).values({
        username,
        email,
        nama_lengkap: namaLengkap,
        supabase_user_id: data.user.id,
      });
      
      console.log('User created successfully:', data.user);
      console.log('User data saved to database');
      
    } catch (dbError: unknown) {
      console.error('Database insert error:', dbError);
      
      // Jika gagal simpan ke database, hapus user dari Supabase Auth untuk konsistensi
      try {
        await supabaseAdmin.auth.admin.deleteUser(data.user.id);
        console.log('Rolled back Supabase user creation due to database error');
      } catch (rollbackError) {
        console.error('Failed to rollback user creation:', rollbackError);
      }
      
      return { error: 'Gagal menyimpan data user ke database' };
    }

    return { success: true, user: data.user };

  } catch (e: unknown) {
    console.error('Server action error:', e);
    return { error: 'Terjadi kesalahan internal pada server.' };
  }
}

// Fungsi untuk mengambil semua user dari database
export async function getAllUsers() {
  try {
    const allUsers = await db.select().from(users);
    return { success: true, users: allUsers };
  } catch (error: unknown) {
    console.error('Get users error:', error);
    return { error: 'Gagal mengambil data user' };
  }
}

// Fungsi untuk mengambil user berdasarkan username
export async function getUserByUsername(username: string) {
  try {
    const user = await db.select().from(users).where(eq(users.username, username));
    return { success: true, user: user[0] || null };
  } catch (error: unknown) {
    console.error('Get user by username error:', error);
    return { error: 'Gagal mengambil data user' };
  }
}

// Fungsi untuk mengubah password user
export async function updateUserPassword(userEmail: string, currentPassword: string, newPassword: string) {
  try {
    // Validasi password baru
    if (!newPassword || newPassword.length < 6) {
      return { error: 'Password baru harus minimal 6 karakter' };
    }

    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabaseAdmin.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (verifyError) {
      return { error: 'Password lama tidak benar' };
    }

    // Get user by email to get the user ID
    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (getUserError) {
      return { error: 'Gagal mendapatkan data user' };
    }

    const targetUser = userData.users.find(u => u.email === userEmail);
    
    if (!targetUser) {
      return { error: 'User tidak ditemukan' };
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Update password error:', updateError);
      return { error: 'Gagal mengubah password' };
    }

    return { success: true };

  } catch (error: unknown) {
    console.error('Update password error:', error);
    return { error: 'Terjadi kesalahan sistem' };
  }
}
