// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Pastikan environment variables ini sudah ada di file .env kamu
// NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-public-key]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Membuat instance Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);