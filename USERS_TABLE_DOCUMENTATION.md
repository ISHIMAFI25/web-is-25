# Tabel Users - Dokumentasi

## Deskripsi
Tabel `users` dibuat untuk menyimpan informasi lengkap user yang dibuat oleh admin, terpisah dari sistem autentikasi Supabase.

## Struktur Tabel

```sql
CREATE TABLE public.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    supabase_user_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Kolom Tabel

| Kolom | Tipe Data | Deskripsi | Constraint |
|-------|-----------|-----------|------------|
| `id` | BIGSERIAL | ID unik untuk setiap record | PRIMARY KEY |
| `username` | VARCHAR(50) | Username user (min 3 karakter) | NOT NULL, UNIQUE |
| `email` | VARCHAR(255) | Email user (format: username@mahasiswa.itb.ac.id) | NOT NULL, UNIQUE |
| `nama_lengkap` | VARCHAR(255) | Nama lengkap user (min 2 karakter) | NOT NULL |
| `supabase_user_id` | VARCHAR(255) | ID referensi dari Supabase auth | UNIQUE |
| `created_at` | TIMESTAMPTZ | Waktu pembuatan record | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | Waktu terakhir update | DEFAULT NOW() |

## Index yang Dibuat

- `idx_users_username` - Index pada kolom username untuk pencarian cepat
- `idx_users_email` - Index pada kolom email
- `idx_users_supabase_id` - Index pada kolom supabase_user_id

## Constraint Validasi

- Username minimal 3 karakter
- Email harus dalam format valid
- Nama lengkap minimal 2 karakter

## Row Level Security (RLS)

Tabel ini menggunakan RLS dengan policy:
- `Allow admin insert` - Memungkinkan admin membuat user baru
- `Allow public select` - Memungkinkan semua user membaca data
- `Allow admin update` - Memungkinkan admin update data user

## Integrasi dengan Sistem

### 1. **Server Actions (actions.ts)**
- `createUser()` - Membuat user baru di Supabase auth + simpan ke tabel users
- `getAllUsers()` - Mengambil semua data user dari tabel
- `getUserByUsername()` - Mencari user berdasarkan username

### 2. **Admin Dashboard**
- Form pembuatan user baru (`AdminUserRegistrationForm`)
- List user yang sudah terdaftar (`UserList`)
- Auto-refresh list setelah user baru dibuat

### 3. **Drizzle Schema**
```typescript
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  nama_lengkap: varchar('nama_lengkap', { length: 255 }).notNull(),
  supabase_user_id: varchar('supabase_user_id', { length: 255 }).unique(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

## Cara Setup

### 1. **Jalankan SQL di Supabase**
```bash
# Buka Supabase Dashboard > SQL Editor
# Copy-paste isi file: database/create_users_table.sql
# Jalankan script
```

### 2. **Generate Drizzle Schema**
```bash
npm run db:generate
```

### 3. **Push ke Database**
```bash
npm run db:push
```

### 4. **Verifikasi**
```bash
# Jalankan: database/check_users_table_structure.sql
# Di Supabase SQL Editor untuk memastikan tabel sudah dibuat
```

## Flow Pembuatan User

1. Admin mengisi form di `/admin`
2. Data dikirim ke `createUser()` server action
3. User dibuat di Supabase auth dengan email: `{username}@mahasiswa.itb.ac.id`
4. Data user disimpan ke tabel `users` dengan `supabase_user_id`
5. Jika gagal simpan ke database, user di Supabase auth akan dihapus (rollback)
6. List user di admin dashboard ter-refresh otomatis

## Contoh Data

```sql
INSERT INTO users (username, email, nama_lengkap, supabase_user_id) VALUES
('john_doe', 'john_doe@mahasiswa.itb.ac.id', 'John Doe', 'uuid-from-supabase'),
('jane_smith', 'jane_smith@mahasiswa.itb.ac.id', 'Jane Smith', 'uuid-from-supabase');
```

## Maintenance

- Trigger `update_users_updated_at` otomatis update `updated_at` saat ada perubahan
- Gunakan `getAllUsers()` untuk backup data user
- Monitor constraint violations untuk data integrity
