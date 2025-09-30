# Setup Database untuk Fitur Countdown Lantik

## 🔒 **JAMINAN KEAMANAN DATA**
**TIDAK ADA DATA YANG AKAN DIHAPUS!** SQL ini hanya menambah 1 tabel baru untuk countdown settings. Semua data existing (user, tugas, presensi) tetap aman dan tidak tersentuh.

## ✨ **Mode Countdown Only Features:**
- **Background**: Menggunakan wallpaper-ryo.png yang sudah ada
- **Menu**: Hanya Home dan Profil yang dapat diakses  
- **Navigation**: Top navbar dengan link Home & Profil
- **Visual**: Countdown fullscreen dengan background overlay

---

Karena psql tidak tersedia di sistem ini, Anda perlu menjalankan SQL berikut di Supabase Dashboard:

## Langkah Setup:

1. **Buka Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Pilih project Anda
   - Masuk ke menu "SQL Editor"

2. **PENTING - Jangan copy dari file ini!**
   - Buka file: `setup_countdown_database.sql`
   - Copy seluruh isi file SQL tersebut
   - Paste di Supabase SQL Editor
   - Klik "Run"

**ATAU copy SQL berikut (tanpa markdown):**

```sql
-- Setup database untuk fitur countdown lantik
-- AMAN: Hanya menambah 1 tabel baru, TIDAK menyentuh data existing
CREATE TABLE IF NOT EXISTS countdown_settings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_time TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    show_only_countdown BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_countdown_settings_is_active ON countdown_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_countdown_settings_target_time ON countdown_settings(target_time);

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_countdown_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_countdown_settings_updated_at ON countdown_settings;
CREATE TRIGGER update_countdown_settings_updated_at
    BEFORE UPDATE ON countdown_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_countdown_settings_updated_at();
```

3. **Test dengan data contoh (opsional):**

Jika ingin test data, jalankan SQL tambahan ini:

```sql
-- Insert contoh countdown untuk testing (5 menit dari sekarang)
INSERT INTO countdown_settings (title, description, target_time, is_active, show_only_countdown)
VALUES 
('Test Countdown', 'Countdown test untuk melihat tampilan', NOW() + INTERVAL '5 minutes', true, false);
```

## Verifikasi Setup:

Setelah menjalankan SQL di atas, cek dengan query berikut:

```sql
-- Cek struktur tabel
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'countdown_settings';

-- Cek data
SELECT * FROM countdown_settings;
```

## 🎨 **Mode Countdown Only - Tampilan:**

Ketika admin mengaktifkan "Countdown Only":
- ✅ Background: wallpaper-ryo.png dengan dark overlay
- ✅ Top Navigation: Home | Profil
- ✅ Countdown: Fullscreen di tengah dengan glass effect
- ✅ Sidebar: Hanya menampilkan Home & Profil
- ✅ Data: Semua data tetap aman, hanya UI yang berubah

## URL Testing:

Setelah database setup selesai, Anda bisa test fitur dengan:

1. **Login sebagai admin** di: http://localhost:3000/login
2. **Akses menu Lantik** di: http://localhost:3000/admin/lantik
3. **Test API countdown** di: http://localhost:3000/api/countdown/status
4. **Buat countdown test** dengan waktu 5 menit ke depan
5. **Toggle "Countdown Only"** untuk test fullscreen mode

## Status Database Setup:

- ✅ File SQL siap: `setup_countdown_database.sql`
- ✅ File SQL juga ada di: `database/create_countdown_settings_table.sql`
- ⏳ **PENDING**: Perlu dijalankan di Supabase Dashboard
- ✅ Aplikasi siap untuk fitur countdown
- ✅ Server berjalan di: http://localhost:3000
- ✅ Background wallpaper-ryo.png sudah ada
- ✅ Menu Home & Profil sudah dikonfigurasi

## 🛡️ **Data Safety:**

Baca `DATA_SAFETY_GUARANTEE.md` untuk penjelasan lengkap bahwa tidak ada data yang akan terhapus atau dimodifikasi.