// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Pastikan environment variables ini sudah ada di file .env kamu
// NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-public-key]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

// Membuat instance Supabase Client dengan konfigurasi untuk session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});