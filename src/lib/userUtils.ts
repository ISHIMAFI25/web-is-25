import { User } from '@supabase/supabase-js';

/**
 * Utility function untuk mengekstrak nama lengkap user dari object Supabase User
 */
export function extractUserFullName(user: User | null): string {
  if (!user) return 'User';

  // Priority order untuk mencari nama:
  // 1. user_metadata.namaLengkap (field custom yang digunakan di profil)
  // 2. user_metadata.full_name
  // 3. user_metadata.name  
  // 4. user_metadata.display_name
  // 5. identities[0].identity_data.full_name
  // 6. identities[0].identity_data.name
  // 7. identities[0].identity_data.display_name
  // 8. email local part (before @)
  // 9. fallback 'User'

  const metadata = user.user_metadata || {};
  const identity = user.identities?.[0]?.identity_data || {};

  return (
    metadata.namaLengkap ||
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    identity.full_name ||
    identity.name ||
    identity.display_name ||
    user.email?.split('@')[0] ||
    'User'
  );
}

/**
 * Utility function untuk mengekstrak username dari object Supabase User
 */
export function extractUserUsername(user: User | null): string {
  if (!user) return 'user';

  const metadata = user.user_metadata || {};
  const identity = user.identities?.[0]?.identity_data || {};

  return (
    metadata.username ||
    metadata.preferred_username ||
    identity.username ||
    identity.preferred_username ||
    user.email?.split('@')[0] ||
    user.email ||
    'user'
  );
}

/**
 * Debug function untuk melihat semua data user yang tersedia
 */
export function debugUserData(user: User | null): void {
  if (!user) {
    console.log('User is null or undefined');
    return;
  }

  console.log('=== USER DEBUG INFO ===');
  console.log('Email:', user.email);
  console.log('User Metadata:', user.user_metadata);
  console.log('- namaLengkap:', user.user_metadata?.namaLengkap);
  console.log('- full_name:', user.user_metadata?.full_name);
  console.log('- name:', user.user_metadata?.name);
  console.log('- username:', user.user_metadata?.username);
  console.log('Identities:', user.identities);
  console.log('App Metadata:', user.app_metadata);
  console.log('Extracted Full Name:', extractUserFullName(user));
  console.log('Extracted Username:', extractUserUsername(user));
  console.log('======================');
}
