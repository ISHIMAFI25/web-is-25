// src/app/actions.ts
'use server';

// Import Supabase Client yang aman untuk Server Component
import { createClient } from '@supabase/supabase-js';

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

    console.log('User created successfully:', data.user);
    return { success: true };

  } catch (e: any) {
    console.error('Server action error:', e);
    return { error: 'Terjadi kesalahan internal pada server.' };
  }
}
